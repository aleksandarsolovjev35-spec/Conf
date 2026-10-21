/* =============================================================
   REGISTRATION — перекрытие собственного заголовка формы Битрикс24.

   Что скрываем: надпись «Регистрация на конференцию Micropack».
   В форме она приходит не шапкой, а label'ом секции
   (поле section_5869203, type: layout), поэтому у неё нет ни класса
   .b24-form-header, ни тега заголовка — искать нужно по тексту.

   Где ищем: по всему документу, а не только внутри #regForm.
   Битрикс24 вставляет форму рядом со скриптом-загрузчиком, и позиция
   контейнера зависит от версии app.js — привязка к #regForm ломается.

   Правка шаблона в bo.miet.ru не нужна: надпись перекрывается нашим
   заголовком раздела, а сама она скрывается здесь.
============================================================= */

(function () {
    // Что считаем перекрываемой надписью
    const TITLE_PATTERN = /(micropack|микропак|регистрация на конференцию)/i;
    const MAX_TITLE_LENGTH = 90;
    const WATCH_TIMEOUT = 20000; // форма подгружается асинхронно

    // Свой заголовок раздела — его не трогаем (лежит вне формы)
    const ownHeader = document.querySelector('.reg-content .section-header');

    // Скрывать имеет смысл только внутри блока регистрации
    const scope = document.getElementById('registration');
    if (!scope) return;

    function norm(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function isInsideOwnHeader(el) {
        return Boolean(ownHeader && ownHeader.contains(el));
    }

    function hasFields(el) {
        return Boolean(el.querySelector('input, textarea, select, button, form, iframe'));
    }

    function isProtectedTag(el) {
        return ['SCRIPT', 'STYLE', 'LINK', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'IFRAME', 'FORM']
            .includes(el.tagName);
    }

    function isTitleCandidate(el) {
        if (el.hasAttribute('data-nmst-covered')) return false; // уже скрыт
        if (isProtectedTag(el)) return false;
        if (isInsideOwnHeader(el)) return false;
        if (el.closest('.section-header')) return false;
        if (hasFields(el)) return false; // это контейнер с полями, а не надпись

        const text = norm(el.textContent);
        if (!text || text.length > MAX_TITLE_LENGTH) return false;
        return TITLE_PATTERN.test(text);
    }

    function depth(el) {
        let level = 0;
        let node = el;
        while ((node = node.parentElement) && node !== scope) level++;
        return level;
    }

    function hideTitle() {
        const candidates = Array.from(scope.querySelectorAll('*')).filter(isTitleCandidate);
        if (!candidates.length) return false;

        // Самый глубокий подходящий элемент — это сама надпись,
        // всё выше — только обёртки.
        let title = candidates[0];
        for (const el of candidates) {
            if (depth(el) > depth(title)) title = el;
        }

        // Поднимаемся по обёрткам, внутри которых нет ничего, кроме
        // этой надписи: исчезает и текст, и его отступы.
        let block = title;
        while (block.parentElement && block !== scope) {
            const parent = block.parentElement;
            if (norm(parent.textContent) !== norm(title.textContent)) break;
            block = parent;
        }

        block.setAttribute('data-nmst-covered', '');
        block.style.setProperty('display', 'none', 'important');
        scope.classList.add('reg-restyled');
        return true;
    }

    if (hideTitle()) return;

    // Форма ещё не отрисована — ждём её появления
    let scheduled = false;
    const observer = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(function () {
            scheduled = false;
            if (hideTitle()) observer.disconnect();
        });
    });

    observer.observe(scope, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); }, WATCH_TIMEOUT);
})();
