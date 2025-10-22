// --- VARIABLES GLOBALES ET CONSTANTES ---

const video = document.getElementById('maVideo'); // La vidéo principale
const lecteurVideo = document.querySelector('.lecteur-video'); 
const niveauChargement = document.getElementById('NiveauChargement');
const niveauLecture = document.getElementById('NiveauLecture');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const progressVolume = document.getElementById('ProgressVolume');
const niveauVolume = document.getElementById('NiveauVolume');
const VolumeoffBtn = document.getElementById('Volumeoff');
const VolumeonBtn = document.getElementById('Volumeon');
const canvas = document.getElementById('miniatureCanvas');
const ctx = canvas.getContext('2d');
const progresseLecture = document.getElementById('ProgresseLecture');

// --- Constantes pour le plein écran ---
const fullscreenBtn = document.getElementById('fullscreen');
const fullscreenOffBtn = document.getElementById('fullscreenoff');

// --- La vidéo invisible pour les miniatures ---
const videoThumbnail = document.createElement('video');
videoThumbnail.muted = true;
videoThumbnail.preload = 'auto';
videoThumbnail.crossOrigin = "anonymous"; // Pour la sécurité du canvas

// Variable d'état
let isScrubbing = false; // Pour savoir si on survole la barre

// --- FONCTIONS DE CONTRÔLE (appelées par onclick) ---

function playVideo() {
    video.play();
    play.classList.add('cache');
    pause.classList.remove('cache');
}

function pauseVideo() {
    video.pause();
    play.classList.remove('cache');
    pause.classList.add('cache');
}

function mettreAJourNiveauVolume() {
    const volume = video.volume;
    const volumePourcent = volume * 100;
    niveauVolume.style.width = volumePourcent + '%';
    if (volume === 0) {
        VolumeoffBtn.classList.add('cache');
        VolumeonBtn.classList.remove('cache');
    } else {
        VolumeoffBtn.classList.remove('cache');
        VolumeonBtn.classList.add('cache');
    }
}

function Volumeoff() {
    video.volume = 0;
    mettreAJourNiveauVolume();
}

function Volumeon() {
    video.volume = 1;
    mettreAJourNiveauVolume();
}

// --- Fonctions de plein écran (globales) ---

function FullscreenOn() {
    // On demande le plein écran sur le conteneur complet
    if (lecteurVideo.requestFullscreen) {
        lecteurVideo.requestFullscreen();
    } else if (lecteurVideo.mozRequestFullScreen) { // Firefox
        lecteurVideo.mozRequestFullScreen();
    } else if (lecteurVideo.webkitRequestFullscreen) { // Chrome, Safari, Opera
        lecteurVideo.webkitRequestFullscreen();
    } else if (lecteurVideo.msRequestFullscreen) { // IE/Edge
        lecteurVideo.msRequestFullscreen();
    }
}

function FullscreenOff() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}


