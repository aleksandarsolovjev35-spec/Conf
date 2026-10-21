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
