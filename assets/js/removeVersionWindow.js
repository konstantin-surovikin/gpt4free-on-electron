(function(){
  new Promise(function(resolve) {
    const removedNodes = Array
      .from(document.body.getElementsByClassName('new_version'))
      .map(node => node.remove());
    if (removedNodes.length === 0) {
      const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('new_version')) {
              node.remove();
              observer.disconnect();
              return;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
      });
    } else {
      resolve();
    }
  });
})();
