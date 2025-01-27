const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');

  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


autoUpdater.on('update-available', () => {
  console.log('Actualización disponible');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Actualización descargada, reiniciando...');
  autoUpdater.quitAndInstall();
});
