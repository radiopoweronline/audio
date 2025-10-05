// ========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ========================================

const SHEET_ID = '1yuB2GkW9399OAyjpxDBCUQM2YmNzDHRMDSIw4XfV4hQ';

const SHEET_URLS = {
    slider: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Slider`,
    djs: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=DJs`,
    top5: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Top5`,
    galeria: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Galeria`,
    videos: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Videos`,
    redes: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Redes`
};

// ========================================
// VARIABLES GLOBALES
// ========================================

let sheetsData = {};
let currentSlideIndex = 1;
let slideInterval = null;
let isPlaying = false;
let currentVolume = 70;
let radioAudio = null;
let currentModalIndex = 0;
let modalImages = [];

// Cache DOM elements
const DOM = {
    debugStatus: document.getElementById('debugStatus'),
    debugData: document.getElementById('debugData'),
    debugInfo: document.getElementById('debugInfo'),
    slidesWrapper: document.getElementById('slidesWrapper'),
    sliderNav: document.getElementById('sliderNav'),
    djsContainer: document.getElementById('djsContainer'),
    top5Container: document.getElementById('top5Container'),
    galleryContainer: document.getElementById('galleryContainer'),
    videosContainer: document.getElementById('videosContainer'),
    radioStream: document.getElementById('radioStream'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    songTitle: document.getElementById('songTitle'),
    songArtist: document.getElementById('songArtist'),
    mobileMenu: document.getElementById('mobileMenu'),
    galleryModal: document.getElementById('galleryModal'),
    modalImage: document.getElementById('modalImage'),
    modalTitle: document.getElementById('modalTitle'),
    modalDescription: document.getElementById('modalDescription'),
    modalPrevBtn: document.getElementById('modalPrevBtn'),
    modalNextBtn: document.getElementById('modalNextBtn')
};

// Memoization cache for CSV parsing
const csvCache = new Map();

// ========================================
// FUNCIONES DE DEBUG
// ========================================

function updateDebugInfo(status, data = null) {
    if (DOM.debugStatus) DOM.debugStatus.textContent = status;
    if (DOM.debugData && data) {
        DOM.debugData.innerHTML = Object.entries(data)
            .map(([key, value]) => `${key}: ${value?.length || 0} elementos`)
            .join('<br>');
    }
}

function toggleDebug() {
    if (DOM.debugInfo) {
        DOM.debugInfo.style.display = DOM.debugInfo.style.display === 'none' ? 'block' : 'none';
    }
}

// Debounced keydown handler for debug toggle
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};

document.addEventListener('keydown', debounce(e => {
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDebug();
    }
}, 200));

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('🚀 Iniciando Urban Radio...');
    updateDebugInfo('Iniciando aplicación...');
    
    try {
        await loadAllSheetsData();
        renderAllContent();
        initRadioPlayer();
        updateDebugInfo('✅ Aplicación cargada', sheetsData);
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
        updateDebugInfo('❌ Error de carga, usando contenido por defecto');
        loadDefaultContent();
    }
}

// ========================================
// CARGA DE DATOS DESDE GOOGLE SHEETS
// ========================================

async function loadAllSheetsData() {
    console.log('📊 Cargando datos desde Google Sheets...');
    updateDebugInfo('Cargando datos de Google Sheets...');
    
    const promises = Object.entries(SHEET_URLS).map(async ([key, url]) => {
        try {
            console.log(`📥 Cargando ${key}...`);
            const data = await fetchSheetData(url);
            sheetsData[key] = data;
            console.log(`✅ ${key} cargado:`, data.length, 'elementos');
        } catch (error) {
            console.warn(`⚠️ Error cargando ${key}:`, error);
            sheetsData[key] = [];
        }
    });
    
    await Promise.all(promises);
    console.log('📊 Todos los datos cargados:', sheetsData);
}

async function fetchSheetData(url) {
    if (csvCache.has(url)) {
        return csvCache.get(url);
    }
    
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const data = parseCSV(csvText);
    csvCache.set(url, data);
    return data;
}

function parseCSV(csvText) {
    return csvText.split('\n')
        .filter(line => line.trim())
        .map(line => line.split(',')
            .map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()));
}

// ========================================
// RENDERIZADO DE CONTENIDO
// ========================================

function renderAllContent() {
    console.log('🎨 Renderizando contenido...');
    updateDebugInfo('Renderizando contenido...');
    renderSlider();
    renderDJs();
    renderTop5();
    renderGallery();
    renderVideos();
}

