/* =============================================================
   REVEAL — поочерёдное появление элементов внутри каждой секции.
   У каждой секции своя очередь: переход по меню в дальний раздел
   не ждёт анимацию блоков выше. Классы .animate-* — animations.css.
   Использование: initReveal('селекторы', (el, instant) => {...})
============================================================= */

function initReveal(selector, onReveal) {
        const REVEAL_INTERVAL = 130; // мс между соседними элементами одной секции
        const revealGroups = new Map(); // секция -> { queue: [], timer: null }

        function getRevealGroup(el) {
            const key = el.closest('section') || el.parentElement;
            if (!revealGroups.has(key)) {
                revealGroups.set(key, { queue: [], timer: null });
            }
            return revealGroups.get(key);
        }

        function scheduleReveal(group) {
            if (group.timer) return;
            group.timer = setInterval(() => {
                // элементы выше экрана не должны тормозить очередь — показываем сразу
                while (group.queue.length && group.queue[0].getBoundingClientRect().bottom < 0) {
                    const flushed = group.queue.shift();
                    flushed.classList.add('animate-in');
                    if (onReveal) onReveal(flushed, true);
                }
                const el = group.queue.shift();
                if (el) {
                    el.classList.add('animate-in');
                    if (onReveal) onReveal(el, false);
                }
                if (!group.queue.length) {
                    clearInterval(group.timer);
                    group.timer = null;
                }
            }, REVEAL_INTERVAL);
        }

        const observer = new IntersectionObserver((entries) => {
            const touched = new Set();
            entries
                .filter(entry => entry.isIntersecting)
                // порядок в документе — сверху вниз, слева направо
                .sort((a, b) => {
                    const pos = a.target.compareDocumentPosition(b.target);
                    return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
                })
                .forEach(entry => {
                    observer.unobserve(entry.target);
                    const group = getRevealGroup(entry.target);
                    if (!group.queue.includes(entry.target)) {
                        group.queue.push(entry.target);
                        touched.add(group);
                    }
                });
            touched.forEach(scheduleReveal);
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const targets = document.querySelectorAll(selector);
    targets.forEach(el => {
        el.classList.add('animate-target');
        observer.observe(el);
    });

    // Страховка: если IntersectionObserver не сработал (ошибка JS,
    // встроенный браузер, печать), через 2.5 с показываем всё, что
    // осталось скрытым. Контент никогда не должен пропадать.
    setTimeout(() => {
        targets.forEach(el => {
            if (el.classList.contains('animate-in')) return;
            observer.unobserve(el);
            el.classList.add('animate-in');
            if (onReveal) onReveal(el, true);
        });
    }, 2500);
}
