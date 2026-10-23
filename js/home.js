(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function startCounter(statEl, instant) {
        const numEl = statEl.querySelector('.about-stat-number');
        if (!numEl || numEl.dataset.counted) {
            return;
        }

        numEl.dataset.counted = '1';
        const raw = numEl.textContent.trim();
        const target = parseInt(raw, 10);
        if (Number.isNaN(target)) {
            return;
        }

        const suffix = raw.replace(String(target), '');
        if (instant || reduceMotion || target === 0) {
            numEl.textContent = target + suffix;
            return;
        }

        const duration = 900;
        const started = performance.now();

        (function tick(now) {
            const progress = Math.min((now - started) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            numEl.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        })(started);
    }

    if (typeof window.initReveal === 'function') {
        window.initReveal(
            '.about-stat, .about-topic-card, .speaker-card, .partner-logo, ' +
            '.contact-card, .publication-card, .photobank-carousel, .program-item',
            function (el, instant) {
                if (el.classList.contains('about-stat')) {
                    startCounter(el, instant);
                }
            }
        );
    }
})();
