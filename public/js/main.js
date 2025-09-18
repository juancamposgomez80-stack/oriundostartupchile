/**
 * Oriundo Startup Chile - Main JavaScript
 * Patrón MVC - Controlador Principal
 */

// ===== MODELO DE DATOS =====
const AppModel = {
    // Estado de la aplicación
    state: {
        menuOpen: false,
        currentSection: 'inicio',
        scrollPosition: 0,
        isScrolling: false,
        formData: {
            nombre: '',
            telefono: '',
            email: '',
            servicio: '',
            comentario: ''
        },
        services: [
            {
                id: 'web',
                name: 'Desarrollo Web',
                description: 'Sitios web modernos y responsivos'
            },
            {
                id: 'consultoria',
                name: 'Asesorías & Documentación',
                description: 'Análisis y documentación de procesos'
            },
            {
                id: 'investigacion',
                name: 'Investigación Tecnológica',
                description: 'Análisis de tendencias tecnológicas'
            },
            {
                id: 'multiplataforma',
                name: 'Desarrollo Multiplataforma',
                description: 'Aplicaciones con Kotlin y Ktor'
            },
            {
                id: 'android',
                name: 'Desarrollo Android',
                description: 'Apps nativas para Android'
            },
            {
                id: 'especializadas',
                name: 'Tecnologías Especializadas',
                description: 'IA, ML, Blockchain e IoT'
            }
        ]
    },

    // Métodos del modelo
    updateFormData(field, value) {
        this.state.formData[field] = value;
    },

    resetFormData() {
        this.state.formData = {
            nombre: '',
            telefono: '',
            email: '',
            servicio: '',
            comentario: ''
        };
    },

    setCurrentSection(section) {
        this.state.currentSection = section;
    },

    toggleMenu() {
        this.state.menuOpen = !this.state.menuOpen;
    },

    setScrollPosition(position) {
        this.state.scrollPosition = position;
    }
};

