import styles from './footer.module.css';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>© 2024 CraveQuest. All rights reserved.</p>
      <a href="https://www.linkedin.com/company/codefusionartificialintelligence/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faLinkedin} className={styles.linkedin}/>
      </a>
    </footer>
  );
}