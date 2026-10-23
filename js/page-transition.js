(function () {
    'use strict';

    const overlay = document.getElementById('pageTransition');
    if (!overlay) {
        return;
    }

    const supportsNativeViewTransitions = 'onpagereveal' in window;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sessionStorage.getItem('page-transition') === '1') {
        sessionStorage.removeItem('page-transition');
        if (!supportsNativeViewTransitions && !reduceMotion) {
            overlay.classList.add('is-cover');
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    overlay.classList.remove('is-cover');
                });
            });
        }
    }

    if (supportsNativeViewTransitions || reduceMotion) {
        return;
    }

    document.querySelectorAll('a[href]').forEach(function (link) {
        const url = new URL(link.getAttribute('href'), window.location.href);
        const isOtherPage =
            url.origin === window.location.origin &&
            url.pathname !== window.location.pathname &&
            !link.hasAttribute('download');

        if (!isOtherPage) {
            return;
        }

        link.addEventListener('click', function (event) {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                (link.target && link.target !== '_self')
            ) {
                return;
            }

            event.preventDefault();
            sessionStorage.setItem('page-transition', '1');
            overlay.classList.add('is-cover');
            setTimeout(function () {
                window.location.href = url.href;
            }, 330);
        });
    });

    window.addEventListener('pageshow', function () {
        overlay.classList.remove('is-cover');
    });
})();
