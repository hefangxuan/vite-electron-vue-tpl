import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path';
import {URL} from 'url';
import {globalConfig} from '../common/store';


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {


  /**
   * Workaround for TypeScript bug
   * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
   */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const env = import.meta.env;

  globalConfig.set('a', 1);

  console.log(33333312223232222, globalConfig.get('a'));
  ipcMain.handle('globalConfig',   (event, key) => {
    return globalConfig.get(key);
  });

  // Install "Vue.js devtools BETA"
  // if (env.MODE === 'development') {
  //   app.whenReady()
  //     .then(() => import('electron-devtools-installer'))
  //     .then(({default: installExtension}) => {
  //       /** @see https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg */
  //       const VUE_DEVTOOLS_BETA = 'ljjemllljcmogpfapbkkighbhhppjdbg';
  //       return installExtension(VUE_DEVTOOLS_BETA);
  //     })
  //     .catch(e => console.error('Failed install extension:', e));
  // }

  console.log(2232213);

  let mainWindow: BrowserWindow | null = null;

  async function createWindow() {
    mainWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        preload: join(__dirname, '../preload/index.cjs.js'),
        contextIsolation: true,   // Spectron tests can't work with contextIsolation: true
        enableRemoteModule: true, // Spectron tests can't work with enableRemoteModule: false
      },
    });

    /**
     * URL for main window.
     * Vite dev server for development.
     * `file://../renderer/index.html` for production and test
     */
    const pageUrl = env.MODE === 'development'
      ? env.VITE_DEV_SERVER_URL
      : new URL('renderer/index.html', 'file://' + __dirname).toString();

    await mainWindow.loadURL(pageUrl);
    mainWindow.maximize();
    mainWindow.show();

    if (env.MODE === 'development') {
      mainWindow.webContents.openDevTools();
    }
  }


  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });


  app.whenReady()
    .then(createWindow)
    .catch((e) => console.error('Failed create window:', e));


  // Auto-updates
  // if (env.PROD) {
  //   app.whenReady()
  //     .then(() => import('electron-updater'))
  //     .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
  //     .catch((e) => console.error('Failed check updates:', e));
  // }
}
