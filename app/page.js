'use client'
import { useRef, useState } from 'react';
import Body from './components/body';
import Footer from './components/footer';
import Header from './components/header';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to CraveQuest. How can I help with your food cravings today?`,
    },
  ]);
  const [message, setMessage] = useState('');

  const chatSectionRef = useRef(null);

  const handleScrollToChat = () => {
    chatSectionRef.current.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div>
      <Header handleScrollToChat={handleScrollToChat} />
      <section ref={chatSectionRef}>
        <Body
          messages={messages}
          sendMessage={sendMessage}
          message={message}
          setMessage={setMessage}
        />
      </section>
      <Footer />
    </div>
  );
}
