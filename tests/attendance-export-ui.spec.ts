import { test, expect } from '@playwright/test';

test.describe('Attendance Export UI Verification', () => {
    test.beforeEach(async ({ page }) => {
        // 1. 로그인
        await page.goto('/login');
        await page.fill('input[type="email"]', 'sp@sp.sp');
        await page.fill('input[type="password"]', '1234');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => { }),
            page.click('button[type="submit"]')
        ]);

        // 2. 기록 내보내기 페이지로 직접 이동
        await page.goto('/hr/attendance-export');
        await page.waitForLoadState('networkidle');
    });

    test('should display 2-column layout and employee folders', async ({ page }) => {
        // 사이드바 타이틀 확인
        await expect(page.getByText('직원 목록')).toBeVisible();

        // 폴더 확인 (정규직, 비정규직)
        await expect(page.getByText(/정규직/)).toBeVisible();
        await expect(page.getByText(/비정규직/)).toBeVisible();

        // 메인 영역 타이틀 확인
        await expect(page.getByText('출퇴근 기록 내보내기')).toBeVisible();
    });

    test('should have search input and summary card', async ({ page }) => {
        await expect(page.getByPlaceholder('직원 검색...')).toBeVisible();
        await expect(page.getByText(/기록 생성 준비 완료/)).toBeVisible();
    });

    test('should have export button', async ({ page }) => {
        // 스크린샷에서 확인된 정확한 텍스트 "엑셀 내려받기"
        const exportButton = page.getByRole('button', { name: /엑셀 내려받기/ });
        await expect(exportButton).toBeVisible();
    });
});
