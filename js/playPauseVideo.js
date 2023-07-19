// Fonction pour mettre en pause la vidéo
function pauseVideo(video) {
  video.pause();
}

// Fonction pour reprendre la lecture de la vidéo
function playVideo(video) {
  video.play();
}

// Options de l'Intersection Observer
const options = {
  root: null, // La fenêtre par défaut est utilisée comme viewport
  rootMargin: "0px",
  threshold: 0.5, // Le pourcentage de visibilité nécessaire pour déclencher l'observation
};

// Callback appelée lorsqu'un élément entre ou sort de la vue
function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > 0) {
      playVideo(entry.target); // La vidéo est visible, on la lance
    } else {
      pauseVideo(entry.target); // La vidéo n'est plus visible, on la met en pause
    }
  });
}

// Sélectionnez votre vidéo
const videoElement = document.getElementById("ma-video");

// Créez l'instance de l'Intersection Observer
const observer = new IntersectionObserver(handleIntersection, options);

// Commencez à observer la vidéo
observer.observe(videoElement);
