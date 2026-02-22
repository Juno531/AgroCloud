import { test, expect } from '@playwright/test';

test.describe('Attendance Filter Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // 1. 로그인
        await page.goto('/login');
        await page.fill('input[type="email"]', 'sp@sp.sp');
        await page.fill('input[type="password"]', '1234');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => { }),
            page.click('button[type="submit"]')
        ]);

        // 2. 인사 관리 -> 출퇴근 기록 페이지로 이동
        const hrMenu = page.getByText('인사 관리');
        await expect(hrMenu).toBeVisible();
        await hrMenu.click();

        const attendanceMenu = page.getByText('출퇴근 기록');
        await expect(attendanceMenu).toBeVisible();
        await attendanceMenu.click();

        await expect(page).toHaveURL(/\/attendance/);
    });

    test('Filter popover opens and buttons work properly', async ({ page }) => {
        // 1. 필터 버튼 확인 및 클릭
        const filterButton = page.getByRole('button', { name: '필터' });
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        // 2. 팝오버 내부 텍스트 확인
        await expect(page.getByText('출퇴근지 필터')).toBeVisible();
        await expect(page.getByText('출근 위치')).toBeVisible();
        await expect(page.getByText('퇴근 위치')).toBeVisible();

        // 3. 초기화 / 적용 버튼 확인
        const resetButton = page.getByRole('button', { name: '초기화' });
        const applyButton = page.getByRole('button', { name: '적용' });

        await expect(resetButton).toBeVisible();
        await expect(applyButton).toBeVisible();

        // 4. 적용 버튼을 누르면 팝오버가 닫히는지 확인
        await applyButton.click();
        await expect(page.getByText('출퇴근지 필터')).not.toBeVisible();
    });
});
