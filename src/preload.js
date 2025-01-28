const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, percent) => callback(percent)),
  cancelUpdate: () => ipcRenderer.send('cancel-update'),
});
