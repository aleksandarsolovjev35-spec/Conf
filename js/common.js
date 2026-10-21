/* =============================================================
   COMMON — общий каркас обеих страниц:
   бургер-меню, навбар при прокрутке, кнопка «наверх»,
   плавная прокрутка по якорям и переход между страницами.
   Подключается на index.html и photos.html первым.
============================================================= */

    // ===== Защита изображений от обычного копирования =====
    // Это мешает случайно сохранить картинку через меню браузера, перетаскивание
    // или Ctrl/Cmd+C. Сам файл всё равно можно получить через инструменты браузера.
    (function () {
        const imageSelector = 'img, picture, svg, canvas';

        function isImageTarget(target) {
            const element = target instanceof Element ? target : target && target.parentElement;
            return Boolean(element && element.closest(imageSelector));
        }

        document.querySelectorAll('img').forEach(image => {
            image.draggable = false;
        });

        ['contextmenu', 'dragstart'].forEach(type => {
            document.addEventListener(type, event => {
                if (isImageTarget(event.target)) event.preventDefault();
            }, true);
        });

        document.addEventListener('copy', event => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) return;

            const images = document.querySelectorAll(imageSelector);
            for (let i = 0; i < selection.rangeCount; i++) {
                const range = selection.getRangeAt(i);
                for (const image of images) {
                    try {
                        if (range.intersectsNode(image)) {
                            event.preventDefault();
                            return;
                        }
                    } catch (_) {
                        // Узел мог быть удалён динамически во время выделения.
                    }
                }
            }
        }, true);
    })();

    // ===== Бургер-меню =====
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');
    const navbar    = document.getElementById('navbar');

    const mobileNav = window.matchMedia('(max-width: 1024px)');

    function setMenuOpen(isOpen, restoreFocus = false) {
        const open = isOpen && mobileNav.matches;
        navLinks.classList.toggle('active', open);
        navToggle.classList.toggle('active', open);
        document.body.classList.toggle('nav-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        // Закрытая выдвижная панель недоступна для Tab и скринридеров.
        navLinks.inert = mobileNav.matches && !open;
        if (restoreFocus) navToggle.focus();
    }

    navToggle.addEventListener('click', () => {
        setMenuOpen(!navLinks.classList.contains('active'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) setMenuOpen(false);
    });

    document.addEventListener('keydown', (e) => {
        if (!navLinks.classList.contains('active')) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            setMenuOpen(false, true);
        }
        if (e.key === 'Tab') {
            const lastLink = navLinks.querySelector('li:last-child a');
            if (e.shiftKey && document.activeElement === navToggle) {
                e.preventDefault();
                lastLink.focus();
            } else if (!e.shiftKey && document.activeElement === lastLink) {
                e.preventDefault();
                navToggle.focus();
            }
        }
    });

    mobileNav.addEventListener('change', () => setMenuOpen(false));
    window.addEventListener('pageshow', () => setMenuOpen(false));
    setMenuOpen(false);

    // ===== Навбар + кнопка «Наверх» =====
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
    });

    // Страницы со светлой шапкой помечают <body data-navbar="light">
    if (document.body.dataset.navbar === 'light') {
        navbar.classList.add('navbar--light');
    }

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Подсветка текущего раздела в меню =====
    // Работает только там, где меню ведёт на якоря этой же страницы.
    (function () {
        const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;

        const sectionToLink = new Map();
        links.forEach(link => {
            const section = document.getElementById(link.getAttribute('href').slice(1));
            if (section) sectionToLink.set(section, link);
        });
        if (!sectionToLink.size) return;

        function setActive(activeLink) {
            links.forEach(link => link.classList.toggle('nav-link-active', link === activeLink));
        }

        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActive(sectionToLink.get(visible.target));
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        sectionToLink.forEach((_, section) => observer.observe(section));
    })();

    // ===== Плавная прокрутка =====
    // Смещение под фиксированной шапкой задано через scroll-margin-top в base.css;
    // scrollIntoView использует его так же, как обычный межстраничный hash-переход.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
