(function(){
  const removedNodes = Array
    .from(document.body.getElementsByClassName('mobile-sidebar'))
    .map(node => node.click());
  if (removedNodes.length === 0) {
    const observer = new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('mobile-sidebar')) {
            node.click();
            observer.disconnect();
            return;
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
    });
  }
})();
