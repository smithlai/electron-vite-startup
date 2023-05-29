# Demo

## Initialize
This application creating steps:
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
    "dist-electron": https://electron-vite.github.io/plugin/vite-plugin-electron.html (this is manually put main.js and preload.js)


5. While build electron, electron-builder will copy "dist-electron" and "dist" to "release/${version}" (electron-builder.json5)

6. Create folder src/components to put our own custom object




















----------------------------------------------------------------------------

# REACT + Electron
Reference: [基於 React 的 Electron 開發環境建立與打包](https://weirenxue.github.io/2021/08/04/react_electron_build/)
Reference: [Electron first app](https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app
Reference: [Building Electron desktop apps with React using Codemagic](https://blog.codemagic.io/building-electron-desktop-apps-with-react/)
1. Init project
    ```sh
    # yarn init "replaced by npx create-react-app
    npx create-react-app reactron_wmi_ui
    ```
    ```sh
    # push an existing repository from the command line
    git remote add origin https://github.com/smithlai/reactron_wmi_ui.git
    git branch -M main
    git push -u origin main
    ```
2. Install libraries     
  ```sh
    # dev
    yarn add electron --dev
    yarn add wait-on --dev
    yarn add concurrently --dev
    yarn add cross-env --dev
    yarn add electron-builder --dev
    # dep
    yarn add electron-is-dev
    yarn add 'react-gauge-chart'
    # material-react-table + MUI
    yarn add material-react-table @mui/material @mui/icons-material @emotion/react @emotion/styled
    
  ```
  之後可以用yarn install根據package.json恢復

3. add electron command script (package.json)  
    ```js
    "homepage": ".",
    "main": "main.js",
    "private": true,
    "scripts": {
        //......
        "dev": "concurrently --kill-others \"cross-env BROWSER=none yarn:start\" \"yarn:electron\"",
        "electron": "wait-on http://127.0.0.1:3000 && electron .",
        // localhost:3000 and tcp:3000 might be blocked
        "electron-build": "yarn build && build.js"
    }
    ```
4. Manually create app.js
```js
const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev') // + 
function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true, // +
          preload: path.join(__dirname, 'preload.js')  // +
        }
    })

    if (isDev) {
        // 開發階段直接與 React 連線
        win.loadURL('http://localhost:3000/');
        // 開啟 DevTools.
        win.webContents.openDevTools()
    } else {
        // 產品階段直接讀取 React 打包好的
        win.loadFile('./build/index.html');
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 有些 API 只能在這個事件發生後才能用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // 且沒有其他視窗開啟的情況下，
        // 重新在應用程式裡建立視窗。
        if (BrowserWindow.getAllWindows().length === 0) {
        // 在 macOS 中，一般會在使用者按了 Dock 圖示
            createWindow()
        }
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 中，一般會讓應用程式及選單列繼續留著，
    // 除非使用者按了 Cmd + Q 確定終止它們
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. 

```
5. Put an empty preload.js, and test the command
   ```
    yarn start
    yarn dev
   ```
6. electron_builder
    Add build.js (as the file build.js, which contains electron builder settings)

7. IPC
   1. **IMPORTANT** in preload.js
   ```js
    // https://weirenxue.github.io/2021/08/05/electron_window_require/
    // we expose electron object to React via window global object
    window.ipcRender = require('electron').ipcRenderer;
   ```
   2. in main thread (ipc_main.js)
   ```js
    const { ipcMain } = require('electron');
    const { exec } = require('./shell.js')
    exports.setup = () => {
        ipcMain.handle('exec', async (event, command) => {
            const promise = exec(command)
            return promise;
        })
    }
    ........
    ......
    ipc_main.setup()
    ......
   ```
   3. ipc_render.js
    ```js
      const ipcRenderer  = window.ipcRender
        
      export const exec = async (cmd) =>{
        const result = await ipcRenderer.invoke('exec', cmd);
        console.log(result); 
      }
    ```

    4. **IMPORTANT**: Remember to add 'ipc_main.js' and  'shell.js' in builder.js
    ```js
        // 打包需要用到的原始碼、模組，皆需要寫到 files 內
        'files': [
            //.....
            //.....
            //'preload.js',
            'ipc_main.js',
            'shell.js',
        ],
    ```