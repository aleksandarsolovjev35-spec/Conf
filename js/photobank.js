(function () {
    'use strict';

    const ALBUMS = window.PHOTOBANK_ALBUMS || {};
    const ALBUM_ALIASES = window.PHOTOBANK_ALIASES || {};

    const searchInput = document.getElementById('albumSearch');
    const filterChips = document.querySelectorAll('.filter-chip');
    const albumCards = document.querySelectorAll('.album-card');
    const emptyNotice = document.getElementById('photobankEmpty');
    const albumCount = document.getElementById('albumCount');
    const photoTotalCount = document.getElementById('photoTotalCount');

    const albumGrid = document.getElementById('albumGrid');
    const toolbar = document.querySelector('.photobank-toolbar');
    const albumView = document.getElementById('albumView');
    const albumViewTitle = document.getElementById('albumViewTitle');
    const albumViewBack = document.getElementById('albumViewBack');
    const photoMosaic = document.getElementById('photoMosaic');

    const lightbox = typeof window.createLightbox === 'function'
        ? window.createLightbox()
        : null;

    let activeCategory = 'all';
    let currentAlbumKey = null;

    if (typeof window.initReveal === 'function') {
        window.initReveal('.album-card');
    }

    function resolveAlbumKey(rawKey) {
        if (!rawKey) {
            return null;
        }
        if (ALBUMS[rawKey]) {
            return rawKey;
        }
        return ALBUM_ALIASES[rawKey] || null;
    }

    function pluralAlbums(count) {
        const m10 = count % 10;
        const m100 = count % 100;
        if (m10 === 1 && m100 !== 11) {
            return count + ' альбом';
        }
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) {
            return count + ' альбома';
        }
        return count + ' альбомов';
    }

    function getAlbumSearchIndex(key) {
        const album = ALBUMS[key];
        if (!album) {
            return '';
        }
        return album.items.map(function (item) {
            return item.caption;
        }).join(' ').toLowerCase();
    }

    function applyFilters() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        let visible = 0;
        let photosSum = 0;

        albumCards.forEach(function (card) {
            const matchCat = activeCategory === 'all' || card.dataset.category === activeCategory;
            const text = card.textContent.toLowerCase() + ' ' + getAlbumSearchIndex(card.dataset.album);
            const matchSearch = !query || text.includes(query);
            const show = matchCat && matchSearch;

            card.hidden = !show;
            if (show) {
                visible += 1;
                const album = ALBUMS[card.dataset.album];
                photosSum += album ? album.items.length : (Number(card.dataset.count) || 0);
            }
        });

        if (emptyNotice) {
            emptyNotice.hidden = visible > 0;
        }
        if (albumCount) {
            albumCount.textContent = pluralAlbums(visible);
        }
        if (photoTotalCount) {
            photoTotalCount.textContent = photosSum + ' фото';
        }
    }

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            filterChips.forEach(function (other) {
                other.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            activeCategory = chip.dataset.filter || 'all';
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    applyFilters();

    function buildMosaic(key) {
        const album = ALBUMS[key];
        if (!photoMosaic) {
            return;
        }

        photoMosaic.innerHTML = '';
        if (!album) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const total = album.items.length;

        album.items.forEach(function (item, index) {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'photo-thumb' + (item.featured ? ' photo-thumb--featured' : '');
            tile.style.transitionDelay = Math.min(index * 30, 360) + 'ms';
            tile.setAttribute('aria-label', 'Фото ' + (index + 1) + ' из ' + total + ': ' + item.caption);

            const img = document.createElement('img');
            img.src = item.thumb;
            img.alt = item.caption;
            img.width = 800;
            img.height = 533;
            img.loading = index < 6 ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.draggable = false;

            const caption = document.createElement('span');
            caption.className = 'photo-thumb-caption';
            caption.textContent = item.caption;

            tile.appendChild(img);
            tile.appendChild(caption);

            tile.addEventListener('click', function () {
                if (lightbox) {
                    lightbox.open(album.items, index, tile);
                }
            });

            fragment.appendChild(tile);
        });

        photoMosaic.appendChild(fragment);
        requestAnimationFrame(function () {
            photoMosaic.querySelectorAll('.photo-thumb').forEach(function (el) {
                el.classList.add('is-in');
            });
        });
    }

    function openAlbum(rawKey, pushHash) {
        const key = resolveAlbumKey(rawKey);
        const album = key && ALBUMS[key];
        if (!album || !albumView) {
            return;
        }

        currentAlbumKey = key;
        if (albumViewTitle) {
            albumViewTitle.textContent = album.title;
        }
        buildMosaic(key);

        if (toolbar) {
            toolbar.hidden = true;
        }
        if (albumGrid) {
            albumGrid.hidden = true;
        }
        if (emptyNotice) {
            emptyNotice.hidden = true;
        }
        albumView.hidden = false;

        if (pushHash !== false) {
            history.replaceState(null, '', '#album/' + key);
        }
        albumView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closeAlbum(pushHash) {
        if (!albumView) {
            return;
        }

        currentAlbumKey = null;
        albumView.hidden = true;
        if (toolbar) {
            toolbar.hidden = false;
        }
        if (albumGrid) {
            albumGrid.hidden = false;
        }
        applyFilters();

        if (pushHash !== false) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    albumCards.forEach(function (card) {
        const key = card.dataset.album;
        if (!key) {
            return;
        }

        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        const titleEl = card.querySelector('.album-title');
        if (titleEl) {
            card.setAttribute('aria-label', 'Открыть альбом «' + titleEl.textContent.trim() + '»');
        }

        card.addEventListener('click', function () {
            openAlbum(key, true);
        });

        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openAlbum(key, true);
            }
        });
    });

    if (albumViewBack) {
        albumViewBack.addEventListener('click', function () {
            closeAlbum(true);
        });
    }

    function syncFromHash() {
        const match = window.location.hash.match(/^#album\/([a-z0-9_-]+)$/i);
        const key = match && resolveAlbumKey(match[1]);
        if (key) {
            openAlbum(key, false);
        } else if (currentAlbumKey) {
            closeAlbum(false);
        }
    }

    window.addEventListener('hashchange', syncFromHash);
    syncFromHash();

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') {
            return;
        }
        if (lightbox && lightbox.isOpen()) {
            return;
        }
        if (currentAlbumKey) {
            closeAlbum(true);
        }
    });
})();