function loadDefaultContent() {
    console.log('📦 Cargando contenido por defecto...');
    
    DOM.slidesWrapper.innerHTML = `
        <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(118, 75, 162, 0) 100%);">
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <h2 class="slide-title">Bienvenido a Urban Radio</h2>
                <p class="slide-description">La mejor música urbana las 24 horas del día</p>
            </div>
        </div>
    `;
    
    DOM.djsContainer.innerHTML = `
        <div class="dj-card">
            <div class="dj-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                <div class="dj-overlay"></div>
            </div>
            <div class="dj-info">
                <h3>DJ Urban</h3>
                <p class="dj-specialty">Reggaeton & Trap</p>
                <div class="dj-schedule-container">
                    <p class="dj-schedule">Lunes a Viernes 8:00 PM - 12:00 AM</p>
                </div>
            </div>
        </div>
    `;
    
    DOM.top5Container.innerHTML = `
        <div class="top5-item">
            <div class="top5-number">1</div>
            <div class="top5-thumbnail" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
            <div class="top5-info">
                <div class="top5-title">Canción Popular</div>
                <div class="top5-artist">Artista Urbano</div>
            </div>
            <button class="top5-play-btn">▶</button>
        </div>
    `;
    
    DOM.galleryContainer.innerHTML = `
        <div class="gallery-item">
            <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>Evento Urban Radio</h3>
                </div>
            </div>
        </div>
    `;
    
    DOM.videosContainer.innerHTML = `
        <div class="video-container">
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Destacado" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h3 class="video-title">Video Destacado</h3>
                <p class="video-description">Contenido destacado de Urban Radio</p>
            </div>
        </div>
    `;
}

// ========================================
// SLIDER
// ========================================

function renderSlider() {
    const slides = sheetsData.slider || [];
    
    if (slides.length <= 1) {
        DOM.slidesWrapper.innerHTML = `
            <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2 class="slide-title">Urban Radio</h2>
                    <p class="slide-description">La mejor música urbana 24/7</p>
                </div>
            </div>
        `;
        DOM.sliderNav.innerHTML = '<div class="slider-dot active"></div>';
        return;
    }

    const activeSlides = slides.slice(1).filter(slide => 
        slide.length >= 5 && slide[4]?.toLowerCase() === 'activo'
    );

    if (activeSlides.length === 0) {
        DOM.slidesWrapper.innerHTML = `
            <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2 class="slide-title">Urban Radio</h2>
                    <p class="slide-description">La mejor música urbana 24/7</p>
                </div>
            </div>
        `;
        DOM.sliderNav.innerHTML = '<div class="slider-dot active"></div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    const navFragment = document.createDocumentFragment();
    
    activeSlides.forEach((slide, index) => {
        const [titulo, descripcion, imagen, enlace] = slide;
        const backgroundStyle = imagen?.trim() 
            ? `background-image: url('${imagen.trim()}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);`;
        
        const slideDiv = document.createElement('div');
        slideDiv.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slideDiv.style = backgroundStyle;
        slideDiv.innerHTML = `
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <h2 class="slide-title">${titulo || 'Título del Slide'}</h2>
                <p class="slide-description">${descripcion || 'Descripción del slide'}</p>
                ${enlace?.trim() ? `<a href="${enlace.trim()}" class="slide-btn" target="_blank" rel="noopener noreferrer">Ver Más</a>` : ''}
            </div>
        `;
        
        const dotDiv = document.createElement('div');
        dotDiv.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dotDiv.onclick = () => currentSlide(index + 1);
        
        fragment.appendChild(slideDiv);
        navFragment.appendChild(dotDiv);
    });

    DOM.slidesWrapper.innerHTML = '';
    DOM.sliderNav.innerHTML = '';
    DOM.slidesWrapper.appendChild(fragment);
    DOM.sliderNav.appendChild(navFragment);

    if (activeSlides.length > 1) {
        initSlider();
    }
}

function initSlider() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(nextSlide, 5000);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (slides.length === 0) return;
    
    if (n > slides.length) currentSlideIndex = 1;
    if (n < 1) currentSlideIndex = slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentSlideIndex - 1]?.classList.add('active');
    dots[currentSlideIndex - 1]?.classList.add('active');
}

function currentSlide(n) {
    currentSlideIndex = n;
    showSlide(currentSlideIndex);
    
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
}

