(function () {
    'use strict';

    const teaser = document.getElementById('videoTeaser');
    if (!teaser) {
        return;
    }

    const playBtn = document.getElementById('videoPlay');
    const hint = document.getElementById('videoHint');
    const url = (teaser.dataset.videoUrl || '').trim();

    if (!url) {
        if (playBtn) {
            playBtn.setAttribute('aria-disabled', 'true');
        }
        if (hint) {
            hint.textContent = 'Ролик появится после публикации';
        }
        return;
    }

    if (playBtn) {
        playBtn.removeAttribute('aria-disabled');
    }
    if (hint) {
        hint.textContent = 'Нажмите, чтобы посмотреть';
    }

    let started = false;

    function startVideo() {
        if (started) {
            return;
        }
        started = true;

        const iframe = document.createElement('iframe');
        iframe.width = '720';
        iframe.height = '405';
        iframe.src = url;
        iframe.title = teaser.dataset.videoTitle || 'Видеоролик о конференции';
        iframe.className = 'video-teaser-frame';
        iframe.allow = 'clipboard-write; autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('webkitAllowFullScreen', '');
        iframe.setAttribute('mozallowfullscreen', '');
        iframe.loading = 'eager';

        function onPlayerMessage(event) {
            if (!iframe.contentWindow || event.source !== iframe.contentWindow) {
                return;
            }
            try {
                const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (msg && msg.type === 'player:ready') {
                    window.removeEventListener('message', onPlayerMessage);
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ type: 'player:play', data: {} }),
                        'https://rutube.ru'
                    );
                }
            } catch (_) {
            }
        }

        window.addEventListener('message', onPlayerMessage);

        teaser.innerHTML = '';
        teaser.classList.add('is-playing');
        teaser.appendChild(iframe);
        iframe.focus();
    }

    teaser.addEventListener('click', startVideo);
})();
