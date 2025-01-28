const { ipcRenderer } = require('electron');

// Mostrar notificación de actualización disponible
ipcRenderer.on('update-available', () => {
  const updateNotification = document.createElement('div');
  updateNotification.innerHTML = `
    <div>
      <h3>Actualización disponible</h3>
      <p>Hay una nueva versión disponible para descargar.</p>
      <button id="download-update">Descargar</button>
    </div>
  `;
  document.body.appendChild(updateNotification);

  document.getElementById('download-update').addEventListener('click', () => {
    ipcRenderer.send('start-download');
  });
});

// Escuchar cuando la actualización esté lista
ipcRenderer.on('update-downloaded', () => {
  const installNotification = document.createElement('div');
  installNotification.innerHTML = `
    <div>
      <h3>Actualización lista</h3>
      <p>La actualización se descargó correctamente. ¿Quieres instalarla ahora?</p>
      <button id="install-update">Instalar</button>
    </div>
  `;
  document.body.appendChild(installNotification);

  document.getElementById('install-update').addEventListener('click', () => {
    ipcRenderer.send('install-update');
  });
});
