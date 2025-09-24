document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    window.closeMobileMenu = () => {
        mobileMenu.classList.add('hidden');
    };

    // Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            indicators[i].classList.toggle('active', i === index);
            indicators[i].classList.toggle('bg-white/50', i !== index);
            indicators[i].classList.toggle('bg-electric-blue', i === index);
        });
    };

    window.nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    window.prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    };

    window.goToSlide = (index) => {
        currentSlide = index;
        showSlide(currentSlide);
    };

    // Auto-slide every 5 seconds
    setInterval(nextSlide, 5000);

    // Modal Functionality
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDescription = document.getElementById('modalDescription');

    window.openModal = (imageSrc, title, subtitle, description) => {
        modalImage.src = imageSrc;
        modalTitle.textContent = title;
        modalSubtitle.textContent = subtitle;
        modalDescription.textContent = description;
        modal.classList.add('active');
    };

    window.closeModal = () => {
        modal.classList.remove('active');
        // Reset modal content to prevent flicker
        setTimeout(() => {
            modalImage.src = '';
            modalTitle.textContent = '';
            modalSubtitle.textContent = '';
            modalDescription.textContent = '';
        }, 300);
    };

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});