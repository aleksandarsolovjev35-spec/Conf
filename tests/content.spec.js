const { test, expect } = require('@playwright/test');

// Внешняя форма и шрифты не должны влиять на стабильность проверки.
test.beforeEach(async ({ page }) => {
    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    });
});

// Актуальность года: на обеих страницах не должно остаться прошлогодних дат.
for (const file of ['index.html', 'photos.html']) {
    test(`${file}: нет устаревших дат и верного года в заголовке`, async ({ page }) => {
        await page.goto(`/${file}`);
        const html = await page.content();
        expect(html).not.toContain('2025');

        const title = await page.title();
        expect(title).toContain('2026');
        expect(title).toContain('III');
    });
}

test('главная: название конференции — главный акцент, а не «III Ежегодная»', async ({ page }) => {
    await page.goto('/index.html');
    const h1 = page.locator('#hero h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(/Технологии микросистем/);

    const sizes = await page.evaluate(() => ({
        h1: parseFloat(getComputedStyle(document.querySelector('#hero h1')).fontSize),
        kicker: parseFloat(getComputedStyle(document.querySelector('.hero-kicker')).fontSize),
    }));
    expect(sizes.h1).toBeGreaterThan(sizes.kicker * 1.8);
});

test('заставка: фоновое изображение не перехватывает клики и не перетаскивается', async ({ page }) => {
    await page.goto('/index.html');
    const background = page.locator('.hero-bg');
    const image = background.locator('img');
    await expect(image).toHaveAttribute('draggable', 'false');
    expect(await background.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    expect(await image.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
});

test('главная: в шапке логотип МИЭТ вместо текста «НМСТ 2025»', async ({ page }) => {
    await page.goto('/index.html');
    const logo = page.locator('.nav-logo img').first();
    await expect(logo).toBeVisible();
    const src = await logo.getAttribute('src');
    expect(src).toContain('images/logos/miet');
    await expect(page.locator('.nav-logo')).not.toContainText('НМСТ');
});

test('главная: тематические направления из обновлённого перечня', async ({ page }) => {
    await page.goto('/index.html');
    const topics = page.locator('.about-topic-card h4');
    await expect(topics).toHaveCount(6);
    await expect(topics.nth(0)).toHaveText('Корпусирование ЭКБ');
    await expect(topics.nth(4)).toHaveText('Оборудование и оснастка');
    await expect(topics.nth(5)).toHaveText('САПР ЭКБ');
    await expect(page.locator('.about-topic-card').nth(0)).toContainText('подложек и корпусов');
});

test('главная: партнёры разбиты на категории, в два столбца и ведут на официальные сайты', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');
    // Стратегический партнёр — полный высококачественный логотип с прозрачным фоном
    const zntcLogo = page.locator('.partner-strategic img');
    await expect(zntcLogo).toHaveAttribute('alt', /ЗНТЦ/);
    await zntcLogo.scrollIntoViewIfNeeded();
    await expect(zntcLogo).toHaveJSProperty('complete', true);
    expect(await zntcLogo.evaluate(img => img.naturalWidth)).toBeGreaterThanOrEqual(400);
    const partners = page.locator('.partners-grid .partner-logo');
    await expect(partners).toHaveCount(4);

    const officialSites = [
        ['.partner-strategic', 'https://zntc.ru/'],
        ['.partners-grid .partner-logo:nth-child(1)', 'https://sovtest-ate.ru/'],
        ['.partners-grid .partner-logo:nth-child(2)', 'https://t1.ru/'],
        ['.partners-grid .partner-logo:nth-child(3)', 'https://www.eremex.ru/'],
        ['.partners-grid .partner-logo:nth-child(4)', 'https://ostec-group.ru/'],
    ];
    for (const [selector, url] of officialSites) {
        const link = page.locator(selector);
        await expect(link).toHaveAttribute('href', url);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
        await expect(link.locator('img')).toHaveCount(1);
    }

    await partners.first().scrollIntoViewIfNeeded();
    const rows = await partners.evaluateAll(els =>
        els.map(el => Math.round(el.getBoundingClientRect().top)));
    expect(rows[0]).toBe(rows[1]);
    expect(rows[2]).toBe(rows[3]);
    expect(rows[2]).toBeGreaterThan(rows[0]);
});

test('программа: только общее расписание, список докладов скрыт', async ({ page }) => {
    await page.goto('/index.html');

    // Общие временные диапазоны работы конференции
    await page.locator('.program-item').first().scrollIntoViewIfNeeded();
    await expect(page.locator('.program-item').first()).toContainText('кофе');
    await expect(page.locator('.program-item .program-time').last()).toHaveText(/18:00/);
    await expect(page.locator('.program-block')).toHaveCount(2);

    // Конкретных докладов и их тайминга в программе больше нет
    await expect(page.locator('#program')).not.toContainText('Докладчик: уточняется');
    await expect(page.locator('#program .program-org')).toHaveCount(0);
    expect(await page.locator('#program .program-item').count()).toBeLessThanOrEqual(10);

    // Вместо списка — пометка, что тайминг докладчиков будет позже
    await expect(page.locator('.program-note--pending')).toContainText('Расписание докладчиков будет опубликовано позже');
});

test('главная: блоки «Видео» и «Публикации» на месте', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#video')).toHaveCount(1);
    await expect(page.locator('#publications')).toHaveCount(1);
    await expect(page.locator('.publication-card')).toHaveCount(3);
});

test('контакты: указан полный адрес площадки', async ({ page }) => {
    await page.goto('/index.html');
    const venue = page.locator('.venue');
    await expect(venue).toContainText('площадь Шокина, дом 1');
    await expect(page.locator('.hero-details')).not.toContainText('Зеленоград');
});

test('контакты: единый шаблон карточки', async ({ page }) => {
    await page.goto('/index.html');
    const cards = page.locator('.contacts-grid .contact-card');
    await expect(cards).toHaveCount(3);

    // В каждой карточке один и тот же порядок: должность → ФИО → контакты.
    for (let i = 0; i < 3; i++) {
        const card = cards.nth(i);
        await expect(card.locator('.contact-icon')).toHaveCount(1);
        await expect(card.locator('h3')).toHaveCount(1);
        await expect(card.locator('.contact-name')).toHaveCount(1);
        await expect(card.locator('.contact-links')).toHaveCount(1);
        await expect(card.locator('.contact-note')).toHaveCount(0);
        await expect(card).not.toHaveClass(/contact-card--pending/);
        expect(await card.locator('.contact-icon').evaluate(el => el.compareDocumentPosition(el.closest('.contact-card').querySelector('h3')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
    }
    await expect(page.locator('.contacts-grid')).not.toContainText('Кандидат технических наук');

    // Председатель оргкомитета — Тимошенков С. П.; контакты ещё не предоставлены
    const organizer = cards.nth(0);
    await expect(organizer.locator('h3')).toHaveText('Председатель оргкомитета');
    await expect(organizer).toContainText('Тимошенков Сергей Петрович');
    await expect(organizer.locator('.contact-links .contact-pending')).toHaveText('Контакт уточняется');
    await expect(organizer.locator('.contact-links a')).toHaveCount(0);

    // Председатель программного комитета — Вертянов Д. В., связь по почте
    const programChair = cards.nth(1);
    await expect(programChair.locator('h3')).toHaveText('Председатель программного комитета');
    await expect(programChair).toContainText('Вертянов Денис Васильевич');
    await expect(programChair).not.toContainText('Кандидат технических наук');
    await expect(programChair.locator('.contact-links a')).toHaveCount(1);
    await expect(programChair.locator('.contact-links a')).toHaveAttribute('href', 'mailto:vdv.vertyanov@yandex.ru');

    // Координатор мероприятия — Косолапова Г. В., телефон и почта
    const coordinator = cards.nth(2);
    await expect(coordinator.locator('h3')).toHaveText('Координатор мероприятия');
    await expect(coordinator).toContainText('Косолапова Галина Викторовна');
    await expect(coordinator.locator('.contact-links a')).toHaveCount(2);
    await expect(coordinator.locator('.contact-links a').first()).toHaveAttribute('href', 'tel:+79958990559');
    await expect(coordinator.locator('.contact-links a').last()).toHaveAttribute('href', 'mailto:galka-vikt@mail.ru');

    // Контакт-заглушка находится в том же блоке, что и рабочие контакты.
    await expect(page.locator('.contact-card--pending')).toHaveCount(0);
    await expect(organizer.locator('.contact-links .contact-pending')).toContainText('уточняется');

    // Адрес — карточка того же вида и на всю ширину сетки
    const venue = page.locator('.venue');
    await expect(venue.locator('.contact-icon')).toHaveCount(1);
    await expect(venue.locator('h3')).toHaveText('Место проведения');
    const [venueBox, firstBox] = await Promise.all([venue.boundingBox(), cards.first().boundingBox()]);
    expect(venueBox.width).toBeGreaterThan(firstBox.width * 2);
});

test('программа: только расписание, без описательного абзаца под заголовком', async ({ page }) => {
    await page.goto('/index.html');

    const header = page.locator('#program .section-header');
    await expect(header).toContainText('Программа конференции');

    // Подзаголовок с датой, временем и длительностью доклада убран
    await expect(header.locator('.section-subtitle')).toHaveCount(0);
    await expect(header).not.toContainText('Средняя длительность');
    await expect(header).not.toContainText('Начало регистрации');

    // Само расписание на месте
    await expect(page.locator('#program .program-block')).toHaveCount(2);
    await expect(page.locator('#program .program-item').first()).toBeVisible();
});

test('спикеры: 16 организаций, разбиты на три группы', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('.speaker-card--org')).toHaveCount(16);
    await expect(page.locator('.speakers-group')).toHaveCount(3);

    const titles = await page.locator('.speakers-group-title').allTextContents();
    expect(titles).toEqual(['Организаторы', 'Индустрия', 'Наука и образование']);

    // Счётчики в заголовках складываются в общее число карточек
    const counts = await page.locator('.speakers-group-count').allTextContents();
    expect(counts.reduce((sum, n) => sum + Number(n), 0)).toBe(16);

    // В каждой группе количество карточек совпадает со счётчиком
    for (const group of await page.locator('.speakers-group').all()) {
        const count = Number(await group.locator('.speakers-group-count').textContent());
        expect(await group.locator('.speaker-card--org').count()).toBe(count);
    }
});

test('спикеры: карточка ведёт на официальный сайт организации', async ({ page }) => {
    await page.goto('/index.html');

    const links = page.locator('.speaker-card--org .speaker-link');
    await expect(links).toHaveCount(16);

    const expected = {
        'НИУ МИЭТ': 'https://miet.ru/',
        'АО «ЗНТЦ»': 'https://zntc.ru/',
        'ООО «Совтест АТЕ»': 'https://sovtest-ate.ru/',
        'Т1 Интеграция': 'https://t1.ru/',
        'ЭРЕМЕКС': 'https://www.eremex.ru/',
        'ООО «Остек-ЭК»': 'https://ostec-group.ru/',
        'САВТЭК': 'https://savtech.ru/',
        'Трамплин Электроникс': 'https://tramplin.group/',
        'Тестовые Решения': 'https://tsocket.ru/',
        'ЛМП': 'https://mp-lab.ru/',
        'ДжиЭс-Нанотех': 'https://gsnanotech.ru/',
        'АО «НИИМА «Прогресс»': 'https://i-progress.tech/',
        'МФТИ': 'https://mipt.ru/',
        'ФИЦ ПХФ и МХ РАН': 'https://icp-ras.ru/',
        'НИИСИ РАН': 'https://www.niisi.ru/',
        'НИИПП': 'https://www.niipp.ru/',
    };

    for (const [name, url] of Object.entries(expected)) {
        const card = page.locator('.speaker-card--org', { has: page.getByText(name, { exact: true }) }).first();
        await expect(card.locator('a.speaker-link')).toHaveAttribute('href', url);
    }

    // Внешние ссылки открываются в новой вкладке и без доступа к opener
    for (const link of await links.all()) {
        await expect(link).toHaveAttribute('target', '_blank');
        expect((await link.getAttribute('rel')) || '').toContain('noopener');
    }
});

test('спикеры и партнёры: официальные логотипы, названия доступны скринридеру', async ({ page }) => {
    await page.goto('/index.html');

    // Логотипы партнёров: файл открывается, у картинки есть текстовое описание
    const logos = page.locator('.partners-grid .partner-logo img');
    await expect(logos).toHaveCount(4);
    await expect(page.locator('.partner-strategic img')).toHaveCount(1);

    for (const img of await logos.all()) {
        const alt = await img.getAttribute('alt');
        expect(alt && alt.trim().length).toBeTruthy();
        await img.scrollIntoViewIfNeeded();       // lazy-loading грузится по появлению
        await expect(img).toHaveJSProperty('complete', true);
        expect(await img.evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
    }

    // Логотип есть у всех 16 организаций; название остаётся в разметке
    const withLogo = page.locator('.speaker-brand:has(img)');
    await expect(withLogo).toHaveCount(16);
    for (const brand of await withLogo.all()) {
        await expect(brand.locator('.speaker-name')).toHaveCount(1);
        await expect(brand.locator('img')).toHaveAttribute('alt', '');
    }

    // Все логотипы загрузились и не выходят за общий размер
    // (loading="lazy" — прокручиваем секцию, чтобы браузер их запросил)
    await page.locator('#speakers').scrollIntoViewIfNeeded();
    for (const img of await page.locator('.speaker-brand img').all()) {
        await img.scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() =>
        [...document.querySelectorAll('.speaker-brand img')].every(i => i.complete));

    const boxes = await page.locator('.speaker-brand img').evaluateAll(els =>
        els.map(el => ({ w: Math.round(el.getBoundingClientRect().width),
                         h: Math.round(el.getBoundingClientRect().height),
                         ok: el.complete && el.naturalWidth > 0 })));
    expect(boxes).toHaveLength(16);
    expect(boxes.every(b => b.ok)).toBe(true);
    expect(boxes.every(b => b.w <= 150 && b.h <= 32)).toBe(true);

    // Все 16 карточек имеют строку бренда одинаковой высоты — подписи выровнены
    const heights = await page.locator('.speaker-brand').evaluateAll(
        els => [...new Set(els.map(el => Math.round(el.getBoundingClientRect().height)))]);
    expect(heights).toEqual([44]);
});

test('без JS контент и заголовки разделов остаются видимыми', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/index.html');
    await expect(page.locator('#speakers-heading')).toBeVisible();
    await expect(page.locator('.speaker-card').first()).toBeVisible();
    await expect(page.locator('.about-topic-card').first()).toBeVisible();
    await context.close();
});

test('порядок блоков сохраняется после прокрутки (страховка анимаций)', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3200);
    const hidden = await page.locator('.animate-target:not(.animate-in)').count();
    expect(hidden).toBe(0);
});

