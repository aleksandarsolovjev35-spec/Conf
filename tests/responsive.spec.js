const { test, expect } = require('@playwright/test');

// Внешняя форма и шрифты не должны влиять на стабильность проверки вёрстки.
test.beforeEach(async ({ page }) => {
    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
    });
});

async function expectNoOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerWidth)
    );
}

for (const file of ['index.html', 'photos.html']) {
    for (const width of [320, 375, 390, 480, 560, 768, 820, 1024, 1025, 1280]) {
        test(`${file}: ширина ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 });
            await page.goto(`/${file}`);
            await expectNoOverflow(page);
            if (file === 'index.html') {
                // Проверяем саму карусель, а не только overflow скрытый на body.
                const bounds = await page.locator('#photobankCarousel').boundingBox();
                expect(bounds.x).toBeGreaterThanOrEqual(0);
                expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
            } else {
                const bounds = await page.locator('.photobank-search').boundingBox();
                expect(bounds.height).toBeLessThan(80);
            }
            if (width <= 1024) {
                await expect(page.locator('#navToggle')).toBeVisible();
                await expect(page.locator('#navLinks')).toBeHidden();
            } else {
                await expect(page.locator('#navToggle')).toBeHidden();
                await expect(page.locator('#navLinks')).toBeVisible();
            }
        });
    }
}

for (const file of ['index.html', 'photos.html']) {
    test(`${file}: мобильное меню и смена ориентации`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(`/${file}`);
        const toggle = page.locator('#navToggle');
        const links = page.locator('#navLinks');
        await expect(links).toHaveJSProperty('inert', true);
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(toggle).toHaveAttribute('aria-label', 'Закрыть меню');
        await expect(page.locator('body')).toHaveClass(/nav-open/);
        await expectNoOverflow(page);
        await expect(links).toBeVisible();
        // Дожидаемся окончания выезда панели перед проверкой клавиатуры.
        await links.locator('a').last().click({ trial: true });
        await page.keyboard.press('Shift+Tab');
        await expect(links.locator('a').last()).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(toggle).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();
        await expect(page.locator('body')).not.toHaveClass(/nav-open/);
        await toggle.click();
        await page.mouse.click(10, 200);
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await toggle.click();
        // Первый пункт — якорь на главной, без перехода между страницами.
        if (file === 'index.html') {
            await links.locator('a').first().click();
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await toggle.click();
        }
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(links).toHaveJSProperty('inert', false);
        await expect(page.locator('body')).not.toHaveClass(/nav-open/);
        await page.setViewportSize({ width: 375, height: 812 });
        await expect(links).toBeHidden();
    });
}

test('карусель помещается на узком экране и переключается', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/index.html');
    await page.locator('#carouselNext').click();
    await expect(page.locator('#carouselCounter')).toHaveText('2 / 4');
    await page.locator('#carouselPrev').click();
    await expect(page.locator('#carouselCounter')).toHaveText('1 / 4');
    const clipped = await page.locator('.photobank-slide').evaluateAll(slides =>
        slides.some(slide => slide.scrollHeight > slide.clientHeight)
    );
    expect(clipped).toBe(false);
    await expectNoOverflow(page);
});

test('фотобанк: поиск, альбом и просмотр в двух ориентациях', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/photos.html');
    await page.locator('#albumSearch').fill('Пленарные');
    await expect(page.locator('.album-card:visible')).toHaveCount(1);
    await page.locator('#albumSearch').fill('');
    await page.locator('[data-album="opening"]').click();
    await expect(page.locator('#albumGrid')).toBeHidden();
    await expect(page.locator('.photobank-toolbar')).toBeHidden();
    await expect(page.locator('#albumView')).toBeVisible();
    await expect(page.locator('#albumViewTitle')).toHaveText('Торжественное открытие конференции');
    await expect(page.locator('.photo-thumb')).toHaveCount(6);
    await expect(page.locator('.photo-thumb img')).toHaveCount(6);
    await expect(page.locator('.album-view-meta, .album-view-hint')).toHaveCount(0);
    await expectNoOverflow(page);
    expect(await page.locator('.photo-thumb').evaluateAll(tiles =>
        tiles.some(tile => tile.scrollHeight > tile.clientHeight)
    )).toBe(false);
    await page.locator('.photo-thumb').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await expect(page.locator('.lightbox-img')).toBeVisible();
    await page.locator('#lightboxNext').click();
    await expect(page.locator('#lightboxCounter')).toHaveText('2 / 6');
    for (const size of [{ width: 320, height: 720 }, { width: 667, height: 375 }]) {
        await page.setViewportSize(size);
        await expectNoOverflow(page);
        for (const selector of ['#lightboxClose', '#lightboxPrev', '#lightboxNext', '.lightbox-caption']) {
            const rect = await page.locator(selector).boundingBox();
            expect(rect.y).toBeGreaterThanOrEqual(0);
            expect(rect.y + rect.height).toBeLessThanOrEqual(size.height);
        }
    }
    await page.locator('#lightboxClose').click();
    await expect(page.locator('body')).not.toHaveClass(/lightbox-open/);
    await page.locator('#albumViewBack').click();
    await expect(page.locator('#albumGrid')).toBeVisible();
});

test.describe('сенсорный телефон с обычными анимациями', () => {
    test.use({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
        reducedMotion: 'no-preference',
    });

    test('меню и содержимое обеих страниц', async ({ page }) => {
        for (const file of ['index.html', 'photos.html']) {
            await page.goto(`/${file}`);
            await page.locator('#navToggle').tap();
            await expect(page.locator('#navLinks')).toBeVisible();
            await expectNoOverflow(page);
            await page.locator('#navToggle').tap();
            await expect(page.locator('#navLinks')).toBeHidden();
            if (file === 'index.html') {
                await page.locator('#carouselNext').tap();
                await expect(page.locator('#carouselCounter')).toHaveText('2 / 4');
            } else {
                await page.locator('[data-album="opening"]').tap();
                await expect(page.locator('#albumView')).toBeVisible();
            }
            await expectNoOverflow(page);
        }
    });
});
