const image = document.getElementById("cover"),
    title = document.getElementById("music-title"),
    artist = document.getElementById("music-artist"),
    currentTimeEl = document.getElementById("current-time"),
    durationEl = document.getElementById("duration"),
    progress = document.getElementById("progress"),
    playerProgress = document.getElementById("player-progress"),
    prevBtn = document.getElementById("prev"),
    nextBtn = document.getElementById("next"),
    playBtn = document.getElementById("play"),
    background = document.getElementById("bg-img"),
    volumeSlider = document.getElementById("volume-slider"); // <- añadimos el volumen aquí

const music = new Audio();

const songs = [
    {
        path: "assets/1.mp3",
        displayName: "Una Mañana",
        cover: "assets/1.jpg",
        artist: "José José",
    },
];

let musicIndex = 0;
let isPlaying = false;

function togglePlay() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    isPlaying = true;
    playBtn.classList.replace("fa-play", "fa-pause");
    playBtn.setAttribute("title", "Pause");
    music.play();
}

function pauseMusic() {
    isPlaying = false;
    playBtn.classList.replace("fa-pause", "fa-play");
    playBtn.setAttribute("title", "Play");
    music.pause();
}

function loadMusic(song) {
    music.src = song.path;
    title.textContent = song.displayName;
    artist.textContent = song.artist;
    image.src = song.cover;
    background.src = song.cover;
}

function changeMusic(direction) {
    musicIndex = (musicIndex + direction + songs.length) % songs.length;
    loadMusic(songs[musicIndex]);
    playMusic();
}

function updateProgressBar() {
    const { duration, currentTime } = music;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");
    durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
        duration % 60
    )}`;
    currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(
        currentTime % 60
    )}`;
}

function setProgressBar(e) {
    const width = playerProgress.clientWidth;
    const clickX = e.offsetX;
    music.currentTime = (clickX / width) * music.duration;
}

// --------------------------
//  Eventos principales
// --------------------------
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", () => changeMusic(-1));
nextBtn.addEventListener("click", () => changeMusic(1));
music.addEventListener("ended", () => changeMusic(1));
music.addEventListener("timeupdate", updateProgressBar);
playerProgress.addEventListener("click", setProgressBar);

// --------------------------
//  Evento del control de volumen
// --------------------------
volumeSlider.addEventListener("input", (e) => {
    music.volume = e.target.value;
});

// Cargar la primera canción al inicio
loadMusic(songs[musicIndex]);

// --------------------------
//  Mostrar lista de canciones y seleccionar
// --------------------------
const songListDiv = document.getElementById("song-list");

function renderSongList() {
    songListDiv.innerHTML = "";
    songs.forEach((song, idx) => {
        const btn = document.createElement("button");
        btn.textContent = song.displayName + " - " + song.artist;
        btn.className = "song-btn";
        if (idx === musicIndex) btn.classList.add("active");
        btn.onclick = () => {
            musicIndex = idx;
            loadMusic(songs[musicIndex]);
            playMusic();
            renderSongList();
        };
        songListDiv.appendChild(btn);
    });
}

renderSongList();

// --------------------------
//  Swipe en la imagen para cambiar de canción
// --------------------------
let startX = null;
image.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
});

image.addEventListener("touchend", function (e) {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    if (Math.abs(diffX) > 50) {
        // Umbral mínimo para considerar swipe
        if (diffX > 0) {
            image.classList.add("swipe-right");
            setTimeout(() => {
                changeMusic(-1);
                image.classList.remove("swipe-right");
            }, 300);
        } else {
            image.classList.add("swipe-left");
            setTimeout(() => {
                changeMusic(1);
                image.classList.remove("swipe-left");
            }, 300);
        }
    }
    startX = null;
});

// También soporte para mouse (drag)
let mouseDownX = null;
image.addEventListener("mousedown", function (e) {
    mouseDownX = e.clientX;
});
image.addEventListener("mouseup", function (e) {
    if (mouseDownX === null) return;
    const mouseUpX = e.clientX;
    const diffX = mouseUpX - mouseDownX;
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            image.classList.add("swipe-right");
            setTimeout(() => {
                changeMusic(-1);
                image.classList.remove("swipe-right");
            }, 300);
        } else {
            image.classList.add("swipe-left");
            setTimeout(() => {
                changeMusic(1);
                image.classList.remove("swipe-left");
            }, 300);
        }
    }
    mouseDownX = null;
});
