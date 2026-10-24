
console.log("Spotify Player Loaded");

const songs = [
    {
        songName: "mero-vrindavan",
        filePath: "songs/Mero_Vrindavan.mp3"
    },
    {
        songName: "radha raman hare hare",
        filePath: "songs/Radha_Raman_Hare.mp3"
    },
    {
        songName: "joi joi pyaaro kare",
        filePath: "songs/joi_joi_Pyaro_Kare.mp3"
    },
    {
        songName: "de ke charnon ki seva",
        filePath: "songs/Deke_Charno_Ki_Seva.mp3"
    },
    {
        songName: "tu hi mera shab hai",
        filePath: "songs/Tu_Hi_Mera_Shab_Hai.mp3"
    },
    {
        songName: "tere liye",
        filePath: "songs/Tere_Liye.mp3"
    },
    {
        songName: "mann mera",
        filePath: "songs/Mann_Mera.mp3"
    },
    {
        songName: "deewaniyat",
        filePath: "songs/Deewaniyat.mp3"
    }
];

let songIndex = 0;
let isSeeking = false;
let lastVolume = 0.7;

const audioElement = new Audio();
audioElement.preload = "metadata";
audioElement.volume = 0.7;

const masterPlay = document.getElementById("masterPlay");
const myProgressBar = document.getElementById("myProgressBar");
const masterSongName = document.getElementById("masterSongName");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");
const songItems = [...document.querySelectorAll(".songItem")];
const volumeBar = document.getElementById("volumeBar");
const muteButton = document.getElementById("muteButton");
const gif = document.getElementById("gif");

/* Convert seconds into MM:SS */
function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "--:--";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* Update play/pause icon */
function setPlayIcon(button, playing) {
    const icon = button?.querySelector("i");

    if (!icon) return;

    icon.classList.toggle("fa-play", !playing);
    icon.classList.toggle("fa-pause", playing);
}

/* Highlight the selected song */
function updateActiveSong() {
    songItems.forEach((item, index) => {
        const active = index === songIndex;

        item.classList.toggle("active-song", active);

        setPlayIcon(
            item.querySelector(".songItemPlay"),
            active && !audioElement.paused
        );
    });

    setPlayIcon(masterPlay, !audioElement.paused);

    if (gif) {
        gif.classList.toggle("is-playing", !audioElement.paused);
    }
}

/* Update current time and duration */
function updateTime() {
    currentTime.textContent = formatTime(audioElement.currentTime);
    durationTime.textContent = formatTime(audioElement.duration);

    if (
        !isSeeking &&
        Number.isFinite(audioElement.duration) &&
        audioElement.duration > 0
    ) {
        const percentage =
            (audioElement.currentTime / audioElement.duration) * 100;

        myProgressBar.value = percentage;
        myProgressBar.style.setProperty("--progress", `${percentage}%`);
    }
}

/* Load a song */
function loadSong(index) {
    songIndex = (index + songs.length) % songs.length;

    audioElement.src = songs[songIndex].filePath;
    audioElement.load();

    masterSongName.textContent = songs[songIndex].songName;

    currentTime.textContent = "00:00";
    durationTime.textContent = "--:--";

    myProgressBar.value = 0;
    myProgressBar.style.setProperty("--progress", "0%");

    updateActiveSong();
}

/* Play current song */
async function playSong() {
    try {
        await audioElement.play();
    } catch (error) {
        console.error(
            "Song could not play. Check the MP3 file path and filename:",
            songs[songIndex].filePath,
            error
        );
    }
}

/* Main play/pause button */
masterPlay.addEventListener("click", () => {
    if (audioElement.paused) {
        playSong();
    } else {
        audioElement.pause();
    }
});

/* Song list buttons */
songItems.forEach((item, index) => {
    const playButton = item.querySelector(".songItemPlay");

    playButton.addEventListener("click", () => {
        if (index === songIndex && !audioElement.paused) {
            audioElement.pause();
            return;
        }

        if (index !== songIndex) {
            loadSong(index);
        }

        playSong();
    });
});

/* Next song */
document.getElementById("forward").addEventListener("click", () => {
    loadSong(songIndex + 1);
    playSong();
});

