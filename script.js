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

// ========================================
// FUNCIONES DE DEBUG
// ========================================

function updateDebugInfo(status, data = null) {
    const debugStatus = document.getElementById('debugStatus');
    const debugData = document.getElementById('debugData');
    
    if (debugStatus) debugStatus.textContent = status;
    if (debugData && data) {
        debugData.innerHTML = Object.keys(data).map(key => 
            `${key}: ${data[key]?.length || 0} elementos`
        ).join('<br>');
    }
}

function toggleDebug() {
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
}

// Mostrar debug con Ctrl+D
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDebug();
    }
});

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

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
            console.log(`📋 Datos de ${key}:`, data);
        } catch (error) {
            console.warn(`⚠️ Error cargando ${key}:`, error);
            sheetsData[key] = [];
        }
    });
    
    await Promise.all(promises);
    console.log('📊 Todos los datos cargados:', sheetsData);
}

async function fetchSheetData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📄 CSV recibido:', csvText.substring(0, 200) + '...');
    return parseCSV(csvText);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const row = line.split(',').map(cell => 
                cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
            );
            result.push(row);
        }
    }
    
    console.log('📋 CSV parseado:', result);
    return result;
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
    
    // Slider por defecto
    document.getElementById('slidesWrapper').innerHTML = `
        <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(118, 75, 162, 0) 100%);">
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <h2 class="slide-title">Bienvenido a Urban Radio</h2>
                <p class="slide-description">La mejor música urbana las 24 horas del día</p>
            </div>
        </div>
    `;
    
    // DJs por defecto
    document.getElementById('djsContainer').innerHTML = `
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
    
    // Top 5 por defecto
    document.getElementById('top5Container').innerHTML = `
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
    
    // Galería por defecto
    document.getElementById('galleryContainer').innerHTML = `
        <div class="gallery-item">
            <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>Evento Urban Radio</h3>
                </div>
            </div>
        </div>
    `;
    
    // Videos por defecto
    document.getElementById('videosContainer').innerHTML = `
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
    const slidesContainer = document.getElementById('slidesWrapper');
    const navContainer = document.getElementById('sliderNav');
    
    console.log('🖼️ Renderizando slider:', slides.length, 'slides');
    console.log('📊 Datos del slider:', slides);
    
    if (slides.length <= 1) {
        slidesContainer.innerHTML = `
            <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2 class="slide-title">Urban Radio</h2>
                    <p class="slide-description">La mejor música urbana 24/7</p>
                </div>
            </div>
        `;
        navContainer.innerHTML = '<div class="slider-dot active"></div>';
        return;
    }

    const activeSlides = slides.slice(1).filter(slide => 
        slide.length >= 5 && slide[4] && slide[4].toLowerCase() === 'activo'
    );

    console.log('✅ Slides activos:', activeSlides);

    if (activeSlides.length === 0) {
        slidesContainer.innerHTML = `
            <div class="hero-slide active" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2 class="slide-title">Urban Radio</h2>
                    <p class="slide-description">La mejor música urbana 24/7</p>
                </div>
            </div>
        `;
        navContainer.innerHTML = '<div class="slider-dot active"></div>';
        return;
    }

    const slidesHTML = activeSlides.map((slide, index) => {
        const [titulo, descripcion, imagen, enlace, estado] = slide;
        console.log(`🖼️ Slide ${index + 1}:`, { titulo, descripcion, imagen, enlace, estado });
        
        const backgroundStyle = imagen && imagen.trim() !== '' 
            ? `background-image: url('${imagen.trim()}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);`;
        
        return `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="${backgroundStyle}">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2 class="slide-title">${titulo || 'Título del Slide'}</h2>
                    <p class="slide-description">${descripcion || 'Descripción del slide'}</p>
                    ${enlace && enlace.trim() !== '' ? `<a href="${enlace.trim()}" class="slide-btn" target="_blank" rel="noopener noreferrer">Ver Más</a>` : ''}
                </div>
            </div>
        `;
    }).join('');

    const dotsHTML = activeSlides.map((_, index) => 
        `<div class="slider-dot ${index === 0 ? 'active' : ''}" onclick="currentSlide(${index + 1})"></div>`
    ).join('');

    slidesContainer.innerHTML = slidesHTML;
    navContainer.innerHTML = dotsHTML;

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
    
    if (slides[currentSlideIndex - 1]) {
        slides[currentSlideIndex - 1].classList.add('active');
    }
    if (dots[currentSlideIndex - 1]) {
        dots[currentSlideIndex - 1].classList.add('active');
    }
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
    const container = document.getElementById('djsContainer');
    
    console.log('🎧 Renderizando DJs:', djs.length, 'DJs');
    
    if (djs.length <= 1) {
        container.innerHTML = `
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
        dj.length >= 6 && dj[5] && dj[5].toLowerCase() === 'activo'
    );

    if (activeDJs.length === 0) {
        container.innerHTML = `
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

    const djsHTML = activeDJs.map(dj => {
        const [nombre, especialidad, horario, imagen, youtube, estado] = dj;
        
        return `
            <div class="dj-card">
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
            </div>
        `;
    }).join('');

    container.innerHTML = djsHTML;
}

