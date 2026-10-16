/* =============================================================
   PHOTOBANK — логика страницы фотобанка (photos.html):
   запуск анимаций появления (reveal.js), поиск и фильтры альбомов,
   открытие альбома с мозаикой и большой просмотр фото (лайтбокс).
   Требует common.js и reveal.js выше.
============================================================= */

    // Появление элементов фотобанка по одному внутри секции.
    // Панель поиска и фильтров (.photobank-toolbar) — без анимации, она статична.
    initReveal('section h2, .album-card');

    // ===== Поиск и фильтр альбомов =====
    const searchInput = document.getElementById('albumSearch');
    const chips       = document.querySelectorAll('.filter-chip');
    const cards       = document.querySelectorAll('.album-card');
    const emptyNote   = document.getElementById('albumEmpty');
    const albumCount  = document.getElementById('albumCount');
    let activeFilter  = 'all';

    function pluralAlbums(n) {
        if (n === 1) return '1 альбом';
        if (n >= 2 && n <= 4) return n + ' альбома';
        return n + ' альбомов';
    }

    function applyFilter() {
        const query = searchInput.value.trim().toLowerCase();
        let visible = 0;

        cards.forEach(card => {
            const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
            const matchesQuery    = !query || card.dataset.title.toLowerCase().includes(query);
            const show = matchesCategory && matchesQuery;
            card.hidden = !show;
            if (show) visible++;
        });

        emptyNote.hidden = visible !== 0;
        albumCount.textContent = pluralAlbums(visible);
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');
            activeFilter = chip.dataset.filter;
            applyFilter();
        });
    });

    searchInput.addEventListener('input', applyFilter);

    // ===== Альбомы: мозаика фотографий-заглушек и большой просмотр =====
    // Данные альбомов. Когда появятся настоящие фото — сюда же можно
    // будет добавить адреса файлов, а подписи останутся прежними.
    const ALBUMS = {
        opening: {
            title: 'Торжественное открытие конференции',
            scenes: ['Торжественное открытие', 'Приветственное слово', 'Ведущий конференции',
                     'Гости в зале', 'Речь организаторов', 'Участники конференции',
                     'Первый доклад', 'Аплодисменты', 'Панорама зала', 'Открытие конференции']
        },
        plenary: {
            title: 'Пленарные доклады',
            scenes: ['Открытие докладов', 'Докладчик у трибуны', 'Слушатели в зале',
                     'Вопрос из зала', 'Выступление спикера', 'Презентация на экране',
                     'Обсуждение доклада', 'Зал конференции', 'Докладчик крупным планом',
                     'Вопросы спикеру', 'Аплодисменты', 'Панорама зала']
        },
        sections: {
            title: 'Секционные доклады',
            scenes: ['Секция корпусирования', 'Доклад о микросборке', 'Трёхмерная сборка',
                     'МЭМС-технологии', 'Вопросы докладчику', 'Обсуждение доклада',
                     'Секция новых материалов', 'Силовая электроника', 'Слушатели секции',
                     'Презентация результатов', 'Дискуссия', 'Завершение секции']
        },
        poster: {
            title: 'Стендовая сессия и постерные доклады',
            scenes: ['Стендовая сессия', 'Постерные доклады', 'Обсуждение у стенда',
                     'Автор у постера', 'Вопросы автору', 'Участники сессии',
                     'Обзор стендов', 'Научная дискуссия', 'Детали доклада', 'Общее фото сессии']
        },
        guests: {
            title: 'Гости конференции и общение',
            scenes: ['Гости конференции', 'Общение участников', 'Кофе-брейк',
                     'Знакомство коллег', 'Обмен контактами', 'Неформальная беседа',
                     'Участники у стендов', 'Общее общение']
        },
        closing: {
            title: 'Подведение итогов и закрытие конференции',
            scenes: ['Подведение итогов', 'Заключительное слово', 'Вручение сертификатов',
                     'Благодарность участникам', 'Финальный доклад', 'Аплодисменты',
                     'Общее фото участников', 'Закрытие конференции']
        }
    };
    // ритм мозаики: широкие и высокие плитки чередуются с обычными
    const MOSAIC_PATTERN = ['photo-thumb--wide', '', '', 'photo-thumb--tall', '', 'photo-thumb--wide', '', '', 'photo-thumb--tall', '', '', 'photo-thumb--wide'];
    const CAMERA_ICON = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

    const albumView    = document.getElementById('albumView');
    const albumTitleEl = document.getElementById('albumViewTitle');
    const mosaic       = document.getElementById('photoMosaic');
    const albumCards   = Array.from(document.querySelectorAll('[data-album]'));
    let currentAlbumKey = null;
    let currentScenes   = [];
    let lastOpenedCard  = null;

    // блоки списка альбомов, которые прячем при открытом альбоме
    const listBlocks = [
        document.querySelector('.photobank-toolbar'),
        document.getElementById('albumGrid'),
        document.getElementById('albumEmpty'),
    ];

    function pluralPhotos(n) {
        if (n === 1) return '1 фото';
        if (n >= 2 && n <= 4) return n + ' фото';
        return n + ' фото';
    }

    let mosaicTimers = [];
    function buildMosaic(key) {
        const album = ALBUMS[key];
        currentScenes = album.scenes;
        albumTitleEl.textContent = album.title;
        document.getElementById('albumViewCount').textContent = pluralPhotos(currentScenes.length);
        mosaic.innerHTML = '';
        mosaicTimers.forEach(clearTimeout);
        mosaicTimers = [];
        currentScenes.forEach((name, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = ('photo-thumb ' + MOSAIC_PATTERN[i % MOSAIC_PATTERN.length]).trim();
            b.setAttribute('aria-label', 'Открыть фото ' + (i + 1) + ': ' + name);
            b.innerHTML = CAMERA_ICON +
                '<span class="photo-thumb-num">Фото ' + (i + 1) + '</span>' +
                '<span class="photo-thumb-name">' + name + '</span>' +
                '<span class="photo-thumb-tag">Заглушка</span>';
            b.addEventListener('click', () => openLightbox(i));
            mosaic.appendChild(b);
            // появление строго по одному
            mosaicTimers.push(setTimeout(() => b.classList.add('is-visible'), 90 * i));
        });
    }

    function openAlbum(key, pushHash) {
        if (!ALBUMS[key]) return;
        currentAlbumKey = key;
        lastOpenedCard = document.querySelector('[data-album="' + key + '"]');
        buildMosaic(key);
        listBlocks.forEach(el => { if (el) el.hidden = true; });
        albumView.hidden = false;
        // переносим пользователя вниз — к содержимому открытого альбома (мозаике)
        requestAnimationFrame(() => {
            albumView.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        if (pushHash) history.replaceState(null, '', '#album/' + key);
    }

    function closeAlbum() {
        albumView.hidden = true;
        closeLightbox();
        currentAlbumKey = null;
        listBlocks.forEach(el => { if (el) el.hidden = false; });
        applyFilter();
        history.replaceState(null, '', location.pathname);
        if (lastOpenedCard) lastOpenedCard.focus();
    }

    albumCards.forEach(card => {
        card.addEventListener('click', () => openAlbum(card.dataset.album, true));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAlbum(card.dataset.album, true); }
        });
    });
    document.getElementById('albumViewBack').addEventListener('click', closeAlbum);

    // ----- Лайтбокс -----
    const lightbox        = document.getElementById('lightbox');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    let currentPhoto = 0;
    let lastFocused = null;

    function renderLightbox() {
        const album = ALBUMS[currentAlbumKey];
        lightboxCaption.textContent = (album ? album.title : 'Фотобанк') + ' — ' + currentScenes[currentPhoto];
        lightboxCounter.textContent = (currentPhoto + 1) + ' / ' + currentScenes.length;
    }

    function openLightbox(i) {
        currentPhoto = i;
        lastFocused = document.activeElement;
        renderLightbox();
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        document.getElementById('lightboxClose').focus();
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        if (lastFocused) lastFocused.focus();
    }

    function stepLightbox(d) {
        if (!currentScenes.length) return;
        currentPhoto = (currentPhoto + d + currentScenes.length) % currentScenes.length;
        renderLightbox();
    }

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => stepLightbox(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });

    // глубокая ссылка photos.html#album/<ключ> — открыть альбом сразу
    if (location.hash.startsWith('#album/')) {
        openAlbum(location.hash.slice('#album/'.length), false);
    }
