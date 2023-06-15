import Button from '@mui/material/Button';
import { apis } from '../ipc/ipc_apis.ts';

export default function MyButton() {
    function handleClick() {
    
      apis.executeCommand("dir /b")
    }
    return (
      <Button variant="contained" onClick={handleClick}>
        DIR/B
      </Button>
      // <button
      //   I don't do anything
      // </button>
    );
  }