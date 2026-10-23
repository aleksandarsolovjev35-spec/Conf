(function () {
    'use strict';

    const IMAGE_SELECTOR = 'img, picture, svg, canvas';

    function isImageTarget(target) {
        const element = target instanceof Element ? target : target && target.parentElement;
        return Boolean(element && element.closest(IMAGE_SELECTOR));
    }

    function lockImages(root) {
        if (!root || !root.querySelectorAll) {
            return;
        }
        root.querySelectorAll('img').forEach(function (image) {
            image.draggable = false;
        });
    }

    lockImages(document);

    ['contextmenu', 'dragstart'].forEach(function (eventType) {
        document.addEventListener(eventType, function (event) {
            if (isImageTarget(event.target)) {
                event.preventDefault();
            }
        }, true);
    });

    document.addEventListener('copy', function (event) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return;
        }

        const images = document.querySelectorAll(IMAGE_SELECTOR);
        for (let i = 0; i < selection.rangeCount; i += 1) {
            const range = selection.getRangeAt(i);
            for (const image of images) {
                try {
                    if (range.intersectsNode(image)) {
                        event.preventDefault();
                        return;
                    }
                } catch (_) {
                }
            }
        }
    }, true);

    if ('MutationObserver' in window && document.documentElement) {
        new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) {
                        return;
                    }
                    if (node.tagName === 'IMG') {
                        node.draggable = false;
                    } else {
                        lockImages(node);
                    }
                });
            });
        }).observe(document.documentElement, { childList: true, subtree: true });
    }
})();
