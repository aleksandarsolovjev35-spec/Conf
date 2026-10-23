(function () {
    'use strict';

    const TITLE_PATTERN = /(micropack|микропак|регистрация на конференцию)/i;
    const MAX_TITLE_LENGTH = 90;
    const WATCH_TIMEOUT = 20000;

    const scope = document.getElementById('registration');
    if (!scope) {
        return;
    }

    const ownHeader = document.querySelector('.reg-content .section-header');

    const PROTECTED_TAGS = new Set([
        'SCRIPT',
        'STYLE',
        'LINK',
        'INPUT',
        'TEXTAREA',
        'SELECT',
        'BUTTON',
        'IFRAME',
        'FORM'
    ]);

    function normalizeText(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function hasFormControls(el) {
        return Boolean(el.querySelector('input, textarea, select, button, form, iframe'));
    }

    function isTitleCandidate(el) {
        if (
            el.hasAttribute('data-nmst-covered') ||
            PROTECTED_TAGS.has(el.tagName) ||
            Boolean(ownHeader && ownHeader.contains(el)) ||
            Boolean(el.closest('.section-header')) ||
            hasFormControls(el)
        ) {
            return false;
        }

        const text = normalizeText(el.textContent);
        return Boolean(text && text.length <= MAX_TITLE_LENGTH && TITLE_PATTERN.test(text));
    }

    function getDepth(el) {
        let level = 0;
        let node = el;
        while ((node = node.parentElement) && node !== scope) {
            level += 1;
        }
        return level;
    }

    function hideDuplicateTitle() {
        const candidates = Array.from(scope.querySelectorAll('*')).filter(isTitleCandidate);
        if (!candidates.length) {
            return false;
        }

        let title = candidates[0];
        for (const el of candidates) {
            if (getDepth(el) > getDepth(title)) {
                title = el;
            }
        }

        let block = title;
        while (block.parentElement && block !== scope) {
            const parent = block.parentElement;
            if (normalizeText(parent.textContent) !== normalizeText(title.textContent)) {
                break;
            }
            block = parent;
        }

        block.setAttribute('data-nmst-covered', '');
        block.style.setProperty('display', 'none', 'important');
        scope.classList.add('reg-restyled');
        return true;
    }

    if (hideDuplicateTitle()) {
        return;
    }

    let scheduled = false;
    const observer = new MutationObserver(function () {
        if (scheduled) {
            return;
        }
        scheduled = true;
        window.requestAnimationFrame(function () {
            scheduled = false;
            if (hideDuplicateTitle()) {
                observer.disconnect();
            }
        });
    });

    observer.observe(scope, { childList: true, subtree: true });
    window.setTimeout(function () {
        observer.disconnect();
    }, WATCH_TIMEOUT);
})();
