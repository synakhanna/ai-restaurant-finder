import { Box, Button, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import styles from './body.module.css';

export default function Body({ handleScrollToHeader }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to CraveQuest. How can I help with your food cravings today?`,
    },
  ]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null); // Ref to track the end of the chat

  const parseMarkdown = (text) => {
    // Replace headers (e.g., # Header) with <h1> tags
    const headerPattern = /^(#+)\s+(.*)$/gm;
    text = text.replace(headerPattern, (match, p1, p2) => {
      const level = p1.length; // Number of # determines header level
      return `<h${level}>${p2}</h${level}>`;
    });
  
    // Replace bold text (e.g., **bold**) with <strong> tags
    const boldPattern = /\*\*(.*?)\*\*/g;
    text = text.replace(boldPattern, '<strong>$1</strong>');
  
    // Replace italic text (e.g., *italic*) with <em> tags
    const italicPattern = /\*(.*?)\*/g;
    text = text.replace(italicPattern, '<em>$1</em>');
  
    // Process unordered lists (e.g., - item)
    const unorderedListPattern = /^-\s+(.*)$/gm;
    text = text.replace(unorderedListPattern, (match, p1, offset, string) => {
      if (!string.substring(0, offset).includes('<ul>')) {
        return `<ul><li>${p1}</li>`;
      }
      return `<li>${p1}</li>`;
    });
  
    // Close unordered list if it was open
    text = text.replace(/<\/li>(?!<\/ul>)/g, '</li></ul>');
  
    // Process ordered lists (e.g., 1. item) and remove the numbers
    const orderedListPattern = /^(\d+)\.\s+(.*)$/gm;
    text = text.replace(orderedListPattern, (match, p1, p2) => {
      if (!text.includes('<ol>')) {
        return `<ol><li>${p2}</li>`;
      }
      return `<li>${p2}</li>`;
    });
  
    // Close ordered list if it was open
    text = text.replace(/<\/li>(?!<\/ol>)/g, '</li></ol>');
  
    // Replace new lines with <br> for better formatting
    text = text.replace(/\n/g, '<br>');
  
    // Remove numbering from ordered lists
    text = text.replace(/<ol>.*?<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
  
    return text;
  };
  
  
  

  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const initialMessage = {
    role: 'assistant',
    content: `Welcome to CraveQuest. How can I help with your food cravings today?`,
  };
  
  const resetChat = () => {
    setMessages([initialMessage]);
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Box className={styles.body}>
      <button className={styles.upButton} onClick={handleScrollToHeader}>
        Scroll Up ↑
      </button>
      <Stack spacing={3} className={styles.chatBox}>
        <Stack spacing={2} flexGrow={1} overflow="auto">
          {messages.map((message, index) => (
            <Box
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box className={message.role === 'assistant' ? styles.assistantMessage : styles.userMessage}>
                {/* {message.content} */}
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} /> {/* This element will be used as the target to scroll into view */}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label={windowWidth <= 810 ? "Type here..." : "What type of food/restaurant are you looking for?Type here..."}
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { backgroundColor: '#c5895b', color: '#281705', fontFamily: 'JejuMyeongjo' },
            }}
            InputLabelProps={{
              style: { color: '#27160582', fontFamily: 'JejuMyeongjo' },
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e);
              }
            }}
          />
          <Button onClick={sendMessage} className={styles.sendButton}>Send</Button>
          <Button onClick={resetChat} className={styles.sendButton}>Reset</Button>
        </Stack>
      </Stack>
    </Box>
  );
}