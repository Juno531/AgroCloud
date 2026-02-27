const { chromium } = require('playwright');

(async () => {
    // Launch browser with ignoreHTTPSErrors: true
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));

    try {
        // 1. Login as Super Admin
        console.log('Logging in as Super Admin...');
        // Use HTTPS
        await page.goto('https://127.0.0.1:5173/login');
        await page.fill('input[type="email"]', 'super@AgroCloud.com');
        await page.fill('input[type="password"]', '1234');
        await page.click('button[type="submit"]');

        // Wait for navigation
        await page.waitForURL('**/super-admin/companies', { timeout: 15000 }).catch(() => console.log('Navigation to companies might be manual redirect...'));

        // Ensure we are on companies page
        await page.goto('https://127.0.0.1:5173/super-admin/companies');
        await page.waitForSelector('text=새 회사 및 관리자 등록');
        console.log('On Company Management Page.');

        // 2. Create a New Company
        console.log('Creating new company...');
        await page.click('button:has-text("새 회사 및 관리자 등록")');
        await page.waitForSelector('text=회사 정보');

        const uniqueId = Date.now();
        const companyName = `Test Company ${uniqueId}`;
        const companyCode = `TEST${uniqueId}`;
        const adminEmail = `admin${uniqueId}@test.com`;

        await page.fill('input[placeholder="예: (주)농업법인"]', companyName);
        await page.fill('input[placeholder="COMPANY123"]', companyCode);
        await page.fill('input[placeholder="123-45-67890"]', '123-45-67890');
        await page.fill('input[placeholder="02-1234-5678"]', '010-1234-5678');
        await page.fill('input[placeholder="서울특별시 ..."]', 'Seoul, Korea');

        await page.fill('input[placeholder="홍길동"]', 'Test Admin');
        await page.fill('input[placeholder="admin@company.com"]', adminEmail);
        await page.fill('input[placeholder="초기 비밀번호 입력"]', 'password123');

        await page.click('button:has-text("등록 완료")');

        // Handle dialogs
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        // Wait for the new company to appear
        console.log('Waiting for company to appear...');
        // Reload to ensure list is updated
        await page.reload();
        await page.waitForSelector(`text=${companyName}`, { timeout: 30000 });
        console.log('Company created successfully and visible.');

        // 3. Edit the Company
        console.log('Editing the company...');

        // Find a div that contains the company name AND the Edit button.
        // .filter({ has: page.locator('button', { hasText: '수정' }) }) filters down to elements that contain the button.
        // We target the rounded-xl container usually.
        // Use 'div' locator generally, then filter.
        const companyCard = page.locator('div').filter({ hasText: companyName }).filter({ has: page.locator('button', { hasText: '수정' }) }).first();

        // Debug: check if found
        const count = await companyCard.count();
        if (count === 0) {
            console.error('Could not find company card with Edit button');
            // Take screenshot to see what's there
            await page.screenshot({ path: 'c:/AntiProject/AgroCloud/debug_no_card.png' });
            throw new Error('Company card not found');
        }

        const editButton = companyCard.locator('button').filter({ hasText: '수정' });
        await editButton.click();

        await page.waitForSelector('text=회사 정보 수정');

        // Verify Admin fields are hidden
        const adminSection = await page.isVisible('text=관리자(Admin) 계정');
        if (adminSection) {
            console.error('ERROR: Admin section is visible during edit!');
        } else {
            console.log('Verified: Admin section is hidden during edit.');
        }

        // Change Name and Business Number
        const newCompanyName = companyName + ' Updated';
        await page.fill('input[value="' + companyName + '"]', newCompanyName);
        await page.fill('input[value="123-45-67890"]', '999-99-99999');

        await page.click('button:has-text("수정 완료")');

        // Wait for update
        await page.reload();
        await page.waitForSelector(`text=${newCompanyName}`, { timeout: 30000 });
        // Verify business number updated (visible in card)
        await page.waitForSelector('text=999-99-99999');
        console.log('Company updated successfully.');

        // 4. Delete the Company
        console.log('Deleting the company...');
        const updatedCard = page.locator('div').filter({ hasText: newCompanyName }).filter({ has: page.locator('button', { hasText: '삭제' }) }).first();
        // Use the delete button
        await updatedCard.locator('button').filter({ hasText: '삭제' }).click();

        // Dialog will be handled by page.on('dialog') handler defined above

        // Wait for company to disappear
        await page.waitForTimeout(2000); // Wait for API and refresh
        await page.reload();
        const count2 = await page.locator(`text=${newCompanyName}`).count();
        if (count2 === 0) {
            console.log('Company deleted successfully.');
        } else {
            console.error('ERROR: Company not deleted!');
        }

    } catch (error) {
        console.error('Test Failed:', error);
        await page.screenshot({ path: 'c:/AntiProject/AgroCloud/test_failure.png' });
    } finally {
        await browser.close();
    }
})();
