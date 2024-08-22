import { Box, Button, Stack, TextField } from '@mui/material';
import styles from './body.module.css';

export default function Body({ messages, sendMessage, message, setMessage }) {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className={styles.body}
    >
      <Stack
        direction={'column'}
        width="500px"
        height="600px"
        border="1px solid #ffa240"
        p={2}
        spacing={3}
        className={styles.chatBox}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                className={
                  message.role === 'assistant'
                    ? styles.assistantMessage
                    : styles.userMessage
                }
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="What type of food/restaurant are you looking for?"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { backgroundColor: '#ffa240', color: '#2c1608' },
            }}
            InputLabelProps={{
              style: { color: '#2c1608' },
            }}
          />
          <Button
            variant="contained"
            style={{ backgroundColor: '#ffa240', color: '#2c1608' }}
            onClick={sendMessage}
          >
            send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
