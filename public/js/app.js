document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Cinematic Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            // Fade out preloader
            preloader.classList.add('hidden');
            
            // Allow scrolling again
            setTimeout(() => {
                document.body.classList.remove('loading');
                // Trigger title glitch animation after preloader disappears
                document.querySelectorAll('.char').forEach(el => el.classList.add('revealed'));
            }, 1000); // Wait for the 1s fade-out transition
        }, 3000); // 3 seconds cinematic entry duration
    } else {
        // Fallback if no preloader exists
        setTimeout(() => {
            document.querySelectorAll('.char').forEach(el => el.classList.add('revealed'));
        }, 300);
    }
    
    // 1. Dynamic Font Stagger Animation
    const titleElement = document.getElementById('animatedTitle');
    if (titleElement) {
        const text = titleElement.innerText;
        titleElement.innerHTML = '';
        
        // Split text into lines, then characters
        const words = text.split(' ');
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.marginRight = '20px';
            
            [...word].forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.innerText = char;
                // Add staggered delay
                charSpan.style.transitionDelay = `${(wordIndex * 0.2) + (charIndex * 0.05)}s`;
                wordSpan.appendChild(charSpan);
            });
            titleElement.appendChild(wordSpan);
        });
    }

    // 2. Custom Logo Upload Logic
    const logoTrigger = document.getElementById('logoUploadTrigger');
    const logoInput = document.getElementById('logoInput');
    const customLogo = document.getElementById('customLogo');

    if (logoTrigger && logoInput && customLogo) {
        logoTrigger.addEventListener('click', () => {
            logoInput.click();
        });

        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Create a local blob URL to display the image immediately
                const objectUrl = URL.createObjectURL(file);
                customLogo.src = objectUrl;
                
                // Add a glow ping effect to show it updated
                logoTrigger.style.filter = 'drop-shadow(0 0 20px #00f0ff)';
                setTimeout(() => {
                    logoTrigger.style.filter = '';
                }, 1000);
            }
        });
    }

    // 3. Scroll Reveal Animations via IntersectionObserver
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Special check for timeline to glow the line
                if (entry.target.classList.contains('timeline-line')) {
                    entry.target.parentElement.classList.add('scrolled');
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.fade-up, .fade-in, .scroll-reveal, .scroll-expand, .timeline-line').forEach((el) => {
        revealObserver.observe(el);
    });

    // 4. Parallax effect for the 3D cube
    document.addEventListener('mousemove', (e) => {
        const cube = document.querySelector('.glass-cube');
        if (cube) {
            const x = (window.innerWidth / 2 - e.pageX) / 50;
            const y = (window.innerHeight / 2 - e.pageY) / 50;
            // The cube already has an animation, we can add transform wrapper or let it be.
            // Actually, we apply it to the container instead.
            const container = document.querySelector('.hero-graphic');
            container.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    // 5. Registration Form DB Submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Submitting...</span><div class="btn-backdrop" style="left:0"></div>';
            
            const payload = {
                teamName: document.getElementById('teamName').value,
                email: document.getElementById('email').value,
                teamSize: document.getElementById('teamSize').value,
                passcode: document.getElementById('regPass').value
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();

                if (response.ok && data.success) {
                    registerForm.style.display = 'none';
                    document.getElementById('formError').style.display = 'none';
                    document.getElementById('formSuccess').style.display = 'block';
                } else {
                    document.getElementById('formError').innerText = '[Error: ' + data.message + ']';
                    document.getElementById('formError').style.display = 'block';
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                document.getElementById('formError').innerText = '[Critical Error: Cannot connect to server]';
                document.getElementById('formError').style.display = 'block';
                btn.innerHTML = originalText;
            }
        });
    }

    // 6. Contact Form Dummy Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-submit');
            
            btn.innerHTML = '<span>Sending Message...</span><div class="btn-backdrop" style="left:0"></div>';
            
            setTimeout(() => {
                contactForm.style.display = 'none';
                document.getElementById('contactSuccess').style.display = 'block';
            }, 1200);
        });
    }

    // 7. Login Form Handing
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('.btn-submit');
            
            btn.innerHTML = '<span style="text-shadow: 0 0 10px var(--neon-primary);">VERIFYING...</span><div class="btn-backdrop" style="background: var(--neon-primary); left:0"></div>';
            
            setTimeout(() => {
                // Redirect user to the designated verified dashboard page
                window.location.href = '/dashboard.html';
            }, 1000);
        });
    }
});
