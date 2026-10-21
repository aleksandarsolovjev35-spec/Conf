/* =============================================================
   VIDEO — превью видеоролика на главной (п. 15).
   Плеер подгружается только по клику: до этого страница не тянет
   сторонние скрипты и iframe. Пока ссылки нет (data-video-url пуст),
   кнопка недоступна и подпись честно сообщает, что ролик будет позже.

   Использование: <div class="video-teaser" data-video-url="https://...">
============================================================= */

(function () {
    const teaser = document.getElementById('videoTeaser');
    if (!teaser) return;

    const playBtn = document.getElementById('videoPlay');
    const hint = document.getElementById('videoHint');
    const url = (teaser.dataset.videoUrl || '').trim();

    if (!url) return; // ссылки пока нет — оставляем статичное превью

    // Ссылка есть: кнопка становится рабочей
    playBtn.removeAttribute('aria-disabled');
    if (hint) hint.textContent = 'Нажмите, чтобы посмотреть';

    playBtn.addEventListener('click', function () {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = teaser.dataset.videoTitle || 'Видеоролик о конференции';
        iframe.className = 'video-teaser-frame';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'eager';

        teaser.innerHTML = '';
        teaser.classList.add('is-playing');
        teaser.appendChild(iframe);
        iframe.focus();
    }, { once: true });
})();
