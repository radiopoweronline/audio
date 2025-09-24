// Global variables
let currentSlide = 0;
let currentTrack = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeating = false;
let currentTime = 0;
let duration = 272; // 4:32 in seconds (default duration for Techno Nights)
let volume = 0.7;
let playInterval;
let currentImageIndex = 0;

// Gallery data
const galleryImages = [
    {
        src: "https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "DJ Performance",
        subtitle: "Live at Club Underground",
        description: "An electrifying performance at the iconic Club Underground, 2024."
    },
    {
        src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "Live Event",
        subtitle: "Festival Electro 2023",
        description: "High-energy set at the annual Electro Festival."
    },
    {
        src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "Studio Session",
        subtitle: "Creating New Tracks",
        description: "Behind the scenes in the studio, crafting the next big hit."
    },
    {
        src: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "DJ Equipment",
        subtitle: "Gear Setup",
        description: "A look at the professional DJ setup used for live performances."
    },
    {
        src: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "Concert Crowd",
        subtitle: "Nexus Night 2023",
        description: "The crowd goes wild during an epic performance."
    },
    {
        src: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "DJ Mixing",
        subtitle: "Live Mixing Session",
        description: "Mastering the decks with seamless transitions."
    },
    {
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "Stage Lights",
        subtitle: "Festival Lighting",
        description: "Vibrant stage lighting enhances the performance atmosphere."
    },
    {
        src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        title: "Festival Stage",
        subtitle: "Main Stage Performance",
        description: "Headlining the main stage at a major electronic music festival."
    }
];

// Track data
const tracks = [
    {
        title: "Techno Nights",
        artist: "DJ NEXUS",
        artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
        duration: 272 // 4:32
    },
    {
        title: "House Vibes",
        artist: "DJ NEXUS",
        artwork: "https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
        duration: 318 // 5:18
    },
    {
        title: "Electronic Fusion",
        artist: "DJ NEXUS",
        artwork: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
        duration: 405 // 6:45
    },
    {
        title: "Deep Bass",
        artist: "DJ NEXUS",
        artwork: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
        duration: 252 // 4:12
    }
];

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('timeDisplay');
const currentTrackDisplay = document.getElementById('currentTrack');
const trackArtwork = document.getElementById('trackArtwork');
const playlistBtn = document.getElementById('playlistBtn');
const playlist = document.getElementById('playlist');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu');
const slides = document.querySelectorAll('.slide');
const slideDots = document.querySelectorAll('.slide-dot');
const slideProgress = document.getElementById('slideProgress');
const modal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalDescription = document.getElementById('modalDescription');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial track
    updateTrackInfo(currentTrack);

    // Update current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Initialize audio player
    audioPlayer.volume = volume;
    volumeSlider.value = volume * 100;

    // Start slider
    startSlider();

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '100px' });

    images.forEach(img => observer.observe(img));

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    // Progress bar click
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        currentTime = percentage * duration;
        audioPlayer.currentTime = currentTime;
        updateProgress();
    });

    // Update progress
    audioPlayer.addEventListener('timeupdate', () => {
        currentTime = audioPlayer.currentTime;
        updateProgress();
    });

    // Play button
    playBtn.addEventListener('click', togglePlay);

    // Playlist toggle
    playlistBtn.addEventListener('click', () => {
        playlist.classList.toggle('hidden');
    });
});

// Slider Functions
function startSlider() {
    updateSlider();
    setInterval(() => {
        nextSlide();
    }, 5000);
}

function updateSlider() {
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    slideDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
        dot.classList.toggle('bg-cyan-400', index === currentSlide);
        dot.classList.toggle('bg-gray-500', index !== currentSlide);
    });

    // Reset and animate progress bar
    slideProgress.style.width = '0%';
    slideProgress.style.transition = 'none';
    setTimeout(() => {
        slideProgress.style.transition = 'width 5s linear';
        slideProgress.style.width = '100%';
    }, 50);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
}

function changeSlide(index) {
    currentSlide = index;
    updateSlider();
}

// Audio Player Functions
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        clearInterval(playInterval);
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        audioPlayer.play();
        playInterval = setInterval(updateProgress, 1000);
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
    isPlaying = !isPlaying;
    playBtn.classList.toggle('active', isPlaying);
}

function playTrack(index) {
    currentTrack = index;
    updateTrackInfo(currentTrack);
    currentTime = 0;
    duration = tracks[currentTrack].duration;
    audioPlayer.currentTime = 0;
    if (isPlaying) {
        audioPlayer.play();
    } else {
        togglePlay();
    }
}

function selectTrack(index) {
    playTrack(index);
}

function previousTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(currentTrack);
}

function nextTrack() {
    if (isShuffled) {
        let newTrack;
        do {
            newTrack = Math.floor(Math.random() * tracks.length);
        } while (newTrack === currentTrack);
        currentTrack = newTrack;
    } else {
        currentTrack = (currentTrack + 1) % tracks.length;
    }
    playTrack(currentTrack);
}

function updateTrackInfo(index) {
    currentTrackDisplay.textContent = tracks[index].title;
    trackArtwork.src = tracks[index].artwork;
    trackArtwork.alt = tracks[index].title;
    duration = tracks[index].duration;
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    updateProgress();
}

function updateProgress() {
    const percentage = (currentTime / duration) * 100;
    progressBar.style.width = `${percentage}%`;
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = Math.floor(currentTime % 60);
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
}

function toggleMute() {
    if (audioPlayer.muted) {
        audioPlayer.muted = false;
        volumeBtn.innerHTML = `
            <svg id="volumeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>`;
        audioPlayer.volume = volume;
        volumeSlider.value = volume * 100;
    } else {
        audioPlayer.muted = true;
        volumeBtn.innerHTML = `
            <svg id="volumeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>`;
        volumeSlider.value = 0;
    }
}

function changeVolume() {
    volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    audioPlayer.muted = volume === 0;
    volumeBtn.innerHTML = volume === 0 ? `
        <svg id="volumeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>` : `
        <svg id="volumeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>`;
}

// Gallery Modal Functions
function openModal(index) {
    currentImageIndex = index;
    updateModal();
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModal();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateModal();
}

function updateModal() {
    const image = galleryImages[currentImageIndex];
    modalImage.src = image.src;
    modalImage.alt = image.title;
    modalTitle.textContent = image.title;
    modalSubtitle.textContent = image.subtitle;
    modalDescription.textContent = image.description;
}

// Contact Form Submission
function handleContact(event) {
    event.preventDefault();
    alert('Mensaje enviado con éxito. ¡Gracias por contactar a DJ NEXUS!');
    event.target.reset();
}

// Simulate audio player progress for demo
playInterval = setInterval(() => {
    if (isPlaying) {
        currentTime = (currentTime + 1) % (duration + 1);
        updateProgress();
        if (currentTime >= duration) {
            if (isRepeating) {
                currentTime = 0;
                audioPlayer.currentTime = 0;
            } else {
                nextTrack();
            }
        }
    }
}, 1000);