function nextSlide() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}

function prevSlide() {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
    
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
}

// ========================================
// DJS
// ========================================

function renderDJs() {
    const djs = sheetsData.djs || [];
    
    if (djs.length <= 1) {
        DOM.djsContainer.innerHTML = `
            <div class="dj-card">
                <div class="dj-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                    <div class="dj-overlay"></div>
                </div>
                <div class="dj-info">
                    <h3>DJ Urban</h3>
                    <p class="dj-specialty">Reggaeton & Trap</p>
                    <p class="dj-schedule">Lunes a Viernes 8:00 PM - 12:00 AM</p>
                </div>
            </div>
        `;
        return;
    }

    const activeDJs = djs.slice(1).filter(dj => 
        dj.length >= 6 && dj[5]?.toLowerCase() === 'activo'
    );

    if (activeDJs.length === 0) {
        DOM.djsContainer.innerHTML = `
            <div class="dj-card">
                <div class="dj-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                    <div class="dj-overlay"></div>
                </div>
                <div class="dj-info">
                    <h3>DJ Urban</h3>
                    <p class="dj-specialty">Reggaeton & Trap</p>
                    <p class="dj-schedule">Lunes a Viernes 8:00 PM - 12:00 AM</p>
                </div>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    activeDJs.forEach(dj => {
        const [nombre, especialidad, horario, imagen, youtube] = dj;
        const djDiv = document.createElement('div');
        djDiv.className = 'dj-card';
        djDiv.innerHTML = `
            <div class="dj-image" style="background-image: url('${imagen || ''}')">
                <div class="dj-overlay"></div>
            </div>
            <div class="dj-info">
                <h3>${nombre || 'DJ Sin Nombre'}</h3>
                <p class="dj-specialty">${especialidad || 'Especialidad'}</p>
                <p class="dj-schedule">${horario || 'Horario por definir'}</p>
                ${youtube ? `
                    <a href="${youtube}" class="dj-youtube-link" target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube
                    </a>
                ` : ''}
            </div>
        `;
        fragment.appendChild(djDiv);
    });

    DOM.djsContainer.innerHTML = '';
    DOM.djsContainer.appendChild(fragment);
}

// ========================================
// TOP 5 VIDEOS
// ========================================

function renderTop5() {
    const top5 = sheetsData.top5 || [];
    
    if (top5.length <= 1) {
        DOM.top5Container.innerHTML = `
            <div class="top5-item">
                <div class="top5-number">1</div>
                <div class="top5-thumbnail" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="top5-info">
                    <div class="top5-title">Canción Popular</div>
                    <div class="top5-artist">Artista Urbano</div>
                </div>
                <button class="top5-play-btn" onclick="alert('Función de reproducción no disponible')">▶</button>
            </div>
        `;
        return;
    }

    const activeTop5 = top5.slice(1).filter(video => 
        video.length >= 5 && video[4]?.toLowerCase() === 'activo'
    );

    if (activeTop5.length === 0) {
        DOM.top5Container.innerHTML = `
            <div class="top5-item">
                <div class="top5-number">1</div>
                <div class="top5-thumbnail" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="top5-info">
                    <div class="top5-title">Canción Popular</div>
                    <div class="top5-artist">Artista Urbano</div>
                </div>
                <button class="top5-play-btn" onclick="alert('Función de reproducción no disponible')">▶</button>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    activeTop5.forEach((video, index) => {
        const [artista, cancion, youtubeId, posicion] = video;
        const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId || 'dQw4w9WgXcQ'}/mqdefault.jpg`;
        const escapedCancion = (cancion || 'Canción').replace(/'/g, "\\'");
        const escapedArtista = (artista || 'Artista').replace(/'/g, "\\'");
        
        const videoDiv = document.createElement('div');
        videoDiv.className = 'top5-item';
        videoDiv.innerHTML = `
            <div class="top5-number">${posicion || (index + 1)}</div>
            <div class="top5-thumbnail" style="background-image: url('${thumbnailUrl}')" onclick="playTop5Video('${youtubeId || 'dQw4w9WgXcQ'}', '${escapedCancion}', '${escapedArtista}')"></div>
            <div class="top5-info">
                <div class="top5-title">${cancion || 'Canción Sin Título'}</div>
                <div class="top5-artist">${artista || 'Artista Desconocido'}</div>
            </div>
            <button class="top5-play-btn" onclick="playTop5Video('${youtubeId || 'dQw4w9WgXcQ'}', '${escapedCancion}', '${escapedArtista}')">▶</button>
        `;
        fragment.appendChild(videoDiv);
    });

    DOM.top5Container.innerHTML = '';
    DOM.top5Container.appendChild(fragment);
}

function playTop5Video(videoId, title, artist) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <span class="close" onclick="this.parentElement.remove()">&times;</span>
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
            <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; margin-bottom: 1rem;">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 15px;"
                    title="${title} - ${artist}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div style="text-align: center; background: rgba(15, 20, 25, 0.95); padding: 1.5rem; border-radius: 15px; backdrop-filter: blur(15px); border: 1px solid rgba(0, 255, 255, 0.2);">
                <h3 style="color: #00ffff; font-family: 'Orbitron', monospace; margin-bottom: 0.5rem; font-size: 1.2rem;">${title}</h3>
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.5;">${artist}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    };
}

// ========================================
// GALERÍA
// ========================================

function renderGallery() {
    const gallery = sheetsData.galeria || [];
    
    if (gallery.length <= 1) {
        DOM.galleryContainer.innerHTML = `
            <div class="gallery-item">
                <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>Evento Urban Radio</h3>
                    </div>
                </div>
            </div>
        `;
        modalImages = [{ titulo: 'Evento Urban Radio', descripcion: 'Contenido de ejemplo', imagen: '' }];
        return;
    }

    const activeImages = gallery.slice(1).filter(item => 
        item.length >= 4 && item[3]?.toLowerCase() === 'activo'
    );

    if (activeImages.length === 0) {
        DOM.galleryContainer.innerHTML = `
            <div class="gallery-item">
                <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>Evento Urban Radio</h3>
                    </div>
                </div>
            </div>
        `;
        modalImages = [{ titulo: 'Evento Urban Radio', descripcion: 'Contenido de ejemplo', imagen: '' }];
        return;
    }

    modalImages = activeImages.map(item => ({
        titulo: item[0] || 'Sin título',
        descripcion: item[1] || 'Sin descripción',
        imagen: item[2] || ''
    }));

    const fragment = document.createDocumentFragment();
    
    activeImages.forEach((item, index) => {
        const [titulo, , imagen] = item;
        const backgroundStyle = imagen?.trim() 
            ? `background-image: url('${imagen.trim()}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);`;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        itemDiv.onclick = () => openModal(index);
        itemDiv.innerHTML = `
            <div class="gallery-image" style="${backgroundStyle}"></div>
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${titulo || 'Sin título'}</h3>
                </div>
            </div>
        `;
        fragment.appendChild(itemDiv);
    });

    DOM.galleryContainer.innerHTML = '';
    DOM.galleryContainer.appendChild(fragment);
}

function openModal(index) {
    if (modalImages.length === 0) return;
    
    currentModalIndex = index;
    
    showModalImage();
    updateModalNavButtons();
    DOM.galleryModal.style.display = 'block';
    
    DOM.galleryModal.onclick = event => {
        if (event.target === DOM.galleryModal) {
            closeModal();
        }
    };
}

function showModalImage() {
    if (modalImages.length === 0 || currentModalIndex < 0 || currentModalIndex >= modalImages.length) return;
    
    const currentImage = modalImages[currentModalIndex];
    DOM.modalImage.src = currentImage.imagen;
    DOM.modalTitle.textContent = currentImage.titulo;
    DOM.modalDescription.textContent = currentImage.descripcion;
}

function updateModalNavButtons() {
    if (modalImages.length <= 1) {
        DOM.modalPrevBtn.style.display = 'none';
        DOM.modalNextBtn.style.display = 'none';
        return;
    }
    
    DOM.modalPrevBtn.style.display = 'flex';
    DOM.modalNextBtn.style.display = 'flex';
    
    DOM.modalPrevBtn.disabled = currentModalIndex === 0;
    DOM.modalNextBtn.disabled = currentModalIndex === modalImages.length - 1;
}

function prevModalImage() {
    if (currentModalIndex > 0) {
        currentModalIndex--;
        showModalImage();
        updateModalNavButtons();
    }
}

function nextModalImage() {
    if (currentModalIndex < modalImages.length - 1) {
        currentModalIndex++;
        showModalImage();
        updateModalNavButtons();
    }
}

function closeModal() {
    DOM.galleryModal.style.display = 'none';
}

// ========================================
// VIDEOS
// ========================================

function renderVideos() {
    const videos = sheetsData.videos || [];
    
    if (videos.length <= 1) {
        DOM.videosContainer.innerHTML = `
            <div class="video-container">
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Destacado" allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <h3 class="video-title">Video Destacado</h3>
                    <p class="video-description">Contenido destacado de Urban Radio</p>
                </div>
            </div>
        `;
        return;
    }

    const activeVideos = videos.slice(1).filter(video => 
        video.length >= 4 && video[3]?.toLowerCase() === 'activo'
    );

    if (activeVideos.length === 0) {
        DOM.videosContainer.innerHTML = `
            <div class="video-container">
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Destacado" allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <h3 class="video-title">Video Destacado</h3>
                    <p class="video-description">Contenido destacado de Urban Radio</p>
                </div>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    activeVideos.forEach(video => {
        const [titulo, youtubeId, descripcion] = video;
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        videoDiv.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${youtubeId || 'dQw4w9WgXcQ'}" 
                    title="${titulo || 'Video Sin Título'}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <h3 class="video-title">${titulo || 'Video Sin Título'}</h3>
                <p class="video-description">${descripcion || 'Descripción del video'}</p>
            </div>
        `;
        fragment.appendChild(videoDiv);
    });

    DOM.videosContainer.innerHTML = '';
    DOM.videosContainer.appendChild(fragment);
}