test('есть семантический main и ссылка «Перейти к содержанию»', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('main#main')).toHaveCount(1);
    const skip = page.locator('.skip-link');
    await expect(skip).toHaveAttribute('href', '#main');

    // Ссылка скрыта, пока на неё не встал фокус
    expect(await skip.evaluate(el => el.getBoundingClientRect().bottom <= 0)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    // Появление анимировано (top: -100px → 0), поэтому ждём, а не меряем сразу
    await expect(skip).toBeInViewport();

    await page.goto('/photos.html');
    await expect(page.locator('main#main')).toHaveCount(1);
});

test('шапка: только регистрация и программа, без кнопки календаря', async ({ page }) => {
    await page.goto('/index.html');

    const buttons = page.locator('.hero-buttons a');
    await expect(buttons).toHaveCount(2);
    await expect(buttons.nth(0)).toHaveText('Зарегистрироваться');
    await expect(buttons.nth(1)).toHaveText('Программа');

    // Событие в календарь больше не предлагаем: ни кнопки, ни файла
    await expect(page.locator('.btn-calendar, a[href$=".ics"]')).toHaveCount(0);
    const res = await page.request.get('/nmst-2026.ics');
    expect(res.status()).toBe(404);
});

test('SEO: микроразметка события, OG-обложка и robots/sitemap', async ({ page }) => {
    await page.goto('/index.html');

    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(ld);
    expect(data['@type']).toBe('Event');
    expect(data.startDate).toContain('2026-12-17');
    expect(data.location.address.addressLocality).toContain('Зеленоград');

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'images/og-cover.jpg');
    const og = await page.request.get('/images/og-cover.jpg');
    expect(og.status()).toBe(200);
    expect(Number(og.headers()['content-length'])).toBeGreaterThan(10000);

    for (const file of ['/robots.txt', '/sitemap.xml']) {
        const res = await page.request.get(file);
        expect(res.status(), file).toBe(200);
    }
});

