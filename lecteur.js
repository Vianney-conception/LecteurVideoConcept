const video = document.getElementById('maVideo');
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
const fullscreenBtn = document.getElementById('fullscreen');
const fullscreenOffBtn = document.getElementById('fullscreenoff');
// MODIFIÉ: Récupérer le bouton ET le paragraphe pour l'affichage du temps
const timeButton = document.getElementById('Time');
const timeDisplay = timeButton.querySelector('p');
const videoThumbnail = document.createElement('video');
videoThumbnail.muted = true;
videoThumbnail.preload = 'auto';
videoThumbnail.crossOrigin = "anonymous";
let isScrubbing = false;
// NOUVELLE LIGNE: Variable d'état pour le format de l'heure
let isTimeRemaining = false;

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

function FullscreenOn() {
    if (lecteurVideo.requestFullscreen) {
        lecteurVideo.requestFullscreen();
    } else if (lecteurVideo.mozRequestFullScreen) {
        lecteurVideo.mozRequestFullScreen();
    } else if (lecteurVideo.webkitRequestFullscreen) {
        lecteurVideo.webkitRequestFullscreen();
    } else if (lecteurVideo.msRequestFullscreen) {
        lecteurVideo.msRequestFullscreen();
    }
}

function FullscreenOff() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// NOUVELLE FONCTION: Pour formater les secondes en MM:SS
function formatTime(secondes) {
    // Gérer le cas où la durée n'est pas encore disponible (NaN) ou est infinie
    if (isNaN(secondes) || !isFinite(secondes)) {
        return "0:00";
    }

    const minutes = Math.floor(secondes / 60);
    const resteSecondes = Math.floor(secondes % 60);
    // padStart ajoute un '0' si le nombre de secondes est < 10
    const secondesPadees = resteSecondes.toString().padStart(2, '0');
    return `${minutes}:${secondesPadees}`;
}

document.addEventListener('DOMContentLoaded', function () {
    
    // Fonction modifiée pour charger la miniature
    function ajusterDimensions() {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            lecteurVideo.style.width = `${video.videoWidth}px`;
            lecteurVideo.style.height = `${video.videoHeight}px`;

            // On s'assure de ne définir la source qu'une seule fois
            if (!videoThumbnail.src) {
                const originalSrc = video.src;

                // 1. Construire le nouveau nom de fichier
                const dotIndex = originalSrc.lastIndexOf('.');
                let pictureSrc = originalSrc; // Par défaut, la source originale

                if (dotIndex > -1) {
                    const baseName = originalSrc.substring(0, dotIndex);
                    const extension = originalSrc.substring(dotIndex);
                    pictureSrc = `${baseName}_Picture${extension}`;
                }

                // 2. Ajouter un gestionnaire d'erreur AVANT de définir la source
                videoThumbnail.addEventListener('error', function handleThumbnailError() {
                    console.warn(`Miniature '${pictureSrc}' non trouvée. Utilisation de la vidéo principale.`);
                    videoThumbnail.src = originalSrc;
                    videoThumbnail.removeEventListener('error', handleThumbnailError);
                });

                // 3. Tenter de charger la version _Picture
                videoThumbnail.src = pictureSrc;
            }
        }
    }
    
    // MODIFIÉ: Ajout de l'appel à mettreAJourAffichageTemps
    video.addEventListener('loadedmetadata', () => {
        ajusterDimensions();
        mettreAJourAffichageTemps(); // Mettre à jour le temps total une fois chargé
    });

    if (video.readyState >= 1) {
        ajusterDimensions();
        mettreAJourAffichageTemps(); // Mettre à jour aussi si déjà chargé
    }

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

    // MODIFIÉ: Mettre à jour le texte du temps en fonction de l'état
    function mettreAJourAffichageTemps() {
        const tempsActuel = video.currentTime;
        const dureeTotale = video.duration;

        if (isTimeRemaining) {
            // Afficher le temps restant
            const tempsRestant = dureeTotale - tempsActuel;
            timeDisplay.textContent = `-${formatTime(tempsRestant)}`;
        } else {
            // Afficher le temps actuel / durée totale
            timeDisplay.textContent = `${formatTime(tempsActuel)} / ${formatTime(dureeTotale)}`;
        }
    }

    // MODIFIÉ: Ajout de l'appel à mettreAJourAffichageTemps
    video.addEventListener('timeupdate', () => {
        mettreAJourNiveauLecture();
        mettreAJourAffichageTemps(); // Mettre à jour le temps actuel
    });
    
    // NOUVELLE LIGNE: Ajout de l'écouteur de clic pour basculer l'affichage du temps
    timeButton.addEventListener('click', () => {
        isTimeRemaining = !isTimeRemaining; // Basculer l'état
        mettreAJourAffichageTemps(); // Mettre à jour l'affichage immédiatement
    });

    progresseLecture.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const pourcentClique = positionX / largeurBarre;
        const newTime = pourcentClique * video.duration;

        video.currentTime = newTime;
        niveauLecture.style.width = (pourcentClique * 100) + '%';
    });

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

    progressVolume.addEventListener('click', function (e) {
        const rect = progressVolume.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const volume = positionX / largeurBarre;
        video.volume = Math.max(0, Math.min(1, volume));
        mettreAJourNiveauVolume();
    });


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

    progresseLecture.addEventListener('mouseenter', function () {
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

    video.addEventListener('volumechange', mettreAJourNiveauVolume);
    mettreAJourNiveauVolume();


    function syncFullscreenButtons() {
        const isFullscreen = document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;

        if (isFullscreen) {
            fullscreenBtn.classList.add('cache');
            fullscreenOffBtn.classList.remove('cache');

            lecteurVideo.style.width = '100%';
            lecteurVideo.style.height = '100%';
        } else {
            fullscreenBtn.classList.remove('cache');
            fullscreenOffBtn.classList.add('cache');
            ajusterDimensions();
        }
    }

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