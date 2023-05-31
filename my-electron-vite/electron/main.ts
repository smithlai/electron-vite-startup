import { app, BrowserWindow } from 'electron'
import path from 'node:path'
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      contextIsolation: true, // true:  `const ipcRenderer  = window.ipcRender` is undefined 
      // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
      // nodeIntegration: true,   // fix: Uncaught ReferenceError: require is not defined
      // nodeIntegrationInWorker: true,//without this we will get "Uncaught ReferenceError: require is not defined" in Worker
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  win.webContents.openDevTools()
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)

// ======= Register event =======
import { executeCommand } from './shell.js' // remember to add this in vite config.ts

// https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
import { ipcMain, IpcMainInvokeEvent } from 'electron';
ipcMain.handle('exec', async (event: IpcMainInvokeEvent, command: string): Promise<string> => {
  const promise = executeCommand(command);
  return promise;
})