test('видео: превью без ссылки не притворяется рабочим', async ({ page }) => {
    await page.goto('/index.html');
    const button = page.locator('#videoPlay');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#videoHint')).toContainText('появится');
    // iframe не подгружается до клика
    await expect(page.locator('.video-teaser iframe')).toHaveCount(0);
});

test('меню: текущий раздел подсвечивается при прокрутке', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/index.html');
    await page.locator('#program').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await expect(page.locator('.nav-links a[href="#program"]')).toHaveClass(/nav-link-active/);
});

// Разметка, которую рисует встроенная форма Битрикс24 (упрощённо).
const BITRIX_FORM = `
<div class="b24-form">
    <div class="b24-form-header">
        <div class="b24-form-header-title">Регистрация на конференцию Micropack</div>
    </div>
    <div class="b24-form-content">
        <div class="b24-form-field">
            <label class="b24-form-control-label" for="f-name">Фамилия *</label>
            <input id="f-name" type="text">
        </div>
        <div class="b24-form-field">
            <label class="b24-form-control-label" for="f-mail">E-mail *</label>
            <input id="f-mail" type="email">
        </div>
        <button type="submit" class="b24-form-btn">Отправить</button>
    </div>
</div>`;

test('регистрация: заголовок встроенной формы перекрыт нашим', async ({ page }) => {
    await page.goto('/index.html');

    // Форма подгружается после загрузки страницы — имитируем это
    await page.evaluate(html => {
        document.getElementById('regForm').insertAdjacentHTML('beforeend', html);
    }, BITRIX_FORM);
    await page.waitForTimeout(300);

    // Заголовок формы скрыт, остался только наш
    await expect(page.locator('.b24-form-header')).toBeHidden();
    await expect(page.locator('#reg-heading')).toBeVisible();
    await expect(page.locator('#reg-heading')).toHaveText('Регистрация на конференцию');
    expect(await page.getByText('Micropack').count()).toBeGreaterThan(0);
    await expect(page.getByText('Micropack')).toBeHidden();

    // Поля и кнопка при этом на месте и доступны
    await expect(page.locator('#f-name')).toBeVisible();
    await expect(page.locator('#f-mail')).toBeVisible();
    await expect(page.locator('.b24-form-btn')).toBeVisible();
    await expect(page.locator('#registration')).toHaveClass(/reg-restyled/);
});

