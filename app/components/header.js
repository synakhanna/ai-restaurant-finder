import styles from './header.module.css';
import logo from './logo.png';
import Image from 'next/image';
import {Switch} from '@mui/material';
import { styled } from '@mui/system';

export default function Header({ handleScrollToChat, showEmoji, setShowEmoji }) {
  const CustomSwitch = styled(Switch)({
    '.MuiSwitch-switchBase': {
      color: 'white',
      '&.Mui-checked': {
        color: 'white',
      },
      '&.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#ffa240',
      },
    },
    '.MuiSwitch-track': {
      backgroundColor: '#ffa3406b',
    },
  });

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <CustomSwitch 
          checked={showEmoji} 
          onChange={() => setShowEmoji(!showEmoji)} 
        />       
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