// ===== VISTA - MANEJADOR DE DOM =====
const AppView = {
    // Referencias a elementos DOM
    elements: {
        header: null,
        menuToggle: null,
        navLinks: null,
        backToTop: null,
        sections: null,
        serviceCards: null,
        contactForm: null,
        logoContainer: null
    },

    // Inicializar referencias DOM
    init() {
        this.elements.header = document.getElementById('header');
        this.elements.menuToggle = document.getElementById('menu-toggle');
        this.elements.navLinks = document.getElementById('nav-links');
        this.elements.backToTop = document.getElementById('backToTop');
        this.elements.sections = document.querySelectorAll('section[id]');
        this.elements.serviceCards = document.querySelectorAll('.service-card');
        this.elements.contactForm = document.getElementById('contactForm');
        this.elements.logoContainer = document.getElementById('logo-container');
    },

    // Actualizar header según scroll
    updateHeader(scrolled) {
        if (scrolled) {
            this.elements.header.classList.add('scrolled');
        } else {
            this.elements.header.classList.remove('scrolled');
        }
    },

    // Mostrar/ocultar menú móvil
    toggleMobileMenu(isOpen) {
        if (isOpen) {
            this.elements.navLinks.classList.add('active');
            this.elements.menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            this.elements.navLinks.classList.remove('active');
            this.elements.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    },

    // Mostrar/ocultar botón back to top
    toggleBackToTop(visible) {
        if (visible) {
            this.elements.backToTop.classList.add('visible');
        } else {
            this.elements.backToTop.classList.remove('visible');
        }
    },

    // Actualizar sección activa en navegación
    updateActiveNavigation(activeSection) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    },

    // Cargar logo corporativo
    loadLogo(logoUrl) {
        if (logoUrl && this.elements.logoContainer) {
            this.elements.logoContainer.innerHTML = `<img src="${logoUrl}" alt="Logo Oriundo Startup" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
    }
};

// ===== CONTROLADOR =====
const AppController = {
    // Inicializar aplicación
    init() {
        AppView.init();
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.detectCurrentSection();
        
        console.log('Oriundo Startup Chile - Aplicación inicializada');
    },

    // Configurar event listeners
    setupEventListeners() {
        // Scroll events
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Menu toggle
        if (AppView.elements.menuToggle) {
            AppView.elements.menuToggle.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        // Navigation links
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.smoothScrollTo(targetId);
                
                // Cerrar menú móvil si está abierto
                if (AppModel.state.menuOpen) {
                    this.toggleMenu();
                }
            });
        });

        // Back to top button
        if (AppView.elements.backToTop) {
            AppView.elements.backToTop.addEventListener('click', () => {
                this.smoothScrollTo('inicio');
            });
        }

        // Service cards interactions
        AppView.elements.serviceCards.forEach(card => {
            const button = card.querySelector('.btn-service');
            if (button) {
                button.addEventListener('click', () => {
                    const serviceType = card.dataset.service;
                    this.showServiceDetails(serviceType);
                });
            }
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (AppModel.state.menuOpen && 
                !AppView.elements.navLinks.contains(e.target) && 
                !AppView.elements.menuToggle.contains(e.target)) {
                this.toggleMenu();
            }
        });

        // Resize event
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1023 && AppModel.state.menuOpen) {
                this.toggleMenu();
            }
        });
    },

    // Manejar scroll
    handleScroll() {
        const scrollPosition = window.pageYOffset;
        AppModel.setScrollPosition(scrollPosition);

        // Update header
        AppView.updateHeader(scrollPosition > 50);

        // Update back to top button
        AppView.toggleBackToTop(scrollPosition > 300);

        // Update active section
        this.detectCurrentSection();

        // Animate elements on scroll
        this.animateOnScroll();
    },

    // Toggle menu móvil
    toggleMenu() {
        AppModel.toggleMenu();
        AppView.toggleMobileMenu(AppModel.state.menuOpen);
    },

    // Scroll suave a sección
    smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const headerHeight = AppView.elements.header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            AppModel.setCurrentSection(targetId);
        }
    },

    // Detectar sección actual
    detectCurrentSection() {
        const scrollPosition = window.pageYOffset + 100;
        let current = 'inicio';

        AppView.elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        if (current !== AppModel.state.currentSection) {
            AppModel.setCurrentSection(current);
            AppView.updateActiveNavigation(current);
        }
    },

    // Configurar animaciones de scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observar elementos para animar
        const elementsToAnimate = document.querySelectorAll(`
            .service-card,
            .tech-item,
            .about-text,
            .about-visual,
            .contact-info,
            .contact-form-container
        `);

        elementsToAnimate.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    },

    // Animar elementos en scroll
    animateOnScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll:not(.animated)');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    },

    // Mostrar detalles de servicio
    showServiceDetails(serviceType) {
        const service = AppModel.state.services.find(s => s.id === serviceType);
        if (service) {
            // Rellenar formulario con el servicio seleccionado
            const serviceSelect = document.getElementById('servicio');
            if (serviceSelect) {
                serviceSelect.value = serviceType;
            }

            // Scroll al formulario
            this.smoothScrollTo('contacto');

            // Mostrar notificación
            AppView.showNotification(`Servicio "${service.name}" seleccionado. Complete el formulario para más información.`);
        }
    },

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validar teléfono chileno
    validateChileanPhone(phone) {
        // Formato chileno: +56 9 XXXX XXXX o variaciones
        const re = /^(\+?56|0)?[\s-]?[1-9][\s-]?\d{4}[\s-]?\d{4}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    // Formatear teléfono
    formatPhone(phone) {
        // Remover espacios y caracteres especiales
        let cleaned = phone.replace(/\D/g, '');
        
        // Si empieza con 56, agregar +
        if (cleaned.startsWith('56') && cleaned.length >= 11) {
            cleaned = '+' + cleaned;
        }
        
        return cleaned;
    },

    // Cargar logo desde archivo
    loadLogoFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    AppView.loadLogo(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
};

// ===== UTILIDADES =====
const Utils = {
    // Debounce function
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generar ID único
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // Formatear fecha
    formatDate(date) {
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});

// Prevenir errores y mostrar mensajes útiles
window.addEventListener('error', (e) => {
    console.error('Error en Oriundo Startup:', e.error);
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(registrationError => {
                console.log('SW registro falló:', registrationError);
            });
    });
}

// Exportar para uso global
window.OriundoApp = {
    Model: AppModel,
    View: AppView,
    Controller: AppController,
    Utils: Utils
};