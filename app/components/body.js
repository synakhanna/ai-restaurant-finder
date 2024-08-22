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
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} /> {/* This element will be used as the target to scroll into view */}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="What type of food/restaurant are you looking for?"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { backgroundColor: '#b18569', color: '#281705', fontFamily: 'JejuMyeongjo' },
            }}
            InputLabelProps={{
              style: { color: '#27160587', fontFamily: 'JejuMyeongjo' },
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