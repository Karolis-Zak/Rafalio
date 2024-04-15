// style.js

// Firework-like effect
const fireworkContainer = document.createElement('div');
fireworkContainer.style.position = 'fixed';
fireworkContainer.style.top = '0';
fireworkContainer.style.left = '0';
fireworkContainer.style.width = '100vw';
fireworkContainer.style.height = '100vh';
fireworkContainer.style.pointerEvents = 'none';
document.body.appendChild(fireworkContainer);

function createFirework() {
    const firework = document.createElement('div');
    firework.style.position = 'absolute';
    firework.style.left = `${Math.random() * 100}%`;
    firework.style.top = `${Math.random() * 100}%`;
    firework.style.width = '5px';
    firework.style.height = '5px';
    firework.style.borderRadius = '50%';
    firework.style.backgroundColor = 'transparent';
    firework.style.boxShadow = `0 0 6px #fff, 0 0 10px #fff, 0 0 14px #f0f, 0 0 20px #0ff`;
    firework.style.animation = 'firework-burst 700ms forwards';
    fireworkContainer.appendChild(firework);
    setTimeout(() => firework.remove(), 700);
}

setInterval(createFirework, 200);

// Glowing animation for banner text
const bannerText = document.querySelector('.banner h1');
bannerText.addEventListener('mouseenter', () => {
    bannerText.style.animation = 'glow 1.5s ease-in-out infinite alternate';
});
bannerText.addEventListener('mouseleave', () => {
    bannerText.style.animation = '';
});



// Add the keyframes to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes firework-burst {
        0% {
            opacity: 1;
            transform: scale(0.5);
        }
        100% {
            opacity: 0;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(styleSheet);



