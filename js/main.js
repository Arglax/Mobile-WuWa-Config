// Global framework components for WuWa Portal Layout Templates
function toggleMobileNav() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('open');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn && headerNav) {
        // Remove inline onclick to avoid double-firing, then handle via listener
        mobileMenuBtn.removeAttribute('onclick');

        // Toggle open when hamburger is clicked
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerNav.classList.toggle('open');
        });

        // Close menu when any nav link is tapped
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('open');
            });
        });

        // Close menu when tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                headerNav.classList.remove('open');
            }
        });
    }
});