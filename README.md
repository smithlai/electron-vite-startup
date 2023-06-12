# Demo

## Initialize
This application create react+electron with "electron-vite":
1. install nodejs
    https://nodejs.org/zh-tw/download
2. install yarn:
```sh
#------------
npm install -g yarn

changed 1 package, and audited 2 packages in 729ms

found 0 vulnerabilities
#-----------
npm list -g yarn
C:\Users\tw023281\AppData\Roaming\npm
`-- yarn@1.22.19

```
# React + Electron-Vite
https://electron-vite.github.io/guide/getting-started.html

1. yarn create vite  
    √ Project name: ... my-electron-vite  
    √ Select a framework: » Others  
    √ Select a variant: » create-electron-vite  
    √ Project template: » React  

2. refers to package.json  
    cd my-electron-vite  
    yarn install  
    # start
    # (in cd my-electron-vite)
    yarn dev  
        ➜  Local:   http://localhost:5173/  
        ➜  Network: use --host to expose  
        ➜  press h to show help  

3. Entry point:  
    vite(viteConfig.ts) ->   
    electron/main.ts: `win.loadFile(path.join(process.env.DIST, 'index.html'))` ->  
    index.html: `<script type="module" src="/src/main.tsx"></script>` ->  
    /src/main.tsx: `import App from './App.tsx'`  
  
    結論:   
        進入點主要為 **./index.html** 與 **/src/App.tsx**  


4. The react object will be compiled to "dist" and "dist-electron"  
    "build.outDir":  https://vitejs.dev/config/build-options.html#build-outdir  
    "dist-electron": https://electron-vite.github.io/plugin/vite-plugin-electron.html   
                    (defined in vite-plugin-electron/src/config.ts)  

5. While build electron `yarn build`  
    electron-builder will copy  
    "dist-electron" and "dist"  
    to  
    "release/${version}" (electron-builder.json5)  

    Remember to Modify vite.config.js to include your files  
    ```js
        plugins: [
            .....
            electron([
            {
                entry: 'electron/context_bridge.ts', // add your custom ts
            },
            {
                entry: 'electron/ipc_handler.ts', // add your custom ts
            },
            {
                entry: 'electron/shell.ts', // add your custom ts
            },
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/main.ts',
            },
            ........
            ])
            .....
        ]
    ```
6. Create folder src/components to put our own custom object
    > ProfileSimple.tsx  
    > Profile.tsx  
    ```sh
    # yarn add 'react-gauge-chart'
    yarn add '@types/react-gauge-chart'
    # material-react-table + MUI
    yarn add material-react-table @mui/material @mui/icons-material @emotion/react @emotion/styled
    ```
    > MyButton.tsx  
    > ......

7. **IMPORTANT** IPC
    1.  [context bridge] in preload.js (context_bridge.ts)
        ```ts
            // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
            // [IMPORTANT]contextBridge with electron config contextIsolation:true
            import { ipcRenderer, contextBridge } from 'electron';
            // // Adds an object 'api' to the global window object:
            contextBridge.exposeInMainWorld('handler', {
                // expose ipcRenderer to renderer process
                ipcRenderer: ipcRenderer, 
                //<render>--------------------------<main>
                test: arg => ipcRenderer.invoke('test', arg),

            });
        ```
   
    2. IPC Handler in main thread 

        > main.ts (ipc_handler.ts):
        ```js
            // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
            import { ipcMain, IpcMainInvokeEvent } from 'electron';

            ipcMain.handle('executeCommand', async (event: IpcMainInvokeEvent, command: string): Promise<string> => {
            const promise = executeCommand(command);
            return promise;
            })

            ipcMain.handle('an-action', async (event, arg) => {
                console.log("aaaaaaaaaaaaa")
                return "foo";
            })
        ```

    3. ipc_apis.ts
        ```ts            
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
                    console.log(result); // prints "foo"
                }
            }

        ```
    4. usage:  
        ```js
        import { apis } from '../ipc/ipc_apis.ts';
        function handleClick() {
            apis.executeCommand("ipconfig")
        }
        ```
    5. If you want to add more APIs, just modify
        > ipc_handler.ts  
        and  
        > ipc_apis.ts  

yarn add wmic