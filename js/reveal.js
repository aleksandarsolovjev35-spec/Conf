(function () {
    'use strict';

    window.initReveal = function initReveal(selector, onReveal) {
        const targets = document.querySelectorAll(selector);
        if (!targets.length) {
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!('IntersectionObserver' in window) || reduceMotion) {
            targets.forEach(function (el) {
                el.classList.add('animate-target', 'animate-in');
                if (onReveal) {
                    onReveal(el, true);
                }
            });
            return;
        }

        const REVEAL_INTERVAL = 130;
        const revealGroups = new Map();

        function getRevealGroup(el) {
            const key = el.closest('section') || el.parentElement;
            if (!revealGroups.has(key)) {
                revealGroups.set(key, { queue: [], timer: null });
            }
            return revealGroups.get(key);
        }

        function scheduleReveal(group) {
            if (group.timer) {
                return;
            }

            group.timer = setInterval(function () {
                while (group.queue.length && group.queue[0].getBoundingClientRect().bottom < 0) {
                    const flushed = group.queue.shift();
                    flushed.classList.add('animate-in');
                    if (onReveal) {
                        onReveal(flushed, true);
                    }
                }

                const el = group.queue.shift();
                if (el) {
                    el.classList.add('animate-in');
                    if (onReveal) {
                        onReveal(el, false);
                    }
                }

                if (!group.queue.length) {
                    clearInterval(group.timer);
                    group.timer = null;
                }
            }, REVEAL_INTERVAL);
        }

        const observer = new IntersectionObserver(function (entries) {
            const touched = new Set();

            entries
                .filter(function (entry) { return entry.isIntersecting; })
                .sort(function (a, b) {
                    const pos = a.target.compareDocumentPosition(b.target);
                    return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
                })
                .forEach(function (entry) {
                    observer.unobserve(entry.target);
                    const group = getRevealGroup(entry.target);
                    if (!group.queue.includes(entry.target)) {
                        group.queue.push(entry.target);
                        touched.add(group);
                    }
                });

            touched.forEach(scheduleReveal);
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        targets.forEach(function (el) {
            el.classList.add('animate-target');
            observer.observe(el);
        });

        setTimeout(function () {
            targets.forEach(function (el) {
                if (el.classList.contains('animate-in')) {
                    return;
                }
                observer.unobserve(el);
                el.classList.add('animate-in');
                if (onReveal) {
                    onReveal(el, true);
                }
            });
        }, 2500);
    };
})();
