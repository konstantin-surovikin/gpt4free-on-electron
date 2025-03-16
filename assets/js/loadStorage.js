(function() {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.once('load-storage', function (event, storage) {
    for(const key in storage) {
      window.localStorage.setItem(key, storage[key]);
    }
    ipcRenderer.send('storage-loaded');
  });
})();
