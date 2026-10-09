// ─── Nav: add 'scrolled' class on scroll ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── Mobile nav toggle ───
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── Mouse glow effect (desktop only; only on pages that have the element) ───
const glowEffect = document.querySelector('.glow-effect');

if (glowEffect && window.matchMedia('(pointer: fine)').matches) {
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            glowEffect.style.left = e.clientX + 'px';
            glowEffect.style.top = e.clientY + 'px';
            rafId = null;
        });
    });
}

// ─── Newsletter form submit ───
const form = document.getElementById('notifyForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        btn.innerHTML = 'Thank you <i class="fa-solid fa-check"></i>';
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
        btn.style.color = 'white';
        form.querySelector('.email-input').disabled = true;
    });
}

// ─── Cookie consent (Google Consent Mode v2) ───
(function () {
    const KEY = 'lekova_cookie_consent';
    let choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) {}

    // If the visitor already accepted, grant analytics for this page load.
    if (choice === 'granted' && typeof gtag === 'function') {
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }

    // A choice already exists → never show the banner again.
    if (choice === 'granted' || choice === 'denied') return;

    // Build the banner.
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
        '<p class="cookie-text">We use cookies to understand how our site is used and improve your experience. ' +
        'See our <a href="/privacy/">Privacy Policy</a>.</p>' +
        '<div class="cookie-actions">' +
        '<button class="cookie-btn decline" type="button">Decline</button>' +
        '<button class="cookie-btn accept" type="button">Accept</button>' +
        '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));

    function close() {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 450);
    }

    banner.querySelector('.accept').addEventListener('click', () => {
        try { localStorage.setItem(KEY, 'granted'); } catch (e) {}
        if (typeof gtag === 'function') {
            gtag('consent', 'update', { 'analytics_storage': 'granted' });
        }
        close();
    });

    banner.querySelector('.decline').addEventListener('click', () => {
        try { localStorage.setItem(KEY, 'denied'); } catch (e) {}
        close();
    });
})();
