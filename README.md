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

7. IPC
    1. **IMPORTANT** in preload.js
        ```js
        // Method 1. we expose electron object to React via window global object with electron config contextIsolation:false
        // https://weirenxue.github.io/2021/08/05/electron_window_require/
        // window.ipcRender = require('electron').ipcRenderer;
        
        // Method 2: contextBridge with electron config contextIsolation:true
        const { contextBridge, ipcRenderer } = require('electron');
        // expose ipcRenderer to renderer process
        contextBridge.exposeInMainWorld('myAPI', {
            ipcRenderer: ipcRenderer,
        });
        ```
   
    2. in main thread 

        > main.ts:  
        ```js
        import { executeCommand } from './shell.js' // remember to add this in vite config.ts

        // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
        import { ipcMain, IpcMainInvokeEvent } from 'electron';
        ipcMain.handle('executeCommand', async (event: IpcMainInvokeEvent, command: string): Promise<string> => {
        const promise = executeCommand(command);
        return promise;
        })
        ```

    3. ipc_render.ts
        ```js
        // Method 1. we expose electron object to React via window global object with electron config contextIsolation:false
        // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
        // const ipcRenderer  = window.ipcRender
        // const aaa = require('electron').ipcRenderer

        // Method 2: contextBridge with electron config contextIsolation:true
        const ipcRenderer = window.myAPI.ipcRenderer;

        export const executeCommand = async (cmd) =>{
            const result = await ipcRenderer.invoke('executeCommand', cmd);
        }
        ```
    4. usage:  
        ```js
        import { executeCommand as  ipc_render_executeCommand} from '../ipc/ipc_render';
        function handleClick() {
            ipc_render_executeCommand("dir /B")
        }
        ```

yarn add wmic