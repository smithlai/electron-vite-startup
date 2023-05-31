// Method 1. we expose electron object to React via window global object with electron config contextIsolation:false
// https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
// const ipcRenderer  = window.ipcRender
// const aaa = require('electron').ipcRenderer

// Method 2: contextBridge with electron config contextIsolation:true
const ipcRenderer = window.myAPI.ipcRenderer;

export const exec = async (cmd) =>{
    const result = await ipcRenderer.invoke('exec', cmd);
    console.log(result); // prints "foo"
}
