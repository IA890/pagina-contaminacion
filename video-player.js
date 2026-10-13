(function () {
  const videos = document.querySelectorAll("video[controls]");

  videos.forEach(function (video) {
    const player = document.createElement("section");
    player.className = "video-player";
    player.setAttribute("aria-label", "Reproductor de video");
    video.parentNode.insertBefore(player, video);
    player.appendChild(video);
    video.classList.add("video-player__screen");

    const controls = document.createElement("div");
    controls.className = "video-player__controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Controles de reproduccion");
    controls.innerHTML = [
      '<button class="video-player__button video-player__play" type="button" aria-label="Reproducir">&#9654;</button>',
      '<span class="video-player__time video-player__current">0:00</span>',
      '<input class="video-player__range video-player__seek" type="range" min="0" max="0" value="0" step="0.1" aria-label="Posicion del video">',
      '<span class="video-player__time video-player__duration">0:00</span>',
      '<button class="video-player__button video-player__volume-button" type="button" aria-label="Silenciar">&#9834;</button>',
      '<input class="video-player__range video-player__volume" type="range" min="0" max="1" value="1" step="0.05" aria-label="Volumen">',
      '<button class="video-player__button video-player__fullscreen" type="button" aria-label="Activar pantalla completa">&#x26F6;</button>'
    ].join("");
    player.appendChild(controls);

    const playButton = controls.querySelector(".video-player__play");
    const currentTime = controls.querySelector(".video-player__current");
    const duration = controls.querySelector(".video-player__duration");
    const seek = controls.querySelector(".video-player__seek");
    const volumeButton = controls.querySelector(".video-player__volume-button");
    const volume = controls.querySelector(".video-player__volume");
    const fullscreenButton = controls.querySelector(".video-player__fullscreen");

    function formatTime(value) {
      if (!Number.isFinite(value)) return "0:00";
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60).toString().padStart(2, "0");
      return minutes + ":" + seconds;
    }

    function updatePlayButton() {
      const isPlaying = !video.paused && !video.ended;
      playButton.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
      playButton.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
    }

    function updateVolumeButton() {
      const isMuted = video.muted || video.volume === 0;
      volumeButton.innerHTML = isMuted ? "&#8856;" : "&#9834;";
      volumeButton.setAttribute("aria-label", isMuted ? "Activar sonido" : "Silenciar");
      volume.value = isMuted ? "0" : String(video.volume);
    }

    function updateProgress() {
      const progress = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      seek.value = String(video.currentTime || 0);
      seek.style.setProperty("--progress", progress + "%");
      currentTime.textContent = formatTime(video.currentTime);
    }

    playButton.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(updatePlayButton);
      } else {
        video.pause();
      }
    });

    seek.addEventListener("input", function () {
      video.currentTime = Number(seek.value);
      updateProgress();
    });

    volumeButton.addEventListener("click", function () {
      video.muted = !video.muted;
      updateVolumeButton();
    });

    volume.addEventListener("input", function () {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
      updateVolumeButton();
    });

    fullscreenButton.addEventListener("click", function () {
      if (document.fullscreenElement === player) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    });

    video.addEventListener("loadedmetadata", function () {
      seek.max = String(video.duration || 0);
      duration.textContent = formatTime(video.duration);
      updateProgress();
    });
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", updatePlayButton);
    video.addEventListener("pause", updatePlayButton);
    video.addEventListener("ended", updatePlayButton);
    video.addEventListener("volumechange", updateVolumeButton);
    document.addEventListener("fullscreenchange", function () {
      const isFullscreen = document.fullscreenElement === player;
      fullscreenButton.setAttribute("aria-label", isFullscreen ? "Salir de pantalla completa" : "Activar pantalla completa");
    });

    video.controls = false;
    updatePlayButton();
    updateVolumeButton();
    if (video.readyState >= 1) {
      seek.max = String(video.duration || 0);
      duration.textContent = formatTime(video.duration);
      updateProgress();
    }
  });
})();