// ========================================
// REPRODUCTOR DE RADIO
// ========================================

function initRadioPlayer() {
    radioAudio = DOM.radioStream;
    
    if (radioAudio) {
        radioAudio.volume = currentVolume / 100;
        
        radioAudio.addEventListener('loadstart', () => console.log('🎵 Iniciando carga del stream...'));
        radioAudio.addEventListener('canplay', () => console.log('🎵 Stream listo para reproducir'));
        radioAudio.addEventListener('error', e => {
            console.error('❌ Error en el stream de radio:', e);
            updateSongInfo('Error de conexión', 'Reintentando...');
        });
        radioAudio.addEventListener('play', () => {
            console.log('▶️ Reproducción iniciada');
            isPlaying = true;
            updatePlayButton();
        });
        radioAudio.addEventListener('pause', () => {
            console.log('⏸️ Reproducción pausada');
            isPlaying = false;
            updatePlayButton();
        });
    }
}

function togglePlay() {
    if (!radioAudio) {
        console.error('❌ Audio element not found');
        return;
    }
    
    if (isPlaying) {
        radioAudio.pause();
        console.log('⏸️ Pausando radio...');
    } else {
        radioAudio.play().then(() => {
            console.log('▶️ Reproduciendo radio...');
        }).catch(error => {
            console.error('❌ Error al reproducir:', error);
            alert('Error al conectar con la radio. Por favor, intenta de nuevo.');
        });
    }
}

