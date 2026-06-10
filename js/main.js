// Global framework components for WuWa Portal Layout Templates
function toggleMobileNav() {
    const nav = document.getElementById('siteNav');
    if (nav) {
        nav.classList.toggle('nav-expanded');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn && headerNav) {
        // Toggle the 'open' class when the hamburger menu is clicked
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents immediate closing if clicking directly on the button
            headerNav.classList.toggle('open');
        });

        // Optional: Close the menu when tapping any navigation link (Hub, Devprof Gen, Decryptor)
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('open');
            });
        });

        // Optional: Close the menu if tapping anywhere outside the navigation drawer
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                headerNav.classList.remove('open');
            }
        });
    }
});