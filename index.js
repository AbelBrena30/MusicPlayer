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

const volumePercent = document.getElementById("volume-percent");
const music = new Audio();

let songs = [
    {
        path: "assets/1.mp3",
        displayName: "Una Mañana",
        cover: "assets/1.jpg",
        artist: "José José",
    },
];

// Cargar canciones guardadas en localStorage
const savedSongs = JSON.parse(localStorage.getItem("userSongs") || "[]");
if (savedSongs.length > 0) {
    songs = songs.concat(savedSongs);
}

// Cargar y reproducir la primera canción (1.mp3) al iniciar
let musicIndex = 0;
loadMusic(songs[musicIndex]);

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
//  Shuffle y Repeat
// --------------------------
let isShuffle = false;
let isRepeat = false;
let shuffleOrder = [];
let shuffleIndex = 0;

const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    if (isShuffle) {
        // Generar orden aleatorio
        shuffleOrder = Array.from({ length: songs.length }, (_, i) => i);
        for (let i = shuffleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffleOrder[i], shuffleOrder[j]] = [
                shuffleOrder[j],
                shuffleOrder[i],
            ];
        }
        shuffleIndex = shuffleOrder.indexOf(musicIndex);
    }
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
});

// Pintar el botón repeat antes de activar la funcionalidad y mostrar el número 1
repeatBtn.addEventListener("mousedown", () => {
    repeatBtn.classList.add("active");
});
repeatBtn.addEventListener("mouseup", () => {
    if (!isRepeat) repeatBtn.classList.remove("active");
});

// Sobreescribir el evento ended para shuffle/repeat
music.removeEventListener("ended", () => changeMusic(1));
music.addEventListener("ended", () => {
    if (isRepeat) {
        music.currentTime = 0;
        music.play();
    } else if (isShuffle) {
        if (shuffleOrder.length !== songs.length) {
            shuffleOrder = Array.from({ length: songs.length }, (_, i) => i);
            for (let i = shuffleOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffleOrder[i], shuffleOrder[j]] = [
                    shuffleOrder[j],
                    shuffleOrder[i],
                ];
            }
        }
        shuffleIndex = (shuffleIndex + 1) % shuffleOrder.length;
        musicIndex = shuffleOrder[shuffleIndex];
        loadMusic(songs[musicIndex]);
        music.currentTime = 0;
        music.play();
        renderSongList();
    } else {
        changeMusic(1);
    }
});

// Modificar changeMusic para shuffle
function changeMusic(direction) {
    if (isShuffle) {
        if (shuffleOrder.length !== songs.length) {
            // Regenerar orden si la lista cambió
            shuffleOrder = Array.from({ length: songs.length }, (_, i) => i);
            for (let i = shuffleOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffleOrder[i], shuffleOrder[j]] = [
                    shuffleOrder[j],
                    shuffleOrder[i],
                ];
            }
        }
        shuffleIndex =
            (shuffleIndex + direction + shuffleOrder.length) %
            shuffleOrder.length;
        musicIndex = shuffleOrder[shuffleIndex];
    } else {
        musicIndex = (musicIndex + direction + songs.length) % songs.length;
    }
    loadMusic(songs[musicIndex]);
    playMusic();
    renderSongList();
}

// --------------------------
//  Evento del control de volumen
// --------------------------
volumeSlider.addEventListener("input", (e) => {
    music.volume = e.target.value;
    const percent = Math.round(music.volume * 100);
    volumePercent.textContent = `${percent}%`;
    volumePercent.style.display = "block";
    clearTimeout(volumePercent._hideTimeout);
    volumePercent._hideTimeout = setTimeout(() => {
        volumePercent.style.display = "none";
    }, 1500);
});

// Cargar la primera canción al inicio (pero no reproducir automáticamente)
loadMusic(songs[musicIndex]);

// --------------------------
//  Mostrar lista de canciones y seleccionar
// --------------------------
const songListDiv = document.getElementById("song-list");

function renderSongList() {
    // Elimina solo los botones de canciones, no el botón de subir
    const uploadBtn = document.getElementById("upload-btn");
    const uploadInput = document.getElementById("upload-mp3");
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
    // Vuelve a agregar el botón (+) y el input al final
    songListDiv.appendChild(uploadInput);
    songListDiv.appendChild(uploadBtn);
}

