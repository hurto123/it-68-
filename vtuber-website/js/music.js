// ================================================
// VTuber Studio - Music Player
// ================================================

'use strict';

let currentTrack = null;
let playlist = [];
let isPlaying = false;
let currentTime = 0;
let duration = 0;
let volume = 1;
let isShuffle = false;
let repeatMode = 'none'; // none, one, all

const audio = new Audio();

// Initialize Music Player
document.addEventListener('DOMContentLoaded', () => {
    initMusicPlayer();
});

function initMusicPlayer() {
    loadPlaylist();
    setupAudioEvents();
    setupControls();
    renderPlaylist();
}

// ================================================
// Load Playlist
// ================================================

function loadPlaylist() {
    playlist = DB.getSongs() || [];
    
    if (playlist.length === 0) {
        addSampleSongs();
        playlist = DB.getSongs();
    }
}

function addSampleSongs() {
    const samples = [
        {
            title: 'Starlight Dream',
            artist: 'VTuber Studio',
            cover: 'assets/music/covers/starlight-dream.jpg',
            audioUrl: 'assets/music/songs/starlight-dream.mp3',
            duration: 240,
            genre: 'Pop'
        },
        {
            title: 'Virtual Love',
            artist: 'VTuber Studio',
            cover: 'assets/music/covers/virtual-love.jpg',
            audioUrl: 'assets/music/songs/virtual-love.mp3',
            duration: 210,
            genre: 'Electronic'
        },
        {
            title: 'Neon Nights',
            artist: 'VTuber Studio',
            cover: 'assets/music/covers/neon-nights.jpg',
            audioUrl: 'assets/music/songs/neon-nights.mp3',
            duration: 195,
            genre: 'Synthwave'
        }
    ];
    
    samples.forEach(song => DB.addSong(song));
}

// ================================================
// Audio Events
// ================================================

function setupAudioEvents() {
    audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
        updateDuration();
    });
    
    audio.addEventListener('timeupdate', () => {
        currentTime = audio.currentTime;
        updateProgress();
    });
    
    audio.addEventListener('ended', () => {
        handleTrackEnd();
    });
    
    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
    });
    
    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });
    
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        VTuberApp.showToast('Failed to load audio', 'error');
    });
}

// ================================================
// Player Controls
// ================================================

function setupControls() {
    // Play/Pause
    document.getElementById('play-btn')?.addEventListener('click', togglePlay);
    
    // Previous/Next
    document.getElementById('prev-btn')?.addEventListener('click', playPrevious);
    document.getElementById('next-btn')?.addEventListener('click', playNext);
    
    // Progress Bar
    const progressBar = document.getElementById('progress-bar');
    progressBar?.addEventListener('click', seekTrack);
    
    // Volume
    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider?.addEventListener('input', changeVolume);
    
    // Shuffle
    document.getElementById('shuffle-btn')?.addEventListener('click', toggleShuffle);
    
    // Repeat
    document.getElementById('repeat-btn')?.addEventListener('click', toggleRepeat);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

function togglePlay() {
    if (!currentTrack) {
        playTrack(0);
        return;
    }
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
}

function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrack = playlist[index];
    audio.src = currentTrack.audioUrl;
    audio.load();
    audio.play();
    
    updateNowPlaying();
    highlightCurrentTrack(index);
    
    // Update play count
    DB.incrementPlayCount(currentTrack.id);
}

function playPrevious() {
    if (!currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : playlist.length - 1;
    
    playTrack(prevIndex);
}

function playNext() {
    if (!currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    let nextIndex;
    
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
        nextIndex = currentIndex + 1 < playlist.length ? currentIndex + 1 : 0;
    }
    
    playTrack(nextIndex);
}

function seekTrack(e) {
    if (!currentTrack) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    audio.currentTime = percent * duration;
}

function changeVolume(e) {
    volume = e.target.value / 100;
    audio.volume = volume;
    updateVolumeIcon();
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    document.getElementById('shuffle-btn')?.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentIndex + 1) % modes.length];
    
    const btn = document.getElementById('repeat-btn');
    btn?.setAttribute('data-mode', repeatMode);
    
    if (repeatMode === 'none') {
        btn?.classList.remove('active');
    } else {
        btn?.classList.add('active');
    }
}

