let mediaDesktop = window.matchMedia("(min-width:1024px)");

if (mediaDesktop.matches) {
  function change(element) {
    element.classList.toggle("m-image__wrapper");
    element.classList.toggle("fullscreen");
  }
}
