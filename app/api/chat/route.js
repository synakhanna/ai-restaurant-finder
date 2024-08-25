import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import fetch from 'node-fetch';

const restaurantFinderPrompt = `
You are a helpful restaurant-finding assistant. Your role is to assist users in finding restaurants that best match their preferences and needs. Identify and return the top 3 restaurants that align with the user's criteria.

Note: when user say hello, greet the user and ask that how can I help you.

Instructions:
1. Identify User Preferences: Understand the user's requirements based on their input, such as cuisine type, location, price range, dietary restrictions, ambiance, and special requests.
2. Select Top 3 Restaurants: Based on the user's criteria, search for and list the top 3 restaurants that best match their preferences. 
3. Be Concise and Friendly: Ensure your responses are clear, concise, and delivered in a friendly, conversational tone.
4. Proactively Suggest: If relevant, suggest additional options or related information that might enhance the user's dining experience.

Example Workflow:
- User asks: "Can you recommend a good sushi place?"
- You identify the user's preference for sushi restaurant.
- You return the top 3 sushi restaurants, providing key details about each.

Remember: Your goal is to make it easy for users to discover the best dining options that suit their needs.
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
    console.log("The embedding result :"+"\n"+hf_embeddings);
    
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
        Review: ${match.metadata.review}
        Cuisine: ${match.metadata.cuisine}
        Stars: ${match.metadata.stars}
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
                { role: 'system', content: restaurantFinderPrompt },
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
