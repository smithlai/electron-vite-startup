
// ======= Register event =======
import { executeCommand,executePowerShell,executeWMI } from './shell.js' // remember to add this in vite config.ts

// // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
import { ipcMain, IpcMainInvokeEvent } from 'electron';

ipcMain.handle('executeCommand', async (event: IpcMainInvokeEvent, command: string): Promise<string> => {
  const promise = executeCommand(command);
  return promise;
})

ipcMain.handle('executePowerShell', async (event: IpcMainInvokeEvent, command: string): Promise<string> => {
  const promise = executePowerShell(command);
  return promise;
})

ipcMain.handle('executeWMI', async (event: IpcMainInvokeEvent, wmiQuery: string): Promise<string> => {
  const promise = executeWMI(wmiQuery);
  return promise;
})

ipcMain.handle('an-action', async (event, arg) => {
    console.log("aaaaaaaaaaaaa")
    return "foo";
})