// --- ÉCOUTEUR PRINCIPAL (quand le DOM est prêt) ---

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Ajustement des dimensions et initialisation ---
    // CETTE FONCTION EST ESSENTIELLE POUR LE MODE "PETIT ÉCRAN"
    function ajusterDimensions() {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            lecteurVideo.style.width = `${video.videoWidth}px`;
            lecteurVideo.style.height = `${video.videoHeight}px`;

            // Initialiser la vidéo thumbnail
            if (!videoThumbnail.src) {
                videoThumbnail.src = video.src;
            }
        }
    }
    video.addEventListener('loadedmetadata', ajusterDimensions);
    if (video.readyState >= 1) { // Au cas où la vidéo est déjà chargée
        ajusterDimensions();
    }

    // --- 2. Mise à jour des barres de progression ---
    function mettreAJourNiveauChargement() {
        if (video.buffered.length > 0) {
            const pourcentCharge = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
            niveauChargement.style.width = pourcentCharge + '%';
        }
    }
    video.addEventListener('progress', mettreAJourNiveauChargement);
    video.addEventListener('canplay', mettreAJourNiveauChargement);

    function mettreAJourNiveauLecture() {
        const pourcentLecture = (video.currentTime / video.duration) * 100;
        niveauLecture.style.width = pourcentLecture + '%';
    }
    video.addEventListener('timeupdate', mettreAJourNiveauLecture);

    // Clic sur la barre de progression (contrôle la vidéo principale)
    progresseLecture.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const pourcentClique = positionX / largeurBarre;
        const newTime = pourcentClique * video.duration;

        video.currentTime = newTime;
        niveauLecture.style.width = (pourcentClique * 100) + '%';
    });

    // --- 3. Synchronisation des boutons Play/Pause ---
    video.addEventListener('play', function () {
        play.classList.add('cache');
        pause.classList.remove('cache');
    });
    video.addEventListener('pause', function () {
        play.classList.remove('cache');
        pause.classList.add('cache');
    });
    video.addEventListener('ended', function () {
        play.classList.remove('cache');
        pause.classList.add('cache');
    });

    // --- 4. Gestion de la barre de volume ---
    progressVolume.addEventListener('click', function (e) {
        const rect = progressVolume.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const volume = positionX / largeurBarre;
        video.volume = Math.max(0, Math.min(1, volume));
        mettreAJourNiveauVolume();
    });

    // --- 5. LOGIQUE DES MINIATURES ---

    function dessinerMiniature() {
        canvas.width = 120;
        canvas.height = 68;
        try {
            ctx.drawImage(videoThumbnail, 0, 0, canvas.width, canvas.height);
            canvas.style.display = 'block';
        } catch (e) {
            console.error("Erreur de dessin sur le canvas :", e);
            canvas.style.display = 'none'; 
        }
    }
    
    videoThumbnail.addEventListener('seeked', function () {
        if (isScrubbing) {
            dessinerMiniature();
        }
    });

    progresseLecture.addEventListener('mouseenter', function() {
        if (video.readyState < 1) return;
        isScrubbing = true;
    });

    progresseLecture.addEventListener('mousemove', function (e) {
        if (!isScrubbing) return;

        const rect = this.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const temps = (positionX / largeurBarre) * video.duration;

        canvas.style.left = (e.clientX - rect.left - 60) + 'px';

        if (videoThumbnail.readyState >= 1) {
             videoThumbnail.currentTime = temps;
        }
    });

    progresseLecture.addEventListener('mouseleave', function () {
        if (!isScrubbing) return;
        isScrubbing = false;
        canvas.style.display = 'none';
    });
    
    // --- 6. Initialisation Volume ---
    video.addEventListener('volumechange', mettreAJourNiveauVolume);
    mettreAJourNiveauVolume(); // Appel initial

    // --- 7. Synchronisation des boutons ET TAILLE Plein Écran (CORRIGÉ) ---

    function syncFullscreenButtons() {
        const isFullscreen = document.fullscreenElement ||
                             document.mozFullScreenElement ||
                             document.webkitFullscreenElement ||
                             document.msFullscreenElement;

        if (isFullscreen) {
            // On est en plein écran
            fullscreenBtn.classList.add('cache');
            fullscreenOffBtn.classList.remove('cache');
            
            // On force le conteneur à 100% pour écraser le style en ligne
            lecteurVideo.style.width = '100%';
            lecteurVideo.style.height = '100%';
        } else {
            // On n'est pas en plein écran
            fullscreenBtn.classList.remove('cache');
            fullscreenOffBtn.classList.add('cache');
            
            // On ré-applique la taille originale de la vidéo
            ajusterDimensions(); 
        }
    }

    // Écoute les changements d'état (API, touche "Échap", etc.)
    document.addEventListener('fullscreenchange', syncFullscreenButtons);
    document.addEventListener('webkitfullscreenchange', syncFullscreenButtons);
    document.addEventListener('mozfullscreenchange', syncFullscreenButtons);
    document.addEventListener('MSFullscreenChange', syncFullscreenButtons);

});

function downloadVideo() {
    const link = document.createElement('a');
    link.href = video.src;
    link.download = 'ma-video.mp4'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}