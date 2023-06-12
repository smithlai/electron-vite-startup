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


// let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  const win = new BrowserWindow({
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
  return win
}
function main(){
  const win = createWindow()
  win
  // const splash = splashScreen();
  // splash.webContents.openDevTools()
  // setTimeout(function(){
      // splash.destroy();
  // win.maximize();
  // win.show();
  //   },2000)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 有些 API 只能在這個事件發生後才能用。
app.whenReady().then(() => {
  main()

  app.on('activate', () => {
      // 且沒有其他視窗開啟的情況下，
      // 重新在應用程式裡建立視窗。
      if (BrowserWindow.getAllWindows().length === 0) {
      // 在 macOS 中，一般會在使用者按了 Dock 圖示
          main()
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


// ======= Register context bridge =======
// https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
import './ipc_handler.ts'

