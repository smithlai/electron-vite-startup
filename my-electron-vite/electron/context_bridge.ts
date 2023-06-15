// https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
// [IMPORTANT] contextBridge with electron config contextIsolation:true
import { ipcRenderer, contextBridge } from 'electron';
// Adds an object 'handler' to the global window object:
contextBridge.exposeInMainWorld('handler', {
    // expose ipcRenderer to renderer process
    ipcRenderer: ipcRenderer, 
    //<render>--------------------------<main>
    test: arg => ipcRenderer.invoke('test', arg),

});