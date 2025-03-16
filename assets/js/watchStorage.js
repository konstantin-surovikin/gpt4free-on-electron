(function() {
  const ipcRenderer = require('electron').ipcRenderer;
  methodsWrapper(
    window.localStorage,
    ['setItem', 'removeItem'],
    () => {
      ipcRenderer.send(
            'storage-changed',
            JSON.parse(JSON.stringify(window.localStorage))
          )
    },
  );
})();
