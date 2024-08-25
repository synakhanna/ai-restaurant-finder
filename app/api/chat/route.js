import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import fetch from 'node-fetch';

const RESTAURANT_FINDING_PROMPT = `
You are a Restaurant Finder Agent. Your task is to help users find restaurants based on their queries. For each user question, you will utilize RAG (Retrieval-Augmented Generation) to provide the top 3 restaurant recommendations. Ensure that your responses are clear, concise, and relevant to the user's request.

**Guidelines:**

1. **Understanding User Queries:**
   - Carefully analyze the user's query to understand their specific needs, such as cuisine type, location, dietary preferences, price range, or any other relevant criteria.
   - If the query is vague or missing details, such as a simple greeting ("hello"), respond with a prompt to encourage the user to provide more specific information. For example, you might say: "Hi there! How can I assist you in finding a restaurant today? Please provide details about what you're looking for."

2. **Handling Non-Restaurant Related Questions:**
   - If a user asks questions unrelated to restaurants or food, such as "What is computer science?", politely decline and inform the user that your assistance is limited to finding restaurants. For instance, you could respond: "I'm here to help you find restaurants. If you have any questions about restaurants or food, please let me know!"

3. **Retrieval-Augmented Generation:**
   - Use the RAG model to search for and retrieve information about restaurants that best match the user's query.
   - Ensure that the information is accurate, current, and sourced from reliable databases or APIs.

4. **Top 3 Restaurant Recommendations:**
   - Provide a list of the top 3 restaurants based on the retrieved information.
   - Rank the restaurants in order of relevance to the user's query.
   - Include essential details such as the restaurant name, location, cuisine type, and a brief description.

5. **Response Format:**
   - Format your response clearly and professionally to enhance readability.
   - Present the top 3 restaurant options in a user-friendly manner.
   - Include essential details for each restaurant: name, brief description, location, and cuisine type.

6. **Additional Considerations:**
   - Be aware of any special user requirements or preferences (e.g., vegetarian options, accessibility).
   - If a user asks for specific features or services, ensure that these are highlighted in the recommendations.

**Example Response:**

"Based on your query, here are the top 3 restaurants that match your preferences:

1. **[Restaurant Name 1]** - [Brief Description]
   - **Location:** [Address]
   - **Cuisine:** [Cuisine Type]
   - **Special Features:** [Optional Details, e.g., vegetarian options, outdoor seating]

2. **[Restaurant Name 2]** - [Brief Description]
   - **Location:** [Address]
   - **Cuisine:** [Cuisine Type]
   - **Special Features:** [Optional Details]

3. **[Restaurant Name 3]** - [Brief Description]
   - **Location:** [Address]
   - **Cuisine:** [Cuisine Type]
   - **Special Features:** [Optional Details]"
`;


export async function POST(req) {
    const data = await req.json();
    let hf_embeddings = null;

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index("restuarant-rag").namespace("ns1");

    const text = data[data.length - 1].content;

    const modelId = 'sentence-transformers/all-MiniLM-L6-v2';
    const hfToken = process.env.HUGGINGFACE_API_KEY;

    const apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;
    const headers = {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                inputs: text,
                options: {
                    wait_for_model: true
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

    // Fetch the embedding from the response
    hf_embeddings = await response.json();
    //console.log("The embedding result :"+"\n"+hf_embeddings);
    
    // Flatten the embedding if necessary
    if (Array.isArray(hf_embeddings[0])) {
        console.log("Inside if")
        hf_embeddings = hf_embeddings.flat();
    }

    // Check if the embedding has the correct length (384)
    if (hf_embeddings.length !== 384) {
        throw new Error(`Embedding dimension mismatch: expected 384, got ${hf_embeddings.length}`);
    }


    } catch (error) {
        console.error('Error fetching data:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch embeddings' }), { status: 500 });
    }

    // Query Pinecone with the obtained embeddings
    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: hf_embeddings,
    });

    let resultString = "";
    results.matches.forEach((match) => {
        resultString += `
        Returned Results:
        Restaurant: ${match.id}
        Reviews: ${match.metadata.reviews}
        Cuisine: ${match.metadata.cuisine}
        Category: ${match.metadata.category}
        Rating: ${match.metadata.restaurant_rating}
        Price_Range: ${match.metadata.price_range}
        Location: ${match.metadata.location}
        \n\n`;
    });

    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

    const completionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'system', content: RESTAURANT_FINDING_PROMPT },
                ...lastDataWithoutLastMessage,
                { role: 'user', content: lastMessageContent },
            ],
        }),
    });

    const completion = await completionResponse.json();
    const responseStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for (const chunk of completion.choices) {
                    const content = chunk.message?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(responseStream);
}
