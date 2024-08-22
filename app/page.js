import Body from './components/body';
import Footer from './components/footer';
import Header from './components/header';
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
