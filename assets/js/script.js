document.addEventListener("DOMContentLoaded", function() {
    // Load Header & Footer
    Promise.all([
        fetch('header.html').then(res => res.text()),
        fetch('footer.html').then(res => res.text())
    ]).then(([headerData, footerData]) => {
        document.getElementById('header-placeholder').innerHTML = headerData;
        document.getElementById('footer-placeholder').innerHTML = footerData;

        // Auto-assign active class to current nav link
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.main-header .nav-link');
        navLinks.forEach(link => {
            if(link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
        
        // Header scroll effect
        const header = document.querySelector('.main-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Scroll to Top
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");
        if(scrollToTopBtn){
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollToTopBtn.style.display = "flex";
                } else {
                    scrollToTopBtn.style.display = "none";
                }
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });

    // Initialize AOS
    if(typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // Initialize Hero Swiper if exists
    let heroSwiper;
    if (document.querySelector('.hero-swiper') && typeof Swiper !== 'undefined') {
        heroSwiper = new Swiper('.hero-swiper', {
            loop: true,
            effect: 'fade',
            speed: 1000,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function () {
                    animateSlideContent(this.slides[this.activeIndex]);
                },
                slideChangeTransitionStart: function () {
                    // Hide content of all slides
                    const allContents = document.querySelectorAll('.hero-content');
                    if (typeof gsap !== 'undefined') {
                        gsap.set(allContents, { opacity: 0 });
                    }
                },
                slideChangeTransitionEnd: function () {
                    animateSlideContent(this.slides[this.activeIndex]);
                    // Change ThreeJS Design if exists
                    if (window.updateThreeJS) {
                        window.updateThreeJS(this.realIndex);
                    }
                }
            }
        });
    } else {
        // Fallback GSAP if no swiper
        if(typeof gsap !== 'undefined' && document.querySelector(".hero-content h1")) {
            gsap.from(".hero-content h1", { duration: 1, y: -50, opacity: 0, delay: 0.5 });
            gsap.from(".hero-content p", { duration: 1, y: 50, opacity: 0, delay: 0.8 });
        }
    }

    function animateSlideContent(slide) {
        if(typeof gsap !== 'undefined') {
            const h1 = slide.querySelector('.spin-text');
            const p = slide.querySelector('.slide-text');
            const btn = slide.querySelector('.slide-btn');
            
            // Show parent
            gsap.set(slide.querySelector('.hero-content'), { opacity: 1 });
            
            // Spin entrance for h1
            gsap.fromTo(h1, 
                { opacity: 0, scale: 0.2, rotation: -180 }, 
                { opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)" }
            );
            
            // Slide up for p
            gsap.fromTo(p, 
                { opacity: 0, y: 50 }, 
                { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
            );

            // Pop in for btn
            if(btn) {
                gsap.fromTo(btn, 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 0.8, delay: 0.8, ease: "back.out(1.7)" }
                );
            }
        }
    }

    // Initialize Three.js if canvas exists
    if(document.getElementById('threejs-canvas')) {
        initThreeJS();
    }
});

function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');
    if(!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for ( let i = 0; i < 2000; i ++ ) {
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
    }
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
    // Default Material
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points( geometry, material );
    scene.add( particles );
    
    camera.position.z = 500;
    
    let rotationSpeedX = 0.001;
    let rotationSpeedY = 0.002;
    
    // Global function to update design based on swiper slide
    window.updateThreeJS = function(slideIndex) {
        if (slideIndex === 0) {
            // Slide 1: White stars moving slowly
            gsap.to(material.color, { r: 1, g: 1, b: 1, duration: 1 });
            gsap.to(material, { size: 2, duration: 1 });
            rotationSpeedX = 0.001;
            rotationSpeedY = 0.002;
        } else if (slideIndex === 1) {
            // Slide 2: Greenish/Blue nature particles moving faster
            gsap.to(material.color, { r: 0.2, g: 0.8, b: 0.5, duration: 1 });
            gsap.to(material, { size: 3, duration: 1 });
            rotationSpeedX = -0.003;
            rotationSpeedY = 0.004;
        } else if (slideIndex === 2) {
            // Slide 3: Warm orange/gold particles moving upwards
            gsap.to(material.color, { r: 1, g: 0.6, b: 0.2, duration: 1 });
            gsap.to(material, { size: 2.5, duration: 1 });
            rotationSpeedX = 0.002;
            rotationSpeedY = -0.003;
        }
    };
    
    function animate() {
        requestAnimationFrame( animate );
        particles.rotation.x += rotationSpeedX;
        particles.rotation.y += rotationSpeedY;
        renderer.render( scene, camera );
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

