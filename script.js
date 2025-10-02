// =============================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// =============================================

const GOOGLE_SHEET_ID = '18cZo3pvrIRegxJK4Xnddgu1cjDbc-k55-gewkONA4S0'; // Reemplaza con tu ID real
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?`;

// =============================================
// SISTEMA DE CARGA DE DATOS DESDE GOOGLE SHEETS - CORREGIDO
// =============================================

class GoogleSheetsCMS {
    constructor() {
        this.data = {
            slider: [],
            djs: [],
            gallery: [],
            top5: [],
            videos: [],
            social: []
        };
        this.loadingScreen = document.getElementById('loadingScreen');
    }

    // Función para obtener datos de una hoja específica - MEJORADA
    async fetchSheetData(sheetName) {
        try {
            const query = encodeURIComponent(`SELECT *`);
            const url = `${GOOGLE_SHEET_URL}&sheet=${sheetName}&tq=${query}`;
            
            console.log(`📥 Cargando hoja: ${sheetName}`, url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const text = await response.text();
            console.log(`📄 Respuesta cruda de ${sheetName}:`, text.substring(0, 200));
            
            const json = JSON.parse(text.substring(47).slice(0, -2));
            console.log(`📊 JSON parseado de ${sheetName}:`, json);
            
            return this.parseSheetData(json, sheetName);
        } catch (error) {
            console.error(`❌ Error cargando ${sheetName}:`, error);
            return [];
        }
    }

    // Parsear datos de Google Sheets - COMPLETAMENTE REESCRITO
    parseSheetData(json, sheetName) {
        if (!json.table || !json.table.rows || json.table.rows.length === 0) {
            console.log(`📭 Hoja ${sheetName} vacía o sin datos`);
            return [];
        }
        
        const rows = json.table.rows;
        console.log(`📋 Filas en ${sheetName}:`, rows.length);
        
        // Obtener headers
        const headers = rows[0].c.map((cell, index) => {
            if (cell && cell.v) {
                return cell.v.toString().toLowerCase().trim();
            }
            return `columna${index}`;
        });
        
        console.log(`🏷️ Headers en ${sheetName}:`, headers);
        
        // Procesar filas (empezando desde la fila 1, ya que la 0 son headers)
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row.c) continue;
            
            const item = {};
            let hasData = false;
            
            row.c.forEach((cell, cellIndex) => {
                const header = headers[cellIndex];
                if (cell && cell.v !== null && cell.v !== undefined) {
                    item[header] = cell.v.toString().trim();
                    hasData = true;
                }
            });
            
            if (hasData && Object.keys(item).length > 0) {
                console.log(`📝 Fila ${i} en ${sheetName}:`, item);
                data.push(item);
            }
        }
        
        console.log(`✅ Datos procesados de ${sheetName}:`, data);
        return data;
    }

    // Cargar todos los datos
    async loadAllData() {
        this.showLoading(true);
        
        try {
            const sheets = ['slider', 'djs', 'gallery', 'top5', 'videos', 'social'];
            const promises = sheets.map(sheet => this.fetchSheetData(sheet));
            
            const results = await Promise.allSettled(promises);
            
            results.forEach((result, index) => {
                const sheetName = sheets[index];
                if (result.status === 'fulfilled') {
                    this.data[sheetName] = result.value;
                    console.log(`✅ ${sheetName} cargado:`, result.value.length, 'elementos');
                    console.log(`📸 Primer elemento de ${sheetName}:`, result.value[0]);
                } else {
                    console.error(`❌ Error cargando ${sheetName}:`, result.reason);
                }
            });
            
            this.renderAllSections();
            this.showLoading(false);
            
        } catch (error) {
            console.error('💥 Error cargando datos:', error);
            this.showLoading(false);
            this.showError('Error cargando el contenido. Por favor, recarga la página.');
        }
    }

    // Mostrar/ocultar pantalla de carga
    showLoading(show) {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = show ? '1' : '0';
            setTimeout(() => {
                this.loadingScreen.style.display = show ? 'flex' : 'none';
            }, show ? 0 : 500);
        }
    }

    // Mostrar mensaje de error
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Renderizar todas las secciones
    renderAllSections() {
        this.renderSlider();
        this.renderDJs();
        this.renderGallery();
        this.renderTop5();
        this.renderVideos();
        this.renderSocial();
    }

    // =============================================
    // RENDERIZADO DE SECCIONES - COMPLETAMENTE CORREGIDO
    // =============================================

    renderSlider() {
        const slider = document.getElementById('imageSlider');
        const indicators = document.getElementById('sliderIndicators');
        
        console.log('🎠 RENDERIZANDO SLIDER - Datos:', this.data.slider);
        
        if (!this.data.slider || this.data.slider.length === 0) {
            console.log('🚨 No hay datos del slider, usando contenido por defecto');
            slider.innerHTML = this.getDefaultSliderHTML();
            indicators.innerHTML = this.getDefaultIndicatorsHTML();
            return;
        }

        slider.innerHTML = '';
        indicators.innerHTML = '';

        this.data.slider.forEach((slide, index) => {
            if (!slide) return;
            
            // EXTRAER DATOS CON DIFERENTES NOMBRES POSIBLES DE COLUMNAS
            const title = slide.titulo || slide.title || slide.header || 'RadioWave FM';
            const description = slide.descripcion || slide.description || slide.text || 'La mejor música las 24 horas del día';
            let imageUrl = slide.imagen || slide.image || slide.url || slide.background || '';
            
            // LIMPIAR Y VALIDAR URL DE IMAGEN
            if (imageUrl) {
                imageUrl = imageUrl.trim();
                // Asegurarse de que la URL sea válida
                if (!imageUrl.startsWith('http')) {
                    console.warn(`⚠️ URL de imagen inválida en slide ${index}:`, imageUrl);
                    imageUrl = this.getDefaultSliderImage(index);
                }
            } else {
                imageUrl = this.getDefaultSliderImage(index);
            }
            
            console.log(`🖼️ Slide ${index}:`, { title, description, imageUrl });
            
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.style.backgroundImage = `url('${imageUrl}')`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundPosition = 'center';
            slideDiv.style.backgroundRepeat = 'no-repeat';
            
            slideDiv.innerHTML = `
                <div class="slide-content">
                    <h2>${title}</h2>
                    <p>${description}</p>
                </div>
            `;
            
            slider.appendChild(slideDiv);

            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => goToSlide(index);
            indicators.appendChild(indicator);
        });

        // Reiniciar el slider
        currentSlide = 0;
        updateSlider();
        
        console.log(`✅ Slider renderizado con ${this.data.slider.length} slides`);
    }

    // Contenido por defecto para el slider
    getDefaultSliderHTML() {
        return `
            <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');">
                <div class="slide-content">
                    <h2>RadioWave FM</h2>
                    <p>La mejor música las 24 horas del día</p>
                </div>
            </div>
            <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');">
                <div class="slide-content">
                    <h2>Shows en Vivo</h2>
                    <p>DJs profesionales con los mejores sets</p>
                </div>
            </div>
            <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');">
                <div class="slide-content">
                    <h2>Música Sin Límites</h2>
                    <p>Todos los géneros, todas las emociones</p>
                </div>
            </div>
        `;
    }

    getDefaultIndicatorsHTML() {
        return `
            <div class="indicator active" onclick="goToSlide(0)"></div>
            <div class="indicator" onclick="goToSlide(1)"></div>
            <div class="indicator" onclick="goToSlide(2)"></div>
        `;
    }

    getDefaultSliderImage(index) {
        const defaultImages = [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        ];
        return defaultImages[index] || defaultImages[0];
    }

    // Otras funciones render (se mantienen igual pero con mejor logging)
    renderDJs() {
        const djGrid = document.getElementById('djGrid');
        console.log('🎧 RENDERIZANDO DJs - Datos:', this.data.djs);
        
        if (!this.data.djs || this.data.djs.length === 0) {
            djGrid.innerHTML = this.getDefaultDJsHTML();
            return;
        }

        djGrid.innerHTML = this.data.djs.map(dj => `
            <div class="dj-card">
                <div class="dj-avatar">
                    <img src="${dj.imagen || dj.image || dj.avatar || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" 
                         alt="${dj.nombre || dj.name || 'DJ'}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                </div>
                <div class="dj-content">
                    <div>
                        <h3 class="dj-name">${dj.nombre || dj.name || 'DJ'}</h3>
                        <p class="dj-specialty">${dj.especialidad || dj.specialty || dj.genre || 'Música'}</p>
                        <div class="dj-schedule">${dj.horario || dj.schedule || dj.time || 'Horario no especificado'}</div>
                    </div>
                    <p class="dj-description">${dj.descripcion || dj.description || 'Descripción del DJ'}</p>
                </div>
            </div>
        `).join('');
    }

    getDefaultDJsHTML() {
        return `
            <div class="dj-card">
                <div class="dj-avatar">
                    <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="DJ Alex">
                </div>
                <div class="dj-content">
                    <div>
                        <h3 class="dj-name">DJ Alex Rivera</h3>
                        <p class="dj-specialty">Electronic & House</p>
                        <div class="dj-schedule">Lunes a Viernes: 6:00 - 10:00 AM</div>
                    </div>
                    <p class="dj-description">Especialista en música electrónica con más de 8 años de experiencia.</p>
                </div>
            </div>
        `;
    }

    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        console.log('🖼️ RENDERIZANDO GALERÍA - Datos:', this.data.gallery);
        
        if (!this.data.gallery || this.data.gallery.length === 0) {
            galleryGrid.innerHTML = this.getDefaultGalleryHTML();
            return;
        }

        galleryGrid.innerHTML = this.data.gallery.map((item, index) => `
            <div class="gallery-item" onclick="openModal(${index})">
                <img src="${item.imagen || item.image || item.url || 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" 
                     alt="${item.titulo || item.title || 'Imagen'}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                <div class="gallery-overlay">
                    <h4>${item.titulo || item.title || 'Título'}</h4>
                </div>
            </div>
        `).join('');
    }

    getDefaultGalleryHTML() {
        return `
            <div class="gallery-item" onclick="openModal(0)">
                <img src="https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Festival Electrónico" loading="lazy">
                <div class="gallery-overlay">
                    <h4>Festival Electrónico 2024</h4>
                </div>
            </div>
        `;
    }

    renderTop5() {
        const top5Container = document.getElementById('top5Container');
        console.log('🎵 RENDERIZANDO TOP 5 - Datos:', this.data.top5);
        
        if (!this.data.top5 || this.data.top5.length === 0) {
            top5Container.innerHTML = this.getDefaultTop5HTML();
            return;
        }

        top5Container.innerHTML = this.data.top5.map((song, index) => `
            <div class="top5-item" data-video="${song.video_id || song.videoid || ''}">
                <div class="rank-number">${index + 1}</div>
                <div class="song-cover">
                    <img src="${song.imagen || song.image || song.cover || `https://img.youtube.com/vi/${song.video_id || song.videoid || ''}/maxresdefault.jpg`}" 
                         alt="${song.titulo || song.title || 'Canción'}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
                </div>
                <div class="song-info">
                    <h4 class="song-name">${song.titulo || song.title || 'Canción'}</h4>
                    <p class="artist-name">${song.artista || song.artist || 'Artista'}</p>
                </div>
                <button class="play-video-btn" onclick="openVideoModal('${song.video_id || song.videoid || ''}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getDefaultTop5HTML() {
        return `
            <div class="top5-item" data-video="dQw4w9WgXcQ">
                <div class="rank-number">1</div>
                <div class="song-cover">
                    <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" alt="Never Gonna Give You Up" loading="lazy">
                </div>
                <div class="song-info">
                    <h4 class="song-name">Never Gonna Give You Up</h4>
                    <p class="artist-name">Rick Astley</p>
                </div>
                <button class="play-video-btn" onclick="openVideoModal('dQw4w9WgXcQ')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    renderVideos() {
        const videosGrid = document.getElementById('videosGrid');
        console.log('🎬 RENDERIZANDO VIDEOS - Datos:', this.data.videos);
        
        if (!this.data.videos || this.data.videos.length === 0) {
            videosGrid.innerHTML = this.getDefaultVideosHTML();
            return;
        }

        videosGrid.innerHTML = this.data.videos.map(video => `
            <div class="video-item">
                <iframe class="video-embed" src="https://www.youtube.com/embed/${video.video_id || video.videoid || 'dQw4w9WgXcQ'}" allowfullscreen></iframe>
                <div class="video-info">
                    <h4>${video.titulo || video.title || 'Video'}</h4>
                    <p>${video.descripcion || video.description || 'Descripción del video'}</p>
                </div>
            </div>
        `).join('');
    }

    getDefaultVideosHTML() {
        return `
            <div class="video-item">
                <iframe class="video-embed" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
                <div class="video-info">
                    <h4>Rick Astley - Never Gonna Give You Up</h4>
                    <p>El clásico que nunca pasa de moda.</p>
                </div>
            </div>
        `;
    }

    renderSocial() {
        const socialLinks = document.getElementById('socialLinks');
        console.log('📱 RENDERIZANDO SOCIAL - Datos:', this.data.social);
        
        if (!this.data.social || this.data.social.length === 0) {
            socialLinks.innerHTML = this.getDefaultSocialHTML();
            return;
        }

        socialLinks.innerHTML = this.data.social.map(social => {
            const platform = (social.plataforma || social.platform || social.red || 'facebook').toLowerCase();
            const url = social.url || social.link || '#';
            
            const icons = {
                facebook: `<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>`,
                instagram: `<path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.65-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>`,
                youtube: `<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>`,
                tiktok: `<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>`
            };

            return `
                <a href="${url}" target="_blank" class="social-link ${platform}">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        ${icons[platform] || icons.facebook}
                    </svg>
                </a>
            `;
        }).join('');
    }

    getDefaultSocialHTML() {
        return `
            <a href="https://facebook.com" target="_blank" class="social-link facebook">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            </a>
        `;
    }
}

// =============================================
// INICIALIZACIÓN DEL CMS
// =============================================

const cms = new GoogleSheetsCMS();

// =============================================
// VARIABLES GLOBALES
// =============================================

let currentModalIndex = 0;
let currentZoom = 1;
let galleryImages = [];
let currentSlide = 0;

// Radio Player Variables
let isPlaying = false;
let radioAudio = null;
let autoplayEnabled = true;

// =============================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando RadioWave FM...');
    
    // Iniciar carga de datos desde Google Sheets
    cms.loadAllData();
    
    // Configuración inicial
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Inicializar funcionalidades
    initRadioPlayer();
    initNavigation();
    initMobileMenu();
});

// =============================================
// HERRAMIENTAS DE DEBUG MEJORADAS
// =============================================

function debugSlides() {
    console.log('=== 🎠 DEBUG COMPLETO DEL SLIDER ===');
    console.log('📊 Datos cargados:', cms.data.slider);
    console.log('🔢 Número de slides:', document.querySelectorAll('.slide').length);
    console.log('📍 Slide actual:', currentSlide);
    
    // Mostrar información de cada slide
    document.querySelectorAll('.slide').forEach((slide, index) => {
        const style = window.getComputedStyle(slide);
        console.log(`📸 Slide ${index}:`, {
            backgroundImage: style.backgroundImage,
            titulo: slide.querySelector('h2')?.textContent,
            descripcion: slide.querySelector('p')?.textContent,
            elemento: slide
        });
    });
}

function reloadData() {
    console.log('🔄 Recargando datos desde Google Sheets...');
    cms.loadAllData();
}

function testWithSampleData() {
    console.log('🧪 Probando con datos de ejemplo...');
    cms.data.slider = [
        {
            titulo: 'PRUEBA 1 - Festival',
            descripcion: 'Esta es una imagen de prueba 1',
            imagen: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        {
            titulo: 'PRUEBA 2 - Concierto', 
            descripcion: 'Esta es una imagen de prueba 2',
            imagen: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        {
            titulo: 'PRUEBA 3 - DJ',
            descripcion: 'Esta es una imagen de prueba 3', 
            imagen: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }
    ];
    cms.renderSlider();
    console.log('✅ Datos de prueba aplicados');
}

function checkGoogleSheets() {
    console.log('🔍 Verificando conexión con Google Sheets...');
    console.log('📋 ID de la hoja:', GOOGLE_SHEET_ID);
    console.log('🔗 URL completa:', `${GOOGLE_SHEET_URL}&sheet=slider&tq=SELECT%20*`);
}

// Hacer las funciones disponibles globalmente para debugging
window.debugSlides = debugSlides;
window.reloadData = reloadData;
window.testWithSampleData = testWithSampleData;
window.checkGoogleSheets = checkGoogleSheets;

// =============================================
// SISTEMA DE SLIDER
// =============================================

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    
    currentSlide += direction;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    updateSlider();
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.slide');
    if (slideIndex >= 0 && slideIndex < slides.length) {
        currentSlide = slideIndex;
        updateSlider();
    }
}

function updateSlider() {
    const slider = document.getElementById('imageSlider');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slider) {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Auto-slide
setInterval(() => changeSlide(1), 6000);

// =============================================
// SISTEMA DE MODAL DE GALERÍA
// =============================================

// Actualizar galleryImages cuando se carguen los datos
const originalLoadAllData = cms.loadAllData.bind(cms);
cms.loadAllData = async function() {
    await originalLoadAllData();
    galleryImages = this.data.gallery;
};

function openModal(index) {
    if (!galleryImages.length) return;
    
    currentModalIndex = index;
    currentZoom = 1;
    updateModalContent();
    const modal = document.getElementById('imageModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyDown);
    currentZoom = 1;
    const modalImage = document.getElementById('modalImage');
    modalImage.style.transform = 'scale(1)';
}

function changeModalImage(direction) {
    if (!galleryImages.length) return;
    
    currentModalIndex += direction;
    if (currentModalIndex >= galleryImages.length) currentModalIndex = 0;
    if (currentModalIndex < 0) currentModalIndex = galleryImages.length - 1;
    currentZoom = 1;
    updateModalContent();
}

function updateModalContent() {
    if (!galleryImages.length) return;
    
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCounter = document.getElementById('modalCounter');
    
    const currentImage = galleryImages[currentModalIndex];
    
    modalImage.src = currentImage.imagen || '';
    modalImage.style.transform = `scale(${currentZoom})`;
    modalTitle.textContent = currentImage.titulo || '';
    modalSubtitle.textContent = currentImage.subtitulo || '';
    modalDescription.textContent = currentImage.descripcion || '';
    modalCounter.textContent = `${currentModalIndex + 1} / ${galleryImages.length}`;
}

function zoomIn() {
    if (currentZoom < 3) {
        currentZoom += 0.25;
        const modalImage = document.getElementById('modalImage');
        modalImage.style.transform = `scale(${currentZoom})`;
    }
}

function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.25;
        const modalImage = document.getElementById('modalImage');
        modalImage.style.transform = `scale(${currentZoom})`;
    }
}

function handleKeyDown(e) {
    switch(e.key) {
        case 'Escape': closeModal(); break;
        case 'ArrowLeft': changeModalImage(-1); break;
        case 'ArrowRight': changeModalImage(1); break;
        case '+': case '=': zoomIn(); break;
        case '-': zoomOut(); break;
    }
}

// =============================================
// SISTEMA DE MODAL DE VIDEOS
// =============================================

function openVideoModal(videoId) {
    if (!videoId) return;
    
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    modalVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.style.display = 'block';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    modal.style.display = 'none';
    modalVideo.src = '';
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    const imageModal = document.getElementById('imageModal');
    const videoModal = document.getElementById('videoModal');
    
    if (event.target === imageModal) closeModal();
    if (event.target === videoModal) closeVideoModal();
});

// =============================================
// SISTEMA DE RADIO PLAYER (se mantiene igual)
// =============================================

function initRadioPlayer() {
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumePercentage = document.getElementById('volumePercentage');
    const volumeUpBtn = document.getElementById('volumeUpBtn');
    const volumeDownBtn = document.getElementById('volumeDownBtn');
    const songTitle = document.getElementById('songTitle');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');

    // Inicializar volumen
    updateVolumeDisplay(70);

    // Play/Pause functionality
    playBtn.addEventListener('click', function() {
        if (!isPlaying) {
            isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            playBtn.style.animation = 'pulse 2s infinite';
            
            initializeRadio();
            radioAudio.play().catch(error => {
                console.error('Error playing radio stream:', error);
            });
            
            updateLiveInfo();
            
        } else {
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playBtn.style.animation = 'none';
            
            if (radioAudio) {
                radioAudio.pause();
                radioAudio = null;
            }
            
            progressBar.style.width = '0%';
            currentTimeDisplay.textContent = '--:--';
            totalTimeDisplay.textContent = 'PAUSADO';
            songTitle.textContent = 'RadioWave FM - Desconectado';
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', function() {
        const volume = parseInt(this.value);
        if (radioAudio) {
            radioAudio.volume = volume / 100;
        }
        updateVolumeDisplay(volume);
    });

    volumeUpBtn.addEventListener('click', function() {
        const currentVolume = parseInt(volumeSlider.value);
        const newVolume = Math.min(100, currentVolume + 10);
        volumeSlider.value = newVolume;
        if (radioAudio) {
            radioAudio.volume = newVolume / 100;
        }
        updateVolumeDisplay(newVolume);
    });

    volumeDownBtn.addEventListener('click', function() {
        const currentVolume = parseInt(volumeSlider.value);
        const newVolume = Math.max(0, currentVolume - 10);
        volumeSlider.value = newVolume;
        if (radioAudio) {
            radioAudio.volume = newVolume / 100;
        }
        updateVolumeDisplay(newVolume);
    });

    function updateVolumeDisplay(volume) {
        volumePercentage.textContent = volume + '%';
        volumeSlider.style.setProperty('--volume-width', volume + '%');
        
        if (volume === 0) {
            volumePercentage.style.color = '#ff4444';
            volumePercentage.style.borderColor = 'rgba(255, 68, 68, 0.3)';
            volumePercentage.style.background = 'rgba(255, 68, 68, 0.1)';
        } else if (volume < 30) {
            volumePercentage.style.color = '#ffaa00';
            volumePercentage.style.borderColor = 'rgba(255, 170, 0, 0.3)';
            volumePercentage.style.background = 'rgba(255, 170, 0, 0.1)';
        } else {
            volumePercentage.style.color = '#00ffff';
            volumePercentage.style.borderColor = 'rgba(0, 255, 255, 0.2)';
            volumePercentage.style.background = 'rgba(0, 255, 255, 0.1)';
        }
    }

    function initializeRadio() {
        if (radioAudio) {
            radioAudio.pause();
            radioAudio = null;
        }
        
        radioAudio = new Audio();
        radioAudio.src = 'https://stream.zeno.fm/cxf1r8zukyhuv';
        radioAudio.loop = false;
        radioAudio.volume = volumeSlider.value / 100;
        
        radioAudio.addEventListener('loadstart', () => {
            songTitle.textContent = 'RadioWave FM - Conectando...';
        });
        
        radioAudio.addEventListener('canplay', () => {
            if (songTitle.textContent === 'RadioWave FM - Conectando...') {
                songTitle.textContent = 'RadioWave FM - En Vivo';
            }
        });
        
        radioAudio.addEventListener('error', (e) => {
            console.log('Radio: Stream error, retrying...', e);
            songTitle.textContent = 'RadioWave FM - Reconectando...';
            setTimeout(() => {
                if (isPlaying) {
                    initializeRadio();
                    radioAudio.play().catch(console.error);
                }
            }, 2000);
        });
    }

    function formatLiveTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function updateLiveInfo() {
        if (isPlaying) {
            currentTimeDisplay.textContent = formatLiveTime();
            totalTimeDisplay.textContent = 'EN VIVO';
            
            const randomProgress = 20 + Math.random() * 60;
            progressBar.style.width = randomProgress + '%';
        }
    }

    // Update time display every minute
    setInterval(() => {
        if (!isPlaying) {
            currentTimeDisplay.textContent = formatLiveTime();
        }
    }, 60000);

    // Initialize display
    currentTimeDisplay.textContent = formatLiveTime();
    totalTimeDisplay.textContent = 'EN VIVO';
    progressBar.style.width = '0%';
}

// =============================================
// SISTEMA DE NAVEGACIÓN (se mantiene igual)
// =============================================

function initNavigation() {
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const headerHeight = header.offsetHeight;
        
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0, 255, 255, 0.3)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
        }
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        if (window.scrollY < sections[0].offsetTop - headerHeight - 50) {
            current = 'inicio';
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// =============================================
// MENÚ MÓVIL (se mantiene igual)
// =============================================

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = navMenu.classList.contains('mobile-active');
            
            if (isActive) {
                navMenu.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                navMenu.classList.add('mobile-active');
                mobileMenuBtn.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                navMenu.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        setTimeout(() => {
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                if (navMenu.classList.contains('mobile-active')) {
                    navMenu.classList.remove('mobile-active');
                    mobileMenuBtn.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
}

// =============================================
// ANIMACIONES ADICIONALES
// =============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// =============================================
// PRUEBA AUTOMÁTICA - DESCOMENTAR SI ES NECESARIO
// =============================================

/*
// Prueba automática después de 5 segundos
setTimeout(() => {
    console.log('🕐 Verificando estado del slider...');
    if (cms.data.slider.length === 0) {
        console.log('⚠️ No se cargaron datos del slider, usando datos de prueba');
        testWithSampleData();
    } else {
        console.log('✅ Datos del slider cargados correctamente');
        debugSlides();
    }
}, 5000);
*/