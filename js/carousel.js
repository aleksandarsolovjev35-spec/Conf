(function () {
    'use strict';

    const carousel = document.getElementById('photobankCarousel');
    const track = document.getElementById('carouselTrack');
    const dotsBox = document.getElementById('carouselDots');
    const counter = document.getElementById('carouselCounter');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!carousel || !track || !dotsBox || !counter) {
        return;
    }

    const slides = track.querySelectorAll('.photobank-slide');
    const total = slides.length;
    if (!total) {
        return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer = null;

    slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'photobank-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Альбом ' + (index + 1) + ' из ' + total);
        dot.addEventListener('click', function () {
            goTo(index);
            restart();
        });
        dotsBox.appendChild(dot);
    });

    const dots = dotsBox.querySelectorAll('.photobank-carousel-dot');

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';

        dots.forEach(function (dot, dotIndex) {
            const active = dotIndex === current;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', String(active));
        });

        counter.textContent = (current + 1) + ' / ' + total;
    }

    function stop() {
        clearInterval(timer);
        timer = null;
    }

    function restart() {
        stop();
        if (!reduceMotion) {
            timer = setInterval(function () {
                goTo(current + 1);
            }, 4500);
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            goTo(current - 1);
            restart();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            goTo(current + 1);
            restart();
        });
    }

    carousel.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
            goTo(current - 1);
            restart();
        } else if (event.key === 'ArrowRight') {
            goTo(current + 1);
            restart();
        }
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', restart);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', restart);

    let touchX = null;

    carousel.addEventListener('touchstart', function (event) {
        touchX = event.changedTouches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (event) {
        if (touchX === null) {
            return;
        }
        const deltaX = event.changedTouches[0].clientX - touchX;
        if (Math.abs(deltaX) > 40) {
            goTo(current + (deltaX < 0 ? 1 : -1));
            restart();
        }
        touchX = null;
    }, { passive: true });

    goTo(0);
    restart();
})();