// Eliminar elementos duplicados de la lista de canciones
function deduplicateSongs(arr) {
    const seen = new Set();
    return arr.filter((song) => {
        const key = song.displayName + "|" + song.artist;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

songs = deduplicateSongs(songs);

renderSongList();

// --------------------------
//  Subir archivo mp3
// --------------------------

const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload-mp3");

uploadBtn.addEventListener("click", () => {
    uploadInput.value = "";
    uploadInput.click();
});

uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
        const readerAudio = new FileReader();
        readerAudio.onload = function (evAudio) {
            const audioBase64 = evAudio.target.result;
            const newSong = {
                path: audioBase64,
                displayName: file.name.replace(/\.[^.]+$/, ""),
                cover: "assets/default-cover.svg",
                artist: "Archivo subido",
            };
            songs.push(newSong);
            // Guardar en localStorage
            let userSongs = JSON.parse(
                localStorage.getItem("userSongs") || "[]"
            );
            userSongs.push(newSong);
            localStorage.setItem("userSongs", JSON.stringify(userSongs));
            musicIndex = songs.length - 1;
            loadMusic(newSong);
            playMusic();
            renderSongList();
        };
        readerAudio.readAsDataURL(file);
    } else {
        alert("Por favor selecciona un archivo de audio válido");
    }
});

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

const songPopupBtn = document.getElementById("song-popup-btn");
const songPopup = document.getElementById("song-popup");
const popupSongList = document.getElementById("popup-song-list");
const closePopup = document.getElementById("close-popup");
const mainContainer = document.getElementById("main-container");
const playerPopup = document.getElementById("player-popup");

// Mostrar popup al hacer click en el botón
songPopupBtn.addEventListener("click", () => {
    renderPopupSongList();
    playerPopup.classList.add("active");
    mainContainer.style.display = "none";
});

// Cerrar popup
closePopup.addEventListener("click", () => {
    playerPopup.classList.remove("active");
    mainContainer.style.display = "";
});

// Renderizar lista de canciones en el popup
function renderPopupSongList() {
    popupSongList.innerHTML = "";
    const uniqueSongs = deduplicateSongs(songs);
    uniqueSongs.forEach((song, idx) => {
        const li = document.createElement("li");
        li.textContent = song.displayName + " - " + song.artist;
        if (idx === musicIndex) li.classList.add("active");
        li.onclick = () => {
            musicIndex = idx;
            loadMusic(uniqueSongs[musicIndex]);
            playMusic();
            renderSongList();
            songPopup.classList.remove("active");
        };
        popupSongList.appendChild(li);
    });
}

const popupUploadBtn = document.getElementById("popup-upload-btn");

// Usar la variable global uploadInput ya declarada
popupUploadBtn.addEventListener("click", () => {
    uploadInput.value = "";
    uploadInput.click();
});

uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
        const readerAudio = new FileReader();
        readerAudio.onload = function (evAudio) {
            const audioBase64 = evAudio.target.result;
            const newSong = {
                path: audioBase64,
                displayName: file.name.replace(/\.[^.]+$/, ""),
                cover: "assets/default-cover.svg",
                artist: "Archivo subido",
            };
            songs.push(newSong);
            // Guardar en localStorage
            let userSongs = JSON.parse(
                localStorage.getItem("userSongs") || "[]"
            );
            userSongs.push(newSong);
            localStorage.setItem("userSongs", JSON.stringify(userSongs));
            musicIndex = songs.length - 1;
            loadMusic(newSong);
            playMusic();
            renderSongList();
        };
        readerAudio.readAsDataURL(file);
    } else {
        alert("Por favor selecciona un archivo de audio válido");
    }
});

const editCoverBtn = document.getElementById("edit-cover-btn");

// Crear input para subir imagen
const coverInput = document.createElement("input");
coverInput.type = "file";
coverInput.accept = "image/*";
coverInput.style.display = "none";
document.body.appendChild(coverInput);

editCoverBtn.addEventListener("click", () => {
    let action = prompt(
        "Opciones:\n1. Pegar URL de Google Fotos\n2. Subir imagen\n3. Ajustar imagen\n\nEscribe 1, 2 o 3:"
    );
    if (action === "1") {
        const url = prompt("Pega el enlace de Google Fotos:");
        if (url && url.trim() !== "") {
            document.getElementById("cover").src = url.trim();
            document.getElementById("bg-img").src = url.trim();
        }
    } else if (action === "2") {
        coverInput.value = "";
        coverInput.click();
    } else if (action === "3") {
        let ajuste = prompt(
            "Ajuste de imagen:\n1. Cubrir (cover)\n2. Contener (contain)\n3. Rellenar (fill)\n4. Original (none)\n\nEscribe 1, 2, 3 o 4:"
        );
        let fit = "cover";
        if (ajuste === "2") fit = "contain";
        else if (ajuste === "3") fit = "fill";
        else if (ajuste === "4") fit = "none";
        document.getElementById("cover").style.objectFit = fit;
        document.getElementById("bg-img").style.objectFit = fit;
    }
});

coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            document.getElementById("cover").src = ev.target.result;
            document.getElementById("bg-img").src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
});
