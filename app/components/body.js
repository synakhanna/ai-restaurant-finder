import styles from './body.module.css';

// Directly referencing the images with their relative paths
const Body = () => {
  return (
    <main className={styles.body}>
      {/* Upper Section with Server and Button */}
      <div className={styles.topSection}>
        <div className={styles.serverContainer}>
          <img src="./images/server.png" alt="Server" className={styles.serverImage} />
        </div>
        <p className={styles.tagline}>The solution to satisfying your cravings.</p>
        <a href="#plateSection" className={styles.findFoodButton}>
          Find Food
        </a>
      </div>

      {/* Lower Section with Plate, Fork, and Knife */}
      <div id="plateSection" className={styles.plateSection}>
        <div className={styles.utensils}>
          <img src="./images/plate.png" alt="Plate" className={styles.plate} />
        </div>
      </div>
    </main>
  );
};

export default Body;
