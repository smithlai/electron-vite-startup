
// To fix:
// error TS7006: Parameter 'arg' implicitly has an 'any' type.
// src/components/MyButton.tsx:8:39 - error TS2339: Property 'handler' does not exist on type 'Window & typeof globalThis'.

declare global {
    interface Window {
        handler:any;
    }
}
const ipcRenderer = window.handler.ipcRenderer;

// https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
export const apis = {
    'test': async () => {
        const response = await window.handler.test([1,2,3]);
        console.log(response); // we now have the response from the main thread without exposing
                               // ipcRenderer, leaving the app less vulnerable to attack    
    },
    'executeCommand':async (cmd: string) =>{
        const result = await ipcRenderer.invoke('executeCommand', cmd);
        // console.log(result);
        return result
    },
    'executePowerShell':async (cmd: string) =>{
        const result = await ipcRenderer.invoke('executePowerShell', cmd);
        // console.log(result);
        return result
    },
    'executeWMI':async (wmiQuery: string, useCIM: Boolean = false) =>{
        const result = await ipcRenderer.invoke('executeWMI', wmiQuery, useCIM);
        // console.log(result);
        return result
    }

}

