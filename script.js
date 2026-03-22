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

// ─── Mouse glow effect (desktop only) ───
const glowEffect = document.querySelector('.glow-effect');

if (window.matchMedia('(pointer: fine)').matches) {
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
