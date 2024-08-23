'use client'
import { useRef, useEffect, useState } from 'react';
import Body from './components/body';
import Footer from './components/footer';
import Header from './components/header';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import styles from './page.module.css';


export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const headerSectionRef = useRef(null);
  const chatSectionRef = useRef(null);

  const handleScrollToChat = () => {
    smoothScrollIntoView(chatSectionRef.current, {
      behavior: 'smooth',
      duration: 2000
    });
  };

  const handleScrollToHeader = () => {
    smoothScrollIntoView(headerSectionRef.current, {
      behavior: 'smooth',
      duration: 2000
    });
  };

  const [showEmoji, setShowEmoji] = useState(true);
  const burgers = Array.from({ length: 10 });

  return (
    <div>
      {showEmoji && burgers.map((_, i) => (
        <div 
          key={i} 
          className={styles.floatingBurger} 
          style={{ 
            left: `${Math.random() < 0.5 ? Math.random() * 5 : 95 + Math.random() * 5}%`, 
            animationDelay: `${Math.random() * 5}s` 
          }}
        >
          🍔
        </div>
      ))}
      <section ref={headerSectionRef}>
      <Header 
        handleScrollToChat={handleScrollToChat} 
        showEmoji={showEmoji} 
        setShowEmoji={setShowEmoji} 
      />
      </section>
      <section ref={chatSectionRef}>
        <Body handleScrollToHeader={handleScrollToHeader} />
        <Footer />
      </section>
    </div>
  );
}