/* Previous song */
document.getElementById("previous").addEventListener("click", () => {
    if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        updateTime();
        playSong();
    } else {
        loadSong(songIndex - 1);
        playSong();
    }
});

/* Audio events */
audioElement.addEventListener("loadedmetadata", updateTime);
audioElement.addEventListener("durationchange", updateTime);
audioElement.addEventListener("timeupdate", updateTime);
audioElement.addEventListener("play", updateActiveSong);
audioElement.addEventListener("pause", updateActiveSong);

/* Automatically play next song when current ends */
audioElement.addEventListener("ended", () => {
    if (songIndex < songs.length - 1) {
        loadSong(songIndex + 1);
        playSong();
    } else {
        audioElement.currentTime = 0;
        updateTime();
        updateActiveSong();
    }
});

/* Smooth seeking */
myProgressBar.addEventListener("input", () => {
    isSeeking = true;

    const percentage = Number(myProgressBar.value);

    myProgressBar.style.setProperty("--progress", `${percentage}%`);

    if (
        Number.isFinite(audioElement.duration) &&
        audioElement.duration > 0
    ) {
        audioElement.currentTime =
            (percentage / 100) * audioElement.duration;

        currentTime.textContent = formatTime(audioElement.currentTime);
    }
});

function stopSeeking() {
    isSeeking = false;
    updateTime();
}

myProgressBar.addEventListener("change", stopSeeking);
myProgressBar.addEventListener("pointerup", stopSeeking);
myProgressBar.addEventListener("keyup", stopSeeking);

/* Volume control */
function updateVolumeIcon() {
    const icon = muteButton.querySelector("i");

    icon.classList.remove(
        "fa-volume-high",
        "fa-volume-low",
        "fa-volume-xmark"
    );

    if (audioElement.muted || audioElement.volume === 0) {
        icon.classList.add("fa-volume-xmark");
    } else if (audioElement.volume < 0.5) {
        icon.classList.add("fa-volume-low");
    } else {
        icon.classList.add("fa-volume-high");
    }
}

volumeBar.addEventListener("input", () => {
    audioElement.volume = Number(volumeBar.value);
    audioElement.muted = audioElement.volume === 0;

    if (audioElement.volume > 0) {
        lastVolume = audioElement.volume;
    }

    updateVolumeIcon();
});

muteButton.addEventListener("click", () => {
    if (audioElement.muted || audioElement.volume === 0) {
        audioElement.muted = false;
        audioElement.volume = lastVolume || 0.7;
        volumeBar.value = audioElement.volume;
    } else {
        lastVolume = audioElement.volume;
        audioElement.muted = true;
    }

    updateVolumeIcon();
});

/* Get actual duration of every song from its audio file */
function loadDurations() {
    songs.forEach((song, index) => {
        const audio = new Audio();

        audio.preload = "metadata";
        audio.src = song.filePath;

        audio.addEventListener("loadedmetadata", () => {
            const durationElement =
                songItems[index].querySelector(".songDuration");

            if (Number.isFinite(audio.duration)) {
                durationElement.textContent = formatTime(audio.duration);
            }

            audio.removeAttribute("src");
            audio.load();
        }, { once: true });

        audio.addEventListener("error", () => {
            console.warn("Could not load song duration:", song.filePath);
        }, { once: true });
    });
}

/* About popup */
const aboutOverlay = document.getElementById("aboutOverlay");

function closeAbout() {
    aboutOverlay.hidden = true;
}

document.getElementById("aboutLink").addEventListener("click", event => {
    event.preventDefault();

    aboutOverlay.hidden = false;
    document.getElementById("closeAboutButton").focus();
});

document.getElementById("closeAbout").addEventListener("click", closeAbout);
document.getElementById("closeAboutButton").addEventListener("click", closeAbout);

aboutOverlay.addEventListener("click", event => {
    if (event.target === aboutOverlay) {
        closeAbout();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeAbout();
    }
});

/* Home button */
document.getElementById("homeLink").addEventListener("click", event => {
    event.preventDefault();
    closeAbout();

    document.getElementById("home").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

/* Initial setup */
loadSong(0);
loadDurations();
updateVolumeIcon();
