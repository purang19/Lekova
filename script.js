document.addEventListener('DOMContentLoaded', () => {
    // ---- Minimal Desktop Parallax / Ambient Glow ----
    // Only apply on non-touch devices for performance and UX
    if (window.matchMedia("(pointer: fine)").matches) {
        const bgContainer = document.querySelector('.background-overlay');
        const glowTarget = document.querySelector('.glow-effect');

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            
            const xRatio = x / window.innerWidth;
            const yRatio = y / window.innerHeight;
            
            // Move subtle background gradient inversely
            const bgX = (xRatio - 0.5) * -15;
            const bgY = (yRatio - 0.5) * -15;
            
            requestAnimationFrame(() => {
                bgContainer.style.transform = `translate(${bgX}px, ${bgY}px) scale(1.05)`;
                
                // Track mouse directly with the glow effect
                if(glowTarget) {
                    glowTarget.style.left = `${x}px`;
                    glowTarget.style.top = `${y}px`;
                }
            });
        });
    }
});
