// Professional CV Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth reveal animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all CV sections for animation
    const animationSections = document.querySelectorAll('.cv-section');
    animationSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(section);
    });





    // Copy email functionality
    const emailElements = document.querySelectorAll('.contact-item');
    emailElements.forEach(element => {
        if (element.textContent.includes('@')) {
            element.style.cursor = 'pointer';
            element.title = 'Click to copy email';
            
            element.addEventListener('click', () => {
                const email = element.textContent.replace('📧 ', '');
                navigator.clipboard.writeText(email).then(() => {
                    const originalText = element.innerHTML;
                    element.innerHTML = '✓ Email copied!';
                    element.style.color = '#6b7280';
                    
                    setTimeout(() => {
                        element.innerHTML = originalText;
                        element.style.color = '';
                    }, 2000);
                });
            });
        }
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'p':
                    e.preventDefault();
                    window.print();
                    break;
            }
        }
    });

    // Dynamic copyright year
    const footer = document.querySelector('.footer p');
    if (footer) {
        footer.innerHTML = footer.innerHTML.replace('2024', new Date().getFullYear());
    }

    // Table of Contents functionality
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.cv-section');

    // Smooth scrolling for table of contents links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Highlight active section in table of contents
    function updateActiveSection() {
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                current = section.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Update active section on scroll
    window.addEventListener('scroll', updateActiveSection);
    updateActiveSection(); // Set initial active section
});

// Utility function for smooth scrolling to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
} 