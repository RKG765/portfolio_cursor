// Initialize all site functionality
const initializeSite = () => {
    // Mobile navigation functionality
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuButton.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuButton.contains(e.target)) {
                nav.classList.remove('active');
                menuButton.classList.remove('active');
            }
        });
    }

    // Blog search functionality
    const searchInput = document.querySelector('.search-input');
    const blogPosts = document.querySelectorAll('.post-card, .featured-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            blogPosts.forEach(post => {
                const title = post.querySelector('h2, h3')?.textContent.toLowerCase() || '';
                const category = post.querySelector('.post-category')?.textContent.toLowerCase() || '';
                const excerpt = post.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';

                const isMatch = title.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    excerpt.includes(searchTerm);

                post.style.display = isMatch ? 'block' : 'none';
            });
        });
    }

    // Category filtering
    const categoryLinks = document.querySelectorAll('.category-list a');

    if (categoryLinks.length) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const category = link.textContent.split('(')[0].trim().toLowerCase();

                blogPosts.forEach(post => {
                    const postCategory = post.querySelector('.post-category')?.textContent.toLowerCase() || '';
                    post.style.display = (category === postCategory || category === 'all') ? 'block' : 'none';
                });
            });
        });
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    if (images.length) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Newsletter form validation
    const form = document.querySelector('.newsletter-form');
    if (form) {
        const emailInput = form.querySelector('input[type="email"]');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (isValid) {
                showMessage('Thank you for subscribing!', 'success');
                form.reset();
            } else {
                showMessage('Please enter a valid email address', 'error');
            }
        });
    }

    // Helper function to show messages
    const showMessage = (message, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        form.appendChild(messageDiv);

        setTimeout(() => messageDiv.remove(), 3000);
    };

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Portfolio filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    card.style.display = (filterValue === 'all' || filterValue === category) ? 'block' : 'none';
                });
            });
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150 && window.scrollY < sectionTop + sectionHeight - 150) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (section.getAttribute('id') === link.getAttribute('href').substring(1)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Portfolio lightbox
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('click', function () {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';

            const img = this.querySelector('img')?.cloneNode(true);
            const description = this.querySelector('.portfolio-description')?.cloneNode(true);

            if (img && description) {
                lightbox.appendChild(img);
                lightbox.appendChild(description);
                document.body.appendChild(lightbox);

                lightbox.addEventListener('click', () => {
                    lightbox.remove();
                });
            }
        });
    });

    // Social media icon hover effects
    const socialIcons = document.querySelectorAll('.social-links a');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'transform 0.3s ease';
        });

        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
        });
    });
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSite);