test('регистрация: в блоке нет дублирующей информации', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('#registration');
    await expect(section.locator('h2')).toHaveCount(1);
    await expect(section.locator('.reg-text, .reg-info, .reg-features')).toHaveCount(0);
    await expect(section).not.toContainText('09:00–09:30');
    await expect(section).not.toContainText('ДПО');
    await expect(section).not.toContainText('Участие бесплатное');
    await expect(section.locator('.reg-subtitle')).toHaveCount(0);
    // Время и место регистрации остаются в программе
    await expect(page.locator('#program')).toContainText('кофе');
});

test('регистрация: надпись-секция формы скрывается и вне #regForm', async ({ page }) => {
    await page.goto('/index.html');
    // Так форма отдаёт надпись на самом деле: label секции (layout),
    // вставленный рядом со скриптом-загрузчиком, а не внутри #regForm
    await page.evaluate(() => {
        document.getElementById('registration').insertAdjacentHTML('beforeend', `
            <div class="b24-form-field b24-form-field-layout" id="layoutSection">
                <div class="b24-form-control-label">Регистрация на конференцию Micropack</div>
            </div>`);
    });
    await page.waitForTimeout(300);

    // Скрывается и стилями, и скриптом — проверяем оба слоя
    await expect(page.locator('#layoutSection')).toBeHidden();
    expect(await page.locator('#layoutSection').evaluate(el => el.getBoundingClientRect().height)).toBe(0);
    // Заголовок раздела на месте
    await expect(page.locator('#reg-heading')).toBeVisible();
});