function handleTrackEnd() {
    if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
    } else if (repeatMode === 'all' || currentTrack !== playlist[playlist.length - 1]) {
        playNext();
    } else {
        isPlaying = false;
        updatePlayButton();
    }
}

// ================================================
// UI Updates
// ================================================

function updateNowPlaying() {
    if (!currentTrack) return;
    
    document.getElementById('current-title').textContent = currentTrack.title;
    document.getElementById('current-artist').textContent = currentTrack.artist;
    document.getElementById('current-cover').src = currentTrack.cover || 'assets/images/placeholder.jpg';
}

function updateProgress() {
    const percent = (currentTime / duration) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('current-time').textContent = formatTime(currentTime);
}

function updateDuration() {
    document.getElementById('total-time').textContent = formatTime(duration);
}

function updatePlayButton() {
    const btn = document.getElementById('play-btn');
    const icon = btn?.querySelector('svg use');
    
    if (isPlaying) {
        icon?.setAttribute('href', '#icon-pause');
        btn?.classList.add('playing');
    } else {
        icon?.setAttribute('href', '#icon-play');
        btn?.classList.remove('playing');
    }
}

function updateVolumeIcon() {
    const icon = document.getElementById('volume-icon');
    
    if (volume === 0) {
        icon?.setAttribute('href', '#icon-volume-mute');
    } else if (volume < 0.5) {
        icon?.setAttribute('href', '#icon-volume-low');
    } else {
        icon?.setAttribute('href', '#icon-volume-high');
    }
}

function highlightCurrentTrack(index) {
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-index="${index}"]`)?.classList.add('active');
}

// ================================================
// Render Playlist
// ================================================

function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    
    if (!container) return;
    
    if (playlist.length === 0) {
        container.innerHTML = '<p class="empty-message">No songs in playlist</p>';
        return;
    }
    
    container.innerHTML = playlist.map((track, index) => `
        <div class="playlist-item" data-index="${index}" onclick="playTrack(${index})">
            <div class="track-number">${index + 1}</div>
            <img src="${track.cover || 'assets/images/placeholder.jpg'}" alt="${track.title}" class="track-cover">
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-duration">${formatTime(track.duration || 0)}</div>
            <button class="track-menu-btn" onclick="event.stopPropagation(); showTrackMenu(${index})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    ircle cx="1212" cy="5" r="2"/>
                    ircle cx="="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// ================================================
// Utilities
// ================================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleKeyboard(e) {
    // Space - Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
    }
    
    // Arrow Left - Previous
    if (e.code === 'ArrowLeft' && e.ctrlKey) {
        playPrevious();
    }
    
    // Arrow Right - Next
    if (e.code === 'ArrowRight' && e.ctrlKey) {
        playNext();
    }
    
    // Arrow Up - Volume Up
    if (e.code === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        const newVolume = Math.min(volume + 0.1, 1);
        document.getElementById('volume-slider').value = newVolume * 100;
        changeVolume({ target: { value: newVolume * 100 } });
    }
    
    // Arrow Down - Volume Down
    if (e.code === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        const newVolume = Math.max(volume - 0.1, 0);
        document.getElementById('volume-slider').value = newVolume * 100;
        changeVolume({ target: { value: newVolume * 100 } });
    }
}

function showTrackMenu(index) {
    // Track menu functionality
    const track = playlist[index];
    
    const menu = confirm(`Options for "${track.title}":\n\n1. Add to favorites\n2. Share\n3. Download`);
    
    if (menu) {
        // Handle menu action
    }
}

console.log('🎵 Music player initialized');
