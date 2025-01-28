const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const url = require('url');

let mainWindow;
let progressWindow;

// Configurar logs para depuración
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

app.on('ready', () => {
  log.info('🟢 Aplicación iniciada');

  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Habilita comunicación segura
    },
  });

  // Cargar la página principal
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'views/index.html'),
      protocol: 'file',
      slashes: true,
    })
  );

  // Desactivar descarga automática
  autoUpdater.autoDownload = false;

  // Verificar actualizaciones al iniciar
  autoUpdater.checkForUpdates();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 📢 Evento: Actualización disponible
autoUpdater.on('update-available', () => {
  log.info('✅ Actualización disponible');

  dialog
    .showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualización disponible',
      message: 'Hay una nueva actualización disponible. ¿Quieres descargarla ahora?',
      buttons: ['Sí', 'No'],
    })
    .then((result) => {
      if (result.response === 0) {
        log.info('⚡ Iniciando descarga de actualización...');

        // Crear ventana de progreso
        progressWindow = new BrowserWindow({
          width: 400,
          height: 200,
          title: 'Descargando actualización...',
          parent: mainWindow,
          modal: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
          },
        });

        progressWindow.loadURL(
          url.format({
            pathname: path.join(__dirname, 'views/progress.html'),
            protocol: 'file',
            slashes: true,
          })
        );

        autoUpdater.downloadUpdate();
      } else {
        log.info('❌ Usuario canceló la actualización.');
      }
    });
});

// 📢 Evento: Progreso de descarga
autoUpdater.on('download-progress', (progress) => {
  log.info(`⬇️ Descarga en progreso: ${progress.percent.toFixed(2)}%`);

  if (progressWindow) {
    progressWindow.webContents.send('download-progress', progress.percent);
  }
});

// 📢 Evento: Descarga completada
autoUpdater.on('update-downloaded', () => {
  log.info('✅ Descarga completada');

  if (progressWindow) {
    progressWindow.close();
  }

  dialog
    .showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualización lista',
      message: 'La actualización se descargó correctamente. ¿Quieres instalarla ahora?',
      buttons: ['Instalar ahora', 'Más tarde'],
    })
    .then((result) => {
      if (result.response === 0) {
        log.info('🚀 Instalando actualización...');
        autoUpdater.quitAndInstall();
      } else {
        log.info('⏳ Instalación pospuesta.');
      }
    });
});

// 📢 Evento: Error en la actualización
autoUpdater.on('error', (err) => {
  log.error('⚠️ Error al buscar o descargar actualizaciones:', err.message);
});

ipcMain.on('cancel-update', () => {
  log.info('❌ Cancelando la descarga de la actualización...');
  autoUpdater.autoDownload = false;
  if (progressWindow) {
    progressWindow.close();
  }
});
