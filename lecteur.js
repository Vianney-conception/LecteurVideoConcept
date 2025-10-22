document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('.lecteur-video video');
    const lecteurVideo = document.querySelector('.lecteur-video');

    function ajusterDimensions() {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            lecteurVideo.style.width = `${video.videoWidth}px`;
            lecteurVideo.style.height = `${video.videoHeight}px`;
        }
    }
    video.addEventListener('loadedmetadata', ajusterDimensions);
    if (video.readyState >= 1) {
        ajusterDimensions();
    }
});
const niveauLecture = document.getElementById('NiveauLecture');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const video = document.getElementById('maVideo');
const progressVolume = document.getElementById('ProgressVolume');
const niveauVolume = document.getElementById('NiveauVolume');
const VolumeoffBtn = document.getElementById('Volumeoff');
const VolumeonBtn = document.getElementById('Volumeon');

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

document.addEventListener('DOMContentLoaded', function () {
    
    function mettreAJourNiveauLecture() {
        const pourcentLecture = (video.currentTime / video.duration) * 100;
        niveauLecture.style.width = pourcentLecture + '%';
    }

    video.addEventListener('timeupdate', mettreAJourNiveauLecture);

    document.getElementById('ProgresseLecture').addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const positionX = e.clientX - rect.left;
        const largeurBarre = rect.width;
        const pourcentClique = positionX / largeurBarre;
        video.currentTime = pourcentClique * video.duration;
        });

    function mettreAJourNiveauVolume() {
        const volume = video.volume;
        const volumePourcent = volume * 100;
        niveauVolume.style.width = volumePourcent + '%';
        if (volume === 0) {
            VolumeoffBtn.classList.add('cache');
            VolumeonBtn.classList.remove('cache');
        }else {
            VolumeoffBtn.classList.remove('cache');
            VolumeonBtn.classList.add('cache');
        }
    }

     video.addEventListener('play', function() {
        play.classList.add('cache');
        pause.classList.remove('cache');
    });

    video.addEventListener('pause', function() {
        play.classList.remove('cache');
        pause.classList.add('cache');
    });

    video.addEventListener('ended', function() {
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
    video.addEventListener('volumechange', mettreAJourNiveauVolume);
    mettreAJourNiveauVolume();
});



function Volumeoff() {
    video.volume = 0 % 1;
    mettreAJourNiveauVolume();
}

function Volumeon() {
    video.volume = 1;
    mettreAJourNiveauVolume();
}

