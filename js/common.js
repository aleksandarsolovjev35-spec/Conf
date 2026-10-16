/* =============================================================
   COMMON — общий каркас обеих страниц:
   бургер-меню, навбар при прокрутке, кнопка «наверх»,
   плавная прокрутка по якорям и переход между страницами.
   Подключается на index.html и photos.html первым.
============================================================= */

    // ===== Бургер-меню =====
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');
    const navbar    = document.getElementById('navbar');

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // ===== Навбар + кнопка «Наверх» =====
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Плавная прокрутка =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top
                          + window.pageYOffset
                          - navbar.offsetHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== Плавный переход между страницами (главная <-> фотобанк) =====
    // В браузерах с кросс-документными View Transitions анимацию делает
    // сам браузер (см. @view-transition в css/animations.css), здесь — запасной
    // вариант через оверлей для остальных браузеров.
    (function () {
        const overlay = document.getElementById('pageTransition');
        if (!overlay) return;
        const nativeVT = 'onpagereveal' in window;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Приход на страницу по переходу: оверлей плавно уходит
        if (sessionStorage.getItem('page-transition') === '1') {
            sessionStorage.removeItem('page-transition');
            if (!nativeVT && !reduceMotion) {
                overlay.classList.add('is-cover');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    overlay.classList.remove('is-cover');
                }));
            }
        }

        if (nativeVT || reduceMotion) return;

        document.querySelectorAll('a[href]').forEach(link => {
            const url = new URL(link.getAttribute('href'), location.href);
            const isOtherPage = url.origin === location.origin &&
                                url.pathname !== location.pathname &&
                                !link.hasAttribute('download');
            if (!isOtherPage) return;
            link.addEventListener('click', (e) => {
                if (e.defaultPrevented || e.button !== 0 ||
                    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
                    (link.target && link.target !== '_self')) return;
                e.preventDefault();
                sessionStorage.setItem('page-transition', '1');
                overlay.classList.add('is-cover');
                setTimeout(() => { location.href = url.href; }, 330);
            });
        });

        // Возврат по кнопке «Назад» браузера: не оставлять закрытый оверлей
        window.addEventListener('pageshow', () => overlay.classList.remove('is-cover'));
    })();
