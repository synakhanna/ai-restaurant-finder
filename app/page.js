import Body from './components/body';
import React from 'react';
import Header from './components/header';
import Footer from './components/footer';
import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.page}>
      <Header />
      <Body />
      <Footer />
    </div>
  );
}