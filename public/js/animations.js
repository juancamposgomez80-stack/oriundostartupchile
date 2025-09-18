/**
 * Oriundo Startup Chile - Animation System
 * Sistema de animaciones y efectos visuales
 */

// ===== SISTEMA DE ANIMACIONES =====
const AnimationSystem = {
    // Configuración
    config: {
        observerOptions: {
            threshold: [0.1, 0.5, 0.9],
            rootMargin: '0px 0px -50px 0px'
        },
        animationClasses: {
            fadeInUp: 'animate-fade-in-up',
            fadeInLeft: 'animate-fade-in-left',
            fadeInRight: 'animate-fade-in-right',
            scaleIn: 'animate-scale-in',
            slideInLeft: 'animate-slide-in-left',
            slideInRight: 'animate-slide-in-right'
        }
    },

    // Observers
    observers: {
        scroll: null,
        intersection: null
    },

    // Estado
    state: {
        isReducedMotion: false,
        animatedElements: new Set(),
        parallaxElements: []
    },

    // Inicializar sistema
    init() {
        this.detectMotionPreference();
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupParallaxElements();
        this.setupMouseEffects();
        this.addAnimationStyles();
        
        console.log('Animation System inicializado');
    },

    // Detectar preferencia de movimiento
    detectMotionPreference() {
        this.state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Escuchar cambios en la preferencia
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.state.isReducedMotion = e.matches;
            this.updateAnimationsBasedOnPreference();
        });
    },

    // Configurar Intersection Observer
    setupIntersectionObserver() {
        if (this.state.isReducedMotion) return;

        this.observers.intersection = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, this.config.observerOptions);

        // Observar elementos para animar
        this.observeElements();
    },

    // Observar elementos
    observeElements() {
        const selectors = [
            '.service-card',
            '.tech-item',
            '.about-text',
            '.about-visual',
            '.contact-info',
            '.contact-form-container',
            '.hero-text',
            '.hero-visual',
            '.section-header',
            '.about-stats' // Observamos el contenedor de las estadísticas
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                // Agregar delay escalonado
                element.style.setProperty('--animation-delay', `${index * 0.1}s`);
                
                // Determinar tipo de animación basado en posición
                const animationType = this.determineAnimationType(element, selector);
                element.classList.add('animate-on-scroll', animationType);
                
                if (this.observers.intersection) {
                    this.observers.intersection.observe(element);
                }
            });
        });
    },

    // Determinar tipo de animación
    determineAnimationType(element, selector) {
        const rect = element.getBoundingClientRect();
        const centerX = window.innerWidth / 2;

        switch (selector) {
            case '.hero-text':
                return this.config.animationClasses.fadeInLeft;
            case '.hero-visual':
                return this.config.animationClasses.fadeInRight;
            case '.service-card':
            case '.tech-item':
                return this.config.animationClasses.fadeInUp;
            case '.about-text':
                return rect.left < centerX ? 
                    this.config.animationClasses.slideInLeft : 
                    this.config.animationClasses.slideInRight;
            case '.about-visual':
                return this.config.animationClasses.scaleIn;
            default:
                return this.config.animationClasses.fadeInUp;
        }
    },

    // Animar elemento
    animateElement(element) {
        if (this.state.animatedElements.has(element)) return;

        element.classList.add('animated');
        this.state.animatedElements.add(element);

        // Agregar efecto de ondas para service cards
        if (element.classList.contains('service-card')) {
            this.addRippleEffect(element);
        }

        // Animar contadores si es el contenedor de estadísticas
        if (element.classList.contains('about-stats')) {
            this.animateCounters(element);
        }
    },

    // Configurar animaciones de scroll
    setupScrollAnimations() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking && !this.state.isReducedMotion) {
                requestAnimationFrame(() => {
                    this.handleScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    // Manejar animaciones de scroll
    handleScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax en hero
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translate3d(0, ${rate}px, 0)`;
        }

        // Animar elementos parallax
        this.state.parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        // Actualizar progreso de scroll
        this.updateScrollProgress();
    },

    // Configurar elementos parallax
    setupParallaxElements() {
        this.state.parallaxElements = Array.from(
            document.querySelectorAll('[data-parallax]')
        );
    },

    // Configurar efectos de mouse
    setupMouseEffects() {
        if (this.state.isReducedMotion) return;

        // Efecto de seguimiento del mouse en hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                this.handleHeroMouseMove(e);
            });
        }

        // Efectos hover en service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
        });

        // Efecto tilt en tech items
        const techItems = document.querySelectorAll('.tech-item');
        techItems.forEach(item => {
            this.setupTiltEffect(item);
        });
    },

    // Manejar movimiento del mouse en hero
    handleHeroMouseMove(e) {
        const hero = e.currentTarget;
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        // Mover floating cards
        const cards = hero.querySelectorAll('.floating-cards .card');
        cards.forEach((card, index) => {
            const intensity = (index + 1) * 10;
            const moveX = deltaX * intensity;
            const moveY = deltaY * intensity;
            
            card.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    },

    // Manejar hover en service cards
    handleCardHover(card, isHovering) {
        const icon = card.querySelector('.service-icon');
        
        if (isHovering) {
            icon.style.transform = 'rotate(10deg) scale(1.1)';
            card.style.transform = 'translateY(-10px) scale(1.02)';
        } else {
            icon.style.transform = 'rotate(0deg) scale(1)';
            card.style.transform = 'translateY(0) scale(1)';
        }
    },

    // Configurar efecto tilt
    setupTiltEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    },

    // Agregar efecto de ondas
    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(0, 102, 204, 0.3);
            transform: translate(-50%, -50%);
            animation: ripple 0.8s linear;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 800);
    },

    // Animar contadores
    animateCounters(container) {
        const counters = container.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            // ===== CORRECCIÓN PARA "24/7" =====
            // Si el elemento es el de soporte, no lo animamos y nos aseguramos que el texto sea correcto.
            if (counter.id === 'soporte-247') {
                counter.textContent = '24/7';
                return; // Saltamos al siguiente elemento del loop
            }
            // ===================================

            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            
            // Si el resultado no es un número (ej. ""), no hacemos nada.
            if (isNaN(target)) {
                return;
            }

            const suffix = counter.textContent.replace(/\d/g, '');
            
            let current = 0;
            const increment = target / 60; // 60 frames para 1 segundo
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }
            }, 16); // ~60fps
        });
    },


    // Actualizar progreso de scroll
    updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxScroll) * 100;

        // Crear o actualizar barra de progreso
        let progressBar = document.getElementById('scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: ${progress}%;
                height: 3px;
                background: linear-gradient(90deg, #0066cc, #e74c3c);
                z-index: 10000;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        } else {
            progressBar.style.width = `${progress}%`;
        }
    },

    // Actualizar animaciones basado en preferencia
    updateAnimationsBasedOnPreference() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (this.state.isReducedMotion) {
            animatedElements.forEach(element => {
                element.classList.add('animated');
                element.style.transition = 'none';
            });
        } else {
            animatedElements.forEach(element => {
                element.style.transition = '';
            });
        }
    },

    // Agregar estilos de animación
    addAnimationStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                transition-delay: var(--animation-delay, 0s);
            }

            .animate-on-scroll.animated {
                opacity: 1;
            }

            .animate-fade-in-up.animated {
                transform: translateY(0);
            }
            .animate-fade-in-up {
                transform: translateY(30px);
            }

            .animate-fade-in-left.animated {
                transform: translateX(0);
            }
            .animate-fade-in-left {
                transform: translateX(-30px);
            }

            .animate-fade-in-right.animated {
                transform: translateX(0);
            }
            .animate-fade-in-right {
                transform: translateX(30px);
            }

            .animate-scale-in.animated {
                transform: scale(1);
            }
            .animate-scale-in {
                transform: scale(0.9);
            }

            .animate-slide-in-left.animated {
                transform: translateX(0);
            }
            .animate-slide-in-left {
                transform: translateX(-50px);
            }

            .animate-slide-in-right.animated {
                transform: translateX(0);
            }
            .animate-slide-in-right {
                transform: translateX(50px);
            }

            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .animate-on-scroll,
                .floating-cards .card,
                .service-card,
                .tech-item {
                    animation: none !important;
                    transition: none !important;
                }

                .animate-on-scroll {
                    opacity: 1 !important;
                    transform: none !important;
                }
            }

            /* Mejoras de rendimiento */
            .service-card,
            .tech-item,
            .floating-cards .card {
                will-change: transform;
            }

            .hero {
                will-change: transform;
            }
        `;
        
        document.head.appendChild(styles);
    },

    // Funciones públicas para controlar animaciones
    pauseAnimations() {
        document.body.style.setProperty('--animation-play-state', 'paused');
    },

    resumeAnimations() {
        document.body.style.setProperty('--animation-play-state', 'running');
    },

    // Limpiar recursos
    destroy() {
        if (this.observers.intersection) {
            this.observers.intersection.disconnect();
        }
        
        this.state.animatedElements.clear();
        this.state.parallaxElements = [];
    }
};

// ===== EFECTOS ESPECIALES =====
const SpecialEffects = {
    // Crear partículas flotantes
    createFloatingParticles(container, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 10;
            const animationDuration = Math.random() * 10 + 20;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                left: ${left}%;
                bottom: -10px;
                animation: float-up ${animationDuration}s linear infinite;
                animation-delay: ${animationDelay}s;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }
    },

    // Efecto de escritura
    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    },

    // Efecto de brillo en elementos
    addGlowEffect(element, color = '#0066cc') {
        element.style.boxShadow = `0 0 20px ${color}40, 0 0 40px ${color}20, 0 0 60px ${color}10`;
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    AnimationSystem.init();
    
    // Crear partículas en hero
    const hero = document.querySelector('.hero');
    if (hero && !AnimationSystem.state.isReducedMotion) {
        SpecialEffects.createFloatingParticles(hero, 15);
    }
});

// Agregar estilos para partículas
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes float-up {
        to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }

    .floating-particle {
        z-index: 1;
    }
`;
document.head.appendChild(particleStyles);

// Exportar para uso global
window.AnimationSystem = AnimationSystem;
window.SpecialEffects = SpecialEffects;