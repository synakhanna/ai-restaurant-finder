import styles from './header.module.css';

export default function Header({ handleScrollToChat }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="logo.jpg" alt="cravequest logo" className={styles.logoImage} />
      </div>
      <h1 className={styles.title}>CraveQuest</h1>
      <p className={styles.tagline}>the solution to satisfying your food cravings.</p>
      <button className={styles.button} onClick={handleScrollToChat}>
        find food/restaurant ↓
      </button>
    </header>
  );
}
