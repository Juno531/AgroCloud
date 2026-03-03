import { test, expect } from '@playwright/test';

test('Master Admin Role Flow Test', async ({ browser }) => {
    // 1. Super Admin Login Context
    const superAdminContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const saPage = await superAdminContext.newPage();

    console.log('--- Logging in as SUPER_ADMIN ---');
    await saPage.goto('https://localhost:5173/login');
    await saPage.fill('[placeholder="name@example.com"]', 'super@sp.sp');
    await saPage.fill('[placeholder="••••••••"]', '1234');
    await saPage.click('button:has-text("로그인")');

    // Wait for redirect to /super-admin
    await saPage.waitForURL('**/super-admin/companies');
    console.log('--- Navigated to /super-admin/companies ---');

    console.log('--- Creating New Company & Master Admin ---');
    await saPage.click('button:has-text("새 회사 및 관리자 등록")');

    const timestamp = Date.now();
    const newCompanyCode = `NEWFARM${timestamp}`;
    const masterEmail = `master${timestamp}@newfarm.com`;

    // Fill Company Info
    await saPage.fill('[placeholder="예: (주)농업법인"]', `신규테스트농장_${timestamp}`);
    await saPage.fill('[placeholder="COMPANY123"]', newCompanyCode);

    // Fill Master Admin Info
    await saPage.fill('[placeholder="홍길동"]', '마스터 어드민');
    await saPage.fill('[placeholder="admin@company.com"]', masterEmail);
    await saPage.fill('[placeholder="초기 비밀번호 입력"]', '1234');

    // Submit
    // Playwright captures the alert and auto-dismisses/accepts it by default, but we should handle it to prevent test failure if it blocks
    saPage.once('dialog', dialog => dialog.accept());
    await saPage.click('button:has-text("등록 완료")');

    // Wait for modal to disappear (or "등록 완료" button to vanish)
    await saPage.waitForSelector('button:has-text("등록 완료")', { state: 'hidden', timeout: 5000 }).catch(() => { });
    console.log(`--- Company Created! Master Email: ${masterEmail} ---`);
    await superAdminContext.close();

    // 2. Master Admin Login Context
    console.log('--- Logging in as NEW MASTER_ADMIN ---');
    const masterContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const maPage = await masterContext.newPage();

    await maPage.goto('https://localhost:5173/login');
    await maPage.fill('[placeholder="name@example.com"]', masterEmail);
    await maPage.fill('[placeholder="••••••••"]', '1234');
    await maPage.click('button:has-text("로그인")');

    // Wait for redirect to dashboard
    await maPage.waitForURL('**/');
    console.log('--- Navigated to DASHBOARD ---');

    // Navigate to HR (Employee Management)
    console.log('--- Navigating to Employee List ---');
    await maPage.goto('https://localhost:5173/hr/employees');

    // Check if "직원 등록" button is visible for Master Admin
    const registerBtn = maPage.locator('button:has-text("직원 등록")');
    await expect(registerBtn).toBeVisible({ timeout: 10000 });
    console.log('--- SUCCESS: Employee Registration button is visible for MASTER_ADMIN! ---');

    // Optional: Test if SUPER_ADMIN can be seen in the employee list (Master Admin etc should be filtered)
    // We can just verify the number of employees is mostly 0 except for the logged-in admin
    // Or check that only the new company's employees are shown
    await masterContext.close();
});