function updatePlayButton() {
    if (DOM.playIcon && DOM.pauseIcon) {
        DOM.playIcon.style.display = isPlaying ? 'none' : 'block';
        DOM.pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
}

function changeVolume(value) {
    currentVolume = value;
    if (radioAudio) {
        radioAudio.volume = currentVolume / 100;
    }
    console.log('🔊 Volumen cambiado a:', currentVolume + '%');
}

function updateSongInfo(title, artist) {
    DOM.songTitle.textContent = title;
    DOM.songArtist.textContent = artist;
}

// ========================================
// NAVEGACIÓN MÓVIL
// ========================================

function toggleMobileMenu() {
    DOM.mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    DOM.mobileMenu.classList.remove('active');
}

// ========================================
// NAVEGACIÓN SUAVE
// ========================================

document.addEventListener('click', debounce(e => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
        
        closeMobileMenu();
    }
}, 200));

// ========================================
// EVENTOS GLOBALES
// ========================================

document.addEventListener('keydown', debounce(e => {
    if (e.key === 'Escape') {
        closeModal();
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.remove();
            }
        });
    }
}, 200));

document.addEventListener('keydown', debounce(e => {
    if (DOM.galleryModal.style.display === 'block') {
        if (e.key === 'ArrowLeft') {
            prevModalImage();
        } else if (e.key === 'ArrowRight') {
            nextModalImage();
        }
    }
}, 200));

window.addEventListener('beforeunload', () => {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
});

console.log('🎉 Urban Radio cargado completamente');
