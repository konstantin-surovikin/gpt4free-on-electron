(function () {
  window.addEventListener('keydown', function(event) {
      if (event.key === 'F5') {
          event.preventDefault();
          location.reload();
      }
  });
})();
