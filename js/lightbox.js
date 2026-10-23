(function () {
    'use strict';

    window.createLightbox = function createLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxPhoto = document.getElementById('lightboxPhoto');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxCounter = document.getElementById('lightboxCounter');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');

        if (!lightbox || !lightboxPhoto) {
            return {
                open: function () {},
                close: function () {},
                isOpen: function () { return false; }
            };
        }

        let items = [];
        let currentIndex = 0;
        let lightboxTrigger = null;
        let lightboxImg = null;

        function ensureLightboxImage() {
            if (!lightboxImg) {
                lightboxPhoto.innerHTML = '';
                lightboxImg = document.createElement('img');
                lightboxImg.className = 'lightbox-img';
                lightboxImg.decoding = 'async';
                lightboxImg.draggable = false;
                lightboxPhoto.appendChild(lightboxImg);
            }
            return lightboxImg;
        }

        function preloadNeighbor(targetIndex) {
            if (!items.length) {
                return;
            }
            const target = items[(targetIndex + items.length) % items.length];
            if (!target) {
                return;
            }
            const pre = new Image();
            pre.decoding = 'async';
            pre.src = target.full;
        }

        function render() {
            const item = items[currentIndex];
            if (!item) {
                return;
            }

            const img = ensureLightboxImage();
            img.src = item.full;
            img.alt = item.caption;

            if (lightboxCaption) {
                lightboxCaption.textContent = item.caption;
            }
            if (lightboxCounter) {
                lightboxCounter.textContent = (currentIndex + 1) + ' / ' + items.length;
            }

            preloadNeighbor(currentIndex + 1);
            preloadNeighbor(currentIndex - 1);
        }

        function open(albumItems, index, trigger) {
            if (!Array.isArray(albumItems) || !albumItems.length) {
                return;
            }

            items = albumItems;
            currentIndex = (index + items.length) % items.length;
            lightboxTrigger = trigger || null;

            render();
            lightbox.hidden = false;
            document.body.classList.add('lightbox-open');

            if (lightboxClose) {
                lightboxClose.focus();
            }
        }

        function close() {
            if (lightbox.hidden) {
                return;
            }

            lightbox.hidden = true;
            document.body.classList.remove('lightbox-open');

            if (lightboxTrigger && typeof lightboxTrigger.focus === 'function') {
                lightboxTrigger.focus();
            }
        }

        function step(delta) {
            if (!items.length) {
                return;
            }
            currentIndex = (currentIndex + delta + items.length) % items.length;
            render();
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', close);
        }
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function () {
                step(-1);
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', function () {
                step(1);
            });
        }

        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) {
                close();
            }
        });

        let touchStartX = null;

        lightbox.addEventListener('touchstart', function (event) {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (event) {
            if (touchStartX === null) {
                return;
            }
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) {
                step(deltaX < 0 ? 1 : -1);
            }
            touchStartX = null;
        }, { passive: true });

        document.addEventListener('keydown', function (event) {
            if (lightbox.hidden) {
                return;
            }
            if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowLeft') {
                step(-1);
            } else if (event.key === 'ArrowRight') {
                step(1);
            }
        });

        return {
            open: open,
            close: close,
            isOpen: function () {
                return !lightbox.hidden;
            }
        };
    };
})();
