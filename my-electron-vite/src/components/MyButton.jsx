import Button from '@mui/material/Button';
import { exec as  ipc_render_exec} from '../ipc/ipc_render';

export default function MyButton() {
    function handleClick() {
        ipc_render_exec("dir /B")
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