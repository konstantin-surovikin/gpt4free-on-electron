(function(){
  Array
    .from(document.getElementsByClassName('new_version'))
    .map(new_version => new_version.parentElement.removeChild(new_version))
})();
