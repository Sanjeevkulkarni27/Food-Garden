// Header — always white, apply scrolled immediately and keep it forever
const _header = document.getElementById('header');
if (_header) _header.classList.add('scrolled'); // apply instantly on parse

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) header.classList.add('scrolled');
});

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    navLinks.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
}

// Proactively inject footer to avoid duplication
const footerHTML = `
    <div class="footer-grid">
        <div class="footer-col">
            <h4>Food Garden</h4>
            <p>Nurturing nature, serving soul. The best organic dining experience in the city.</p>
            <div class="social-links" style="margin-top: 20px;">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
        <div class="footer-col">
            <h4>Quick Links</h4>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="menu.html">Menu</a></li>
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="reserve.html">Book a Table</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h4>Contact Info</h4>
            <p><i class="fas fa-map-marker-alt"></i> 17, Lavelle Road<br>Ashok Nagar, Bengaluru, Karnataka 560001</p>
            <p><i class="fas fa-phone"></i> +91 80 3521 6789</p>
            <p><i class="fas fa-envelope"></i> hello@foodgarden.in</p>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2026 Food Garden Restaurant. All rights reserved.</p>
    </div>
`;

window.addEventListener('DOMContentLoaded', () => {
    // Inject Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = `<footer>${footerHTML}</footer>`;
    }

    // Burger Menu Event
    const burger = document.querySelector('.burger');
    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    // Set active link in nav
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Simple fade-in animation for cards
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.dish-card, .dish-card-new, .dish-card-home, .testimonial-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});
