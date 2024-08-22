import styles from './header.module.css';
import logo from './logo.png';
import Image from 'next/image';

export default function Header({ handleScrollToChat }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src={logo} alt="Logo" className={styles.logoImage} />
      </div>
      <h1 className={styles.title}>CraveQuest</h1>
      <p className={styles.tagline}>The solution to satisfying your food cravings.</p>
      <button className={styles.button} onClick={handleScrollToChat}>
        Find Food/Restaurant ↓
      </button>
    </header>
  );
}