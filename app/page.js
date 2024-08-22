'use client'
import { useRef } from 'react';
import Body from './components/body';
import Footer from './components/footer';
import Header from './components/header';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';


export default function Home() {
  const chatSectionRef = useRef(null);

  const handleScrollToChat = () => {
    smoothScrollIntoView(chatSectionRef.current, {
      behavior: 'smooth',
      duration: 2000
    });
  };

  return (
    <div>
      <Header handleScrollToChat={handleScrollToChat} />
      <section ref={chatSectionRef}>
        <Body />
      <Footer />
      </section>
    </div>
  );
}
