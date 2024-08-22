import styles from './components.module.css';
import logo from './images/logo.png';

export default function Header() {
  return (
    <header className={styles.header}>
      <img src={logo} alt="CraveQuest logo" />
      <h1>CraveQuest</h1>
      <p>The solution to satisfying your food cravings.</p>
      <button>Find Food/Restaurant ↓</button>
    </header>
  );
}