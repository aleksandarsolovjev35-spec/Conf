/* =============================================================
   REGISTRATION — перекрытие заголовка встроенной формы Битрикс24.

   Форма inline/126/jm15vu приходит со своим заголовком
   «Регистрация на конференцию Micropack». Правка шаблона в
   личном кабинете bo.miet.ru нам не нужна: скрипт находит этот
   заголовок по тексту и скрывает его вместе с обёрткой, поэтому
   на странице остаётся только наш заголовок раздела.

   Почему по тексту, а не по классам: классы зависят от версии
   и шаблона формы, а текст — нет. Дополнительно к этому в
   css/registration.css есть правила для известных классов,
   так что заголовок скрывается даже без JavaScript.
============================================================= */

(function () {
    const form = document.getElementById('regForm');
    if (!form) return;

    // Что считаем заголовком формы
    const TITLE_PATTERN = /(micropack|микропак|регистрация на конференцию)/i;
    const MAX_TITLE_LENGTH = 90;
    const WATCH_TIMEOUT = 20000; // форма подгружается асинхронно

    // Свой заголовок раздела ищем снаружи карточки — его не трогаем
    const ownHeader = document.querySelector('.reg-content .section-header');

    function norm(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function isInsideOwnHeader(el) {
        return Boolean(ownHeader && ownHeader.contains(el));
    }

    function hasFields(el) {
        return Boolean(el.querySelector('input, textarea, select, button, form'));
    }

    function isTitleCandidate(el) {
        if (el.hasAttribute('data-nmst-covered')) return false; // уже скрыт
        if (isInsideOwnHeader(el)) return false;

        const tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') return false;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return false;
        if (hasFields(el)) return false; // это контейнер с полями, а не заголовок

        const text = norm(el.textContent);
        if (!text || text.length > MAX_TITLE_LENGTH) return false;
        return TITLE_PATTERN.test(text);
    }

    function depth(el) {
        let level = 0;
        let node = el;
        while ((node = node.parentElement) && node !== form) level++;
        return level;
    }

    function hideTitle() {
        const candidates = Array.from(form.querySelectorAll('*')).filter(isTitleCandidate);
        if (!candidates.length) return false;

        // Самый глубокий подходящий элемент — это само название,
        // всё выше — только обёртки.
        let title = candidates[0];
        for (const el of candidates) {
            if (depth(el) > depth(title)) title = el;
        }

        // Поднимаемся по обёрткам, внутри которых нет ничего, кроме
        // названия: так исчезает и сам заголовок, и его отступы.
        let block = title;
        while (block.parentElement && block.parentElement !== form) {
            const parent = block.parentElement;
            if (norm(parent.textContent) !== norm(title.textContent)) break;
            block = parent;
        }

        block.setAttribute('data-nmst-covered', '');
        block.style.setProperty('display', 'none', 'important');
        form.classList.add('reg-form--title-replaced');
        return true;
    }

    if (hideTitle()) return;

    // Форма ещё не отрисована — ждём её появления
    const observer = new MutationObserver(function () {
        if (hideTitle()) observer.disconnect();
    });

    observer.observe(form, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); }, WATCH_TIMEOUT);
})();
