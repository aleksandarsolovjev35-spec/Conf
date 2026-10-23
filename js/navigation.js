(function () {
    'use strict';

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const scrollTopBtn = document.getElementById('scrollTop');

    if (navbar && document.body.dataset.navbar === 'light') {
        navbar.classList.add('navbar--light');
    }

    function syncScrollControls() {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
        }
    }

    window.addEventListener('scroll', syncScrollControls, { passive: true });
    syncScrollControls();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (navbar && navToggle && navLinks) {
        const mobileNav = window.matchMedia('(max-width: 1024px)');

        function setMenuOpen(isOpen, restoreFocus) {
            const open = Boolean(isOpen && mobileNav.matches);
            navLinks.classList.toggle('active', open);
            navToggle.classList.toggle('active', open);
            document.body.classList.toggle('nav-open', open);
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
            navLinks.inert = mobileNav.matches && !open;
            if (restoreFocus) {
                navToggle.focus();
            }
        }

        navToggle.addEventListener('click', function () {
            setMenuOpen(!navLinks.classList.contains('active'), false);
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuOpen(false, false);
            });
        });

        document.addEventListener('click', function (event) {
            if (!navbar.contains(event.target)) {
                setMenuOpen(false, false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (!navLinks.classList.contains('active')) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setMenuOpen(false, true);
                return;
            }

            if (event.key === 'Tab') {
                const lastLink = navLinks.querySelector('li:last-child a');
                if (!lastLink) {
                    return;
                }
                if (event.shiftKey && document.activeElement === navToggle) {
                    event.preventDefault();
                    lastLink.focus();
                } else if (!event.shiftKey && document.activeElement === lastLink) {
                    event.preventDefault();
                    navToggle.focus();
                }
            }
        });

        mobileNav.addEventListener('change', function () {
            setMenuOpen(false, false);
        });
        window.addEventListener('pageshow', function () {
            setMenuOpen(false, false);
        });
        setMenuOpen(false, false);
    }

    const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (sectionLinks.length && 'IntersectionObserver' in window) {
        const sectionToLink = new Map();
        sectionLinks.forEach(function (link) {
            const sectionId = link.getAttribute('href').slice(1);
            const section = sectionId ? document.getElementById(sectionId) : null;
            if (section) {
                sectionToLink.set(section, link);
            }
        });

        if (sectionToLink.size) {
            const spyObserver = new IntersectionObserver(function (entries) {
                const visible = entries
                    .filter(function (entry) { return entry.isIntersecting; })
                    .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];

                if (!visible) {
                    return;
                }

                const activeLink = sectionToLink.get(visible.target);
                sectionLinks.forEach(function (link) {
                    link.classList.toggle('nav-link-active', link === activeLink);
                });
            }, {
                rootMargin: '-45% 0px -45% 0px',
                threshold: 0
            });

            sectionToLink.forEach(function (_, section) {
                spyObserver.observe(section);
            });
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();
