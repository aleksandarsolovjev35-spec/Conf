/* =============================================================
   HOME — логика главной страницы (index.html):
   счётчики статистики, запуск анимаций появления (reveal.js)
   и карусель фотобанка. Требует common.js и reveal.js выше.
============================================================= */

    // ===== Счётчики статистики: число докручивается от 0 при появлении =====
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function startCounter(statEl, instant) {
        const numEl = statEl.querySelector('.about-stat-number');
        if (!numEl || numEl.dataset.counted) return;
        numEl.dataset.counted = '1';
        const raw = numEl.textContent.trim();
        const target = parseInt(raw, 10);
        if (isNaN(target)) return;
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
            if (progress < 1) requestAnimationFrame(tick);
        })(started);
    }

    // Появление элементов главной: статистика (со счётчиками),
    // направления, спикеры, партнёры, контакты, карусель фотобанка
    // и пункты программы.
    // ВАЖНО: заголовки секций (section h2) не анимируем — иначе при
    // сбое IntersectionObserver раздел выглядит пустым без заголовка.
    initReveal(
        '.about-stat, .about-topic-card, ' +
        '.speaker-card, .partner-logo, .contact-card, ' +
        '.publication-card, .photobank-carousel, .program-item',
        (el, instant) => {
            if (el.classList.contains('about-stat')) startCounter(el, instant);
        }
    );

    // ===== Карусель фотобанка на главной =====
    // Клик по слайду ведёт в фотобанк (photos.html). Стрелки, точки и свайп листают альбомы.
    (function () {
        const track   = document.getElementById('carouselTrack');
        if (!track) return;
        const slides  = track.querySelectorAll('.photobank-slide');
        const dotsBox = document.getElementById('carouselDots');
        const counter = document.getElementById('carouselCounter');
        const total   = slides.length;
        let current   = 0;
        let timer     = null;

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'photobank-carousel-dot';
            dot.setAttribute('aria-label', 'Альбом ' + (i + 1) + ' из ' + total);
            dot.addEventListener('click', () => { goTo(i); restart(); });
            dotsBox.appendChild(dot);
        });
        const dots = dotsBox.querySelectorAll('.photobank-carousel-dot');

        function goTo(i) {
            current = (i + total) % total;
            track.style.transform = 'translateX(-' + current * 100 + '%)';
            dots.forEach((d, di) => d.classList.toggle('is-active', di === current));
            counter.textContent = (current + 1) + ' / ' + total;
        }

        document.getElementById('carouselPrev').addEventListener('click', () => { goTo(current - 1); restart(); });
        document.getElementById('carouselNext').addEventListener('click', () => { goTo(current + 1); restart(); });

        // Автопрокрутка (пауза при наведении/фокусе и при reduced-motion)
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function restart() {
            clearInterval(timer);
            if (!reduceMotion) timer = setInterval(() => goTo(current + 1), 4500);
        }
        const carousel = document.getElementById('photobankCarousel');
        carousel.addEventListener('mouseenter', () => clearInterval(timer));
        carousel.addEventListener('mouseleave', restart);
        carousel.addEventListener('focusin',  () => clearInterval(timer));
        carousel.addEventListener('focusout', restart);

        // Свайп на телефоне
        let touchX = null;
        carousel.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); restart(); }
            touchX = null;
        }, { passive: true });

        goTo(0);
        restart();
    })();
