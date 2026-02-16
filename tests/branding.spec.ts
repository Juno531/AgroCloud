import { test, expect } from '@playwright/test';

test('AgroCloud Branding & Design Check', async ({ page }) => {
    // Capture console logs and errors
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', exception => console.log(`BROWSER ERROR: ${exception}`));

    // Mock Login API
    await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                token: 'fake-jwt-token',
                user: {
                    id: 1,
                    email: 'admin@farm.com',
                    name: 'Johnathan Doe',
                    role: 'ADMIN'
                }
            })
        });
    });

    // 1. Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@farm.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/');

    // 2. Check Layout & Sidebar
    // Sidebar Logo
    await expect(page.getByText('AgroCloud')).toBeVisible();
    await expect(page.getByText('농장 관리 시스템')).toBeVisible();

    // Sidebar Links (Korean)
    // Use .first() if needed, or getByRole with specific name
    await expect(page.getByRole('link', { name: '대시보드' })).toBeVisible();
    await expect(page.getByRole('link', { name: '인사 관리' })).toBeVisible();
    await expect(page.getByRole('link', { name: '설정' })).toBeVisible();

    // 3. Check Dashboard Content
    // Header
    await expect(page.getByPlaceholder('농작물, 구역, 작업 검색...')).toBeVisible();

    // Check user name specifically in the header to avoid strict mode violation
    // The user name appears in both Sidebar and Header. We check the one in Header.
    await expect(page.locator('header').getByText('Johnathan Doe')).toBeVisible();

    // Main Title
    await expect(page.getByRole('heading', { name: '농장 현황' })).toBeVisible();

    // Weather Widget
    await expect(page.getByRole('heading', { name: '현재 날씨' })).toBeVisible();
    await expect(page.getByText('23°C')).toBeVisible(); // Converted unit

    // Resources
    await expect(page.getByRole('heading', { name: '자원 현황' })).toBeVisible();
    await expect(page.getByText('NPK 비료')).toBeVisible();

    // Tasks (Check Korean name)
    await expect(page.getByText('김민수')).toBeVisible();
    await expect(page.getByText('이영희')).toBeVisible();
});