// ========================================
// TOP 5 VIDEOS
// ========================================

function renderTop5() {
    const top5 = sheetsData.top5 || [];
    const container = document.getElementById('top5Container');
    
    console.log('🏆 Renderizando Top 5:', top5.length, 'videos');
    
    if (top5.length <= 1) {
        container.innerHTML = `
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
        video.length >= 5 && video[4] && video[4].toLowerCase() === 'activo'
    );

    if (activeTop5.length === 0) {
        container.innerHTML = `
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

    const top5HTML = activeTop5.map((video, index) => {
        const [artista, cancion, youtubeId, posicion, estado] = video;
        const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId || 'dQw4w9WgXcQ'}/mqdefault.jpg`;
        
        return `
            <div class="top5-item">
                <div class="top5-number">${posicion || (index + 1)}</div>
                <div class="top5-thumbnail" style="background-image: url('${thumbnailUrl}')" onclick="playTop5Video('${youtubeId || 'dQw4w9WgXcQ'}', '${(cancion || 'Canción').replace(/'/g, "\\'")}', '${(artista || 'Artista').replace(/'/g, "\\'")}')"></div>
                <div class="top5-info">
                    <div class="top5-title">${cancion || 'Canción Sin Título'}</div>
                    <div class="top5-artist">${artista || 'Artista Desconocido'}</div>
                </div>
                <button class="top5-play-btn" onclick="playTop5Video('${youtubeId || 'dQw4w9WgXcQ'}', '${(cancion || 'Canción').replace(/'/g, "\\'")}', '${(artista || 'Artista').replace(/'/g, "\\'")}')">
                    ▶
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = top5HTML;
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
    const container = document.getElementById('galleryContainer');
    
    console.log('🖼️ Renderizando galería:', gallery.length, 'imágenes');
    console.log('📊 Datos de galería:', gallery);
    
    if (gallery.length <= 1) {
        container.innerHTML = `
            <div class="gallery-item">
                <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>Evento Urban Radio</h3>
                    </div>
                </div>
            </div>
        `;
        modalImages = [{
            titulo: 'Evento Urban Radio',
            descripcion: 'Contenido de ejemplo',
            imagen: ''
        }];
        return;
    }

    const activeImages = gallery.slice(1).filter(item => 
        item.length >= 4 && item[3] && item[3].toLowerCase() === 'activo'
    );

    console.log('✅ Imágenes activas:', activeImages);

    if (activeImages.length === 0) {
        container.innerHTML = `
            <div class="gallery-item">
                <div class="gallery-image" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);"></div>
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>Evento Urban Radio</h3>
                    </div>
                </div>
            </div>
        `;
        modalImages = [{
            titulo: 'Evento Urban Radio',
            descripcion: 'Contenido de ejemplo',
            imagen: ''
        }];
        return;
    }

    modalImages = activeImages.map(item => ({
        titulo: item[0] || 'Sin título',
        descripcion: item[1] || 'Sin descripción',
        imagen: item[2] || ''
    }));

    const galleryHTML = activeImages.map((item, index) => {
        const [titulo, descripcion, imagen, estado] = item;
        console.log(`🖼️ Imagen ${index + 1}:`, { titulo, descripcion, imagen, estado });
        
        const backgroundStyle = imagen && imagen.trim() !== '' 
            ? `background-image: url('${imagen.trim()}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);`;
        
        return `
            <div class="gallery-item" onclick="openModal(${index})">
                <div class="gallery-image" style="${backgroundStyle}"></div>
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h3>${titulo || 'Sin título'}</h3>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = galleryHTML;
}

function openModal(index) {
    if (modalImages.length === 0) return;
    
    currentModalIndex = index;
    const modal = document.getElementById('galleryModal');
    
    showModalImage();
    updateModalNavButtons();
    modal.style.display = 'block';
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

function showModalImage() {
    if (modalImages.length === 0 || currentModalIndex < 0 || currentModalIndex >= modalImages.length) return;
    
    const currentImage = modalImages[currentModalIndex];
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    modalImage.src = currentImage.imagen;
    modalTitle.textContent = currentImage.titulo;
    modalDescription.textContent = currentImage.descripcion;
}

function updateModalNavButtons() {
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    
    if (modalImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }
    
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    
    prevBtn.disabled = currentModalIndex === 0;
    nextBtn.disabled = currentModalIndex === modalImages.length - 1;
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
    document.getElementById('galleryModal').style.display = 'none';
}

// ========================================
// VIDEOS
// ========================================

function renderVideos() {
    const videos = sheetsData.videos || [];
    const container = document.getElementById('videosContainer');
    
    console.log('📹 Renderizando videos:', videos.length, 'videos');
    
    if (videos.length <= 1) {
        container.innerHTML = `
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
        video.length >= 4 && video[3] && video[3].toLowerCase() === 'activo'
    );

    if (activeVideos.length === 0) {
        container.innerHTML = `
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

    const videosHTML = activeVideos.map(video => {
        const [titulo, youtubeId, descripcion, estado] = video;
        
        return `
            <div class="video-container">
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
            </div>
        `;
    }).join('');

    container.innerHTML = videosHTML;
}

// ========================================
// REPRODUCTOR DE RADIO
// ========================================

function initRadioPlayer() {
    radioAudio = document.getElementById('radioStream');
    
    if (radioAudio) {
        radioAudio.volume = currentVolume / 100;
        
        radioAudio.addEventListener('loadstart', function() {
            console.log('🎵 Iniciando carga del stream...');
        });
        
        radioAudio.addEventListener('canplay', function() {
            console.log('🎵 Stream listo para reproducir');
        });
        
        radioAudio.addEventListener('error', function(e) {
            console.error('❌ Error en el stream de radio:', e);
            updateSongInfo('Error de conexión', 'Reintentando...');
        });
        
        radioAudio.addEventListener('play', function() {
            console.log('▶️ Reproducción iniciada');
            isPlaying = true;
            updatePlayButton();
        });
        
        radioAudio.addEventListener('pause', function() {
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
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
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
    document.getElementById('songTitle').textContent = title;
    document.getElementById('songArtist').textContent = artist;
}

// ========================================
// NAVEGACIÓN MÓVIL
// ========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('active');
}

// ========================================
// NAVEGACIÓN SUAVE
// ========================================

document.addEventListener('click', function(e) {
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
});

// ========================================
// EVENTOS GLOBALES
// ========================================

// Cerrar modal con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        // Cerrar cualquier modal de video
        const videoModals = document.querySelectorAll('.modal');
        videoModals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.remove();
            }
        });
    }
});

// Navegación del modal con flechas
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('galleryModal');
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowLeft') {
            prevModalImage();
        } else if (e.key === 'ArrowRight') {
            nextModalImage();
        }
    }
});

// Limpiar intervalos al cerrar la página
window.addEventListener('beforeunload', function() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
});


console.log('🎉 Urban Radio cargado completamente');
