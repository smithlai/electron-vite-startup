import Button from '@mui/material/Button';
import { executeCommand as  ipc_render_executeCommand} from '../ipc/ipc_render.ts';

export default function MyButton() {
    function handleClick() {
      ipc_render_executeCommand("dir /B")
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