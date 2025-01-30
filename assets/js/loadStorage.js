(function() {
  require('electron').ipcRenderer.once('load-storage', function (event, storage) {
    for(const key in storage) {
      window.localStorage.setItem(key, storage[key]);
    }
    location.reload();
  });
})();
