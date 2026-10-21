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
        expect(title).toContain('IV');
    });
}

test('главная: название конференции — главный акцент, а не «IV Ежегодная»', async ({ page }) => {
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

test('главная: партнёры разбиты на стратегического партнёра и партнёров', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.partner-strategic')).toContainText('ЗНТЦ');
    const partners = page.locator('.partners-grid .partner-logo');
    await expect(partners).toHaveCount(4);
});

test('главная: в программе есть кофе-брейк при регистрации и финал в 18:00', async ({ page }) => {
    await page.goto('/index.html');
    const first = page.locator('.program-item').first();
    await expect(first).toContainText('кофе');
    const lastTime = page.locator('.program-item .program-time').last();
    await expect(lastTime).toHaveText(/18:00/);
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

    // В каждой карточке: иконка → роль (h3) → содержимое
    for (let i = 0; i < 3; i++) {
        const card = cards.nth(i);
        await expect(card.locator('.contact-icon')).toHaveCount(1);
        await expect(card.locator('h3')).toHaveCount(1);
        expect(await card.locator('.contact-icon').evaluate(el => el.compareDocumentPosition(el.closest('.contact-card').querySelector('h3')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
    }

    // Телефон и почта — в одном блоке, отдельными строками
    const links = cards.first().locator('.contact-links a');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute('href', 'tel:+79958990559');
    await expect(links.nth(1)).toHaveAttribute('href', 'mailto:galka-vikt@mail.ru');

    // Карточки без данных помечены как ожидающие
    await expect(page.locator('.contact-card--pending')).toHaveCount(2);
    await expect(page.locator('.contact-card--pending').first()).toContainText('уточняется');

    // Адрес — карточка того же вида и на всю ширину сетки
    const venue = page.locator('.venue');
    await expect(venue.locator('.contact-icon')).toHaveCount(1);
    await expect(venue.locator('h3')).toHaveText('Место проведения');
    const [venueBox, firstBox] = await Promise.all([venue.boundingBox(), cards.first().boundingBox()]);
    expect(venueBox.width).toBeGreaterThan(firstBox.width * 2);
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

test('календарь: файл .ics доступен и содержит событие 2026 года', async ({ page }) => {
    const res = await page.request.get('/nmst-2026.ics');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('DTSTART;TZID=Europe/Moscow:20261217T090000');
    expect(body).toContain('DTEND;TZID=Europe/Moscow:20261217T180000');
    expect(body).toContain('END:VCALENDAR');

    await page.goto('/index.html');
    await expect(page.locator('.btn-calendar')).toHaveAttribute('href', 'nmst-2026.ics');
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
