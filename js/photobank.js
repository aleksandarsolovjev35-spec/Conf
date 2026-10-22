    initReveal('.album-card');

    function photo(folder, file, caption, featured = false) {
        const rel = folder ? folder + '/' + file : file;
        return {
            thumb: 'Photos/thumbs/' + rel,
            full: 'Photos/' + rel,
            caption,
            featured,
        };
    }

    const ALBUMS = {
        opening: {
            title: 'Торжественное открытие конференции',
            items: [
                photo('Opening', 'IMG_5950.webp', 'Торжественное открытие конференции в НИУ МИЭТ', true),
                photo('Opening', 'IMG_5945.webp', 'Приветственное слово председателя оргкомитета С. П. Тимошенкова'),
                photo('Opening', 'IMG_5965.webp', 'Приветствие участников и партнёров конференции'),
                photo('Opening', 'IMG_5967.webp', 'Выступление на открытии конференции'),
                photo('Opening', 'IMG_6006.webp', 'Работа президиума пленарного заседания', true),
                photo('Opening', 'IMG_6026.webp', 'Вступительная часть утреннего заседания'),
            ],
        },
        speakers: {
            title: 'Пленарные и секционные доклады',
            items: [
                photo('Speakers', 'IMG_6210.webp', 'Выступление с докладом в главной аудитории конференции', true),
                photo('Speakers', 'IMG_6058.webp', 'Доклад на утренней сессии'),
                photo('Speakers', 'IMG_6068.webp', 'Ответы докладчика на вопросы из зала'),
                photo('Speakers', 'IMG_6075.webp', 'Доклад и дискуссия с президиумом'),
                photo('Speakers', 'IMG_6115.webp', 'Выступление представителя индустриального партнёра'),
                photo('Speakers', 'IMG_6126.webp', 'Завершение доклада и обсуждение результатов'),
                photo('Speakers', 'IMG_6146.webp', 'Доклад председателя программного комитета Д. В. Вертянова'),
                photo('Speakers', 'IMG_6183.webp', 'Презентация разработок в области многокристальных модулей'),
                photo('Speakers', 'IMG_6191.webp', 'Доклад об интегрированном производственном комплексе'),
                photo('Speakers', 'IMG_6229.webp', 'Обсуждение технологических решений на сессии'),
                photo('Speakers', 'IMG_6418.webp', 'Доклад о методах ультразвуковой микросварки'),
                photo('Speakers', 'IMG_6428.webp', 'Выступление специалиста по сборочным процессам'),
                photo('Speakers', 'IMG_6471.webp', 'Доклад об исследовании полимерных пресс-материалов'),
                photo('Speakers', 'IMG_7341.webp', 'Доклад по технологиям точного совмещения и сборки'),
                photo('Speakers', 'IMG_7394.webp', 'Выступление спикера на дневном заседании'),
                photo('Speakers', 'IMG_7784.webp', 'Секционный доклад и профессиональная дискуссия'),
                photo('Speakers', 'IMG_7988.webp', 'Заключительные выступления докладчиков'),
            ],
        },
        stands: {
            title: 'Выставка и стендовая сессия',
            items: [
                photo('Stands', 'IMG_6475.webp', 'Выставочная экспозиция партнёров в фойе конференции', true),
                photo('Stands', 'IMG_6302.webp', 'Инженерное ПО и моделирование на стенде CADFlo'),
                photo('Stands', 'IMG_6347.webp', 'Стенд ФИЦ проблем химической физики и медицинской химии РАН'),
                photo('Stands', 'IMG_6493.webp', 'Консультации специалистов на стенде ГК «Остек»'),
                photo('Stands', 'IMG_6495.webp', 'Экспозиция технологических решений ГК «Остек»'),
                photo('Stands', 'IMG_6671.webp', 'Общение участников на стенде ООО «Совтест АТЕ»'),
                photo('Stands', 'IMG_6676.webp', 'Команда и демонстрационный стенд ООО «Совтест АТЕ»'),
                photo('Stands', 'IMG_6698.webp', 'Демонстрация САПР электроники на стенде компании «ЭРЕМЕКС»'),
                photo('Stands', 'IMG_6706.webp', 'Экспозиция Зеленоградского нанотехнологического центра (АО «ЗНТЦ»)'),
                photo('Stands', 'IMG_6879.webp', 'Демонстрация измерительного комплекса участникам конференции'),
                photo('Stands', 'IMG_6971.webp', 'Стенд ПАО «ИНЭУМ им. И. С. Брука» на выставке'),
                photo('Stands', 'IMG_7137.webp', 'Обсуждение задач теплового и физического моделирования у стенда'),
                photo('Stands', 'IMG_6477.webp', 'Панорама стендовой сессии в фойе НИУ МИЭТ'),
            ],
        },
        guests: {
            title: 'Гости конференции и общение',
            items: [
                photo('', 'IMG_7703.webp', 'Общая фотография участников конференции в атриуме НИУ МИЭТ', true),
                photo('', 'IMG_6232.webp', 'Участники заседания в лекционной аудитории', true),
                photo('', 'IMG_6256.webp', 'Профессиональное общение участников в перерыве'),
                photo('', 'IMG_6332.webp', 'Обсуждение докладов в кулуарах конференции'),
                photo('', 'IMG_6585.webp', 'Информационные материалы и сборники на стойке конференции'),
                photo('', 'IMG_6594.webp', 'Встреча коллег и обмен контактами в фойе'),
                photo('', 'IMG_6740.webp', 'Кофе-брейк и неформальное общение участников', true),
                photo('', 'IMG_6782.webp', 'Дискуссии специалистов в перерыве между сессиями'),
                photo('', 'IMG_7047.webp', 'Общение гостей конференции в выставочном холле'),
                photo('', 'IMG_7187.webp', 'Рабочее обсуждение за круглым столом в атриуме'),
                photo('', 'IMG_7493.webp', 'Слушатели дневной сессии в зале заседаний'),
                photo('', 'IMG_7705.webp', 'Участники конференции на главной лестнице МИЭТ'),
                photo('', 'IMG_7831.webp', 'Аудитория во время выступлений докладчиков'),
                photo('', 'IMG_7916.webp', 'Участники секционного заседания'),
                photo('', 'IMG_6333.webp', 'Беседа участников в зоне кофе-брейка'),
            ],
        },
    };

    const ALBUM_ALIASES = {
        plenary: 'speakers',
        sections: 'speakers',
        poster: 'stands',
        closing: 'guests',
    };

    function resolveAlbumKey(rawKey) {
        if (!rawKey) return null;
        if (ALBUMS[rawKey]) return rawKey;
        return ALBUM_ALIASES[rawKey] || null;
    }

    const searchInput     = document.getElementById('albumSearch');
    const filterChips     = document.querySelectorAll('.filter-chip');
    const albumCards      = document.querySelectorAll('.album-card');
    const emptyNotice     = document.getElementById('photobankEmpty');
    const albumCount      = document.getElementById('albumCount');
    const photoTotalCount = document.getElementById('photoTotalCount');

    let activeCategory = 'all';

    function pluralAlbums(n) {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return n + ' альбом';
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' альбома';
        return n + ' альбомов';
    }

    function albumSearchIndex(key) {
        const album = ALBUMS[key];
        if (!album) return '';
        return album.items.map(it => it.caption).join(' ').toLowerCase();
    }

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        let visible = 0;
        let photosSum = 0;

        albumCards.forEach(card => {
            const matchCat = activeCategory === 'all' || card.dataset.category === activeCategory;
            const text = card.textContent.toLowerCase() + ' ' + albumSearchIndex(card.dataset.album);
            const matchSearch = !query || text.includes(query);
            const show = matchCat && matchSearch;
            card.hidden = !show;
            if (show) {
                visible++;
                const album = ALBUMS[card.dataset.album];
                photosSum += album ? album.items.length : (Number(card.dataset.count) || 0);
            }
        });

        emptyNotice.hidden = visible > 0;
        albumCount.textContent = pluralAlbums(visible);
        if (photoTotalCount) {
            photoTotalCount.textContent = photosSum + ' фото';
        }
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');
            activeCategory = chip.dataset.filter;
            applyFilters();
        });
    });

    searchInput.addEventListener('input', applyFilters);
    applyFilters();

    const albumGrid      = document.getElementById('albumGrid');
    const toolbar        = document.querySelector('.photobank-toolbar');
    const albumView      = document.getElementById('albumView');
    const albumViewTitle = document.getElementById('albumViewTitle');
    const albumViewBack  = document.getElementById('albumViewBack');
    const photoMosaic    = document.getElementById('photoMosaic');

    const lightbox        = document.getElementById('lightbox');
    const lightboxPhoto   = document.getElementById('lightboxPhoto');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');

    let currentAlbumKey = null;
    let currentIndex = 0;
    let lightboxTrigger = null;

    function buildMosaic(key) {
        const album = ALBUMS[key];
        photoMosaic.innerHTML = '';
        if (!album) return;

        const frag = document.createDocumentFragment();
        const total = album.items.length;

        album.items.forEach((item, i) => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'photo-thumb' + (item.featured ? ' photo-thumb--featured' : '');
            tile.style.transitionDelay = Math.min(i * 30, 360) + 'ms';
            tile.setAttribute('aria-label', 'Фото ' + (i + 1) + ' из ' + total + ': ' + item.caption);

            const img = document.createElement('img');
            img.src = item.thumb;
            img.alt = item.caption;
            img.width = 800;
            img.height = 533;
            img.loading = i < 6 ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.draggable = false;

            const cap = document.createElement('span');
            cap.className = 'photo-thumb-caption';
            cap.textContent = item.caption;

            tile.appendChild(img);
            tile.appendChild(cap);
            tile.addEventListener('click', () => openLightbox(i, tile));
            frag.appendChild(tile);
        });

        photoMosaic.appendChild(frag);
        requestAnimationFrame(() => {
            photoMosaic.querySelectorAll('.photo-thumb').forEach(el => el.classList.add('is-in'));
        });
    }

    function openAlbum(rawKey, pushHash = true) {
        const key = resolveAlbumKey(rawKey);
        const album = key && ALBUMS[key];
        if (!album) return;
        currentAlbumKey = key;

        albumViewTitle.textContent = album.title;
        buildMosaic(key);

        toolbar.hidden     = true;
        albumGrid.hidden   = true;
        emptyNotice.hidden = true;
        albumView.hidden   = false;

        if (pushHash) history.replaceState(null, '', '#album/' + key);
        albumView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closeAlbum(pushHash = true) {
        currentAlbumKey  = null;
        albumView.hidden = true;
        toolbar.hidden   = false;
        albumGrid.hidden = false;
        applyFilters();
        if (pushHash) history.replaceState(null, '', location.pathname);
    }

    albumCards.forEach(card => {
        const key = card.dataset.album;
        if (!key) return;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        const titleEl = card.querySelector('.album-title');
        if (titleEl) card.setAttribute('aria-label', 'Открыть альбом «' + titleEl.textContent.trim() + '»');

        card.addEventListener('click', () => openAlbum(key));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAlbum(key);
            }
        });
    });

    albumViewBack.addEventListener('click', () => closeAlbum());

    function syncFromHash() {
        const m = location.hash.match(/^#album\/([a-z0-9_-]+)$/i);
        const key = m && resolveAlbumKey(m[1]);
        if (key) openAlbum(key, false);
        else if (currentAlbumKey) closeAlbum(false);
    }
    window.addEventListener('hashchange', syncFromHash);
    syncFromHash();

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

    function preloadNeighbor(items, idx) {
        if (!items.length) return;
        const target = items[(idx + items.length) % items.length];
        if (!target) return;
        const pre = new Image();
        pre.decoding = 'async';
        pre.src = target.full;
    }

    function renderLightbox() {
        const album = ALBUMS[currentAlbumKey];
        if (!album) return;
        const item = album.items[currentIndex];
        const img = ensureLightboxImage();

        img.src = item.full;
        img.alt = item.caption;
        lightboxCaption.textContent = item.caption;
        lightboxCounter.textContent = (currentIndex + 1) + ' / ' + album.items.length;

        preloadNeighbor(album.items, currentIndex + 1);
        preloadNeighbor(album.items, currentIndex - 1);
    }

    function openLightbox(index, trigger) {
        currentIndex = index;
        lightboxTrigger = trigger || null;
        renderLightbox();
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        if (lightboxTrigger) lightboxTrigger.focus();
    }

    function stepLightbox(delta) {
        const album = ALBUMS[currentAlbumKey];
        if (!album) return;
        currentIndex = (currentIndex + delta + album.items.length) % album.items.length;
        renderLightbox();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    lightboxNext.addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    let lbTouchX = null;
    lightbox.addEventListener('touchstart', (e) => {
        lbTouchX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        if (lbTouchX === null) return;
        const dx = e.changedTouches[0].clientX - lbTouchX;
        if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
        lbTouchX = null;
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.hidden) {
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  stepLightbox(-1);
            if (e.key === 'ArrowRight') stepLightbox(1);
        } else if (currentAlbumKey && e.key === 'Escape') {
            closeAlbum();
        }
    });