test('регистрация: заголовок формы закрывается и без известных классов', async ({ page }) => {
    await page.goto('/index.html');
    // Форма с произвольной разметкой: CSS-правила её не ловят, работает только JS
    await page.evaluate(() => {
        document.getElementById('regForm').insertAdjacentHTML('beforeend', `
            <div class="crm-wrap">
                <div class="crm-head"><h3>Регистрация на конференцию Micropack</h3></div>
                <div class="crm-body">
                    <label>Фамилия *<input type="text" id="crm-name"></label>
                    <label>E-mail *<input type="email" id="crm-mail"></label>
                    <button type="submit">Отправить</button>
                </div>
            </div>`);
    });
    await page.waitForTimeout(300);

    const title = page.locator('.crm-head h3');
    await expect(title).toBeHidden();
    expect(await title.evaluate(el => el.getBoundingClientRect().height)).toBe(0);
    // Обёртка заголовка скрыта целиком — лишних отступов не остаётся
    await expect(page.locator('.crm-head')).toBeHidden();
    // Поля на месте
    await expect(page.locator('#crm-name')).toBeVisible();
    await expect(page.locator('#crm-mail')).toBeVisible();
});

test('регистрация: наш заголовок внутри карточки не пострадал', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => {
        document.getElementById('regForm').insertAdjacentHTML('beforeend', `
            <div class="b24-form"><div class="b24-form-header">
                <div class="b24-form-header-title">Регистрация на конференцию Micropack</div>
            </div><input type="text" id="f1"></div>`);
    });
    await page.waitForTimeout(300);
    // Заголовок раздела (вне формы) остаётся видимым
    await expect(page.locator('.reg-content .section-header')).toBeVisible();
    await expect(page.locator('#reg-heading')).toBeVisible();
});
