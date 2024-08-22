import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}> 
          <img src= 'logo.png' alt="CraveQuest Logo" className={styles.logoImage} />
        </div>
        <h1 className={styles.title}>CraveQuest</h1>
        <p className={styles.tagline}>The solution to satisfying your food cravings.</p>
        <button className={styles.button}>Find Food/Restaurant ↓</button>
      </header>
      
      <main className={styles.main}>
        <p className={styles.searchPrompt}>What type of food or restaurant are you looking for?</p>
        <textarea className={styles.textarea}></textarea>
      </main>
      
      <footer className={styles.footer}>
        <p>© 2024 CraveQuest. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
