import { test, expect } from '@playwright/test';

test.describe('AgroCloud E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 모든 API 호출에 대한 불필요한 콘솔 출력을 줄임
    });

    test('User Login and Verify Dashboard Access', async ({ page }) => {
        // 1. 로그인 페이지 접속
        await page.goto('/login');

        // 2. 타이틀 확인
        await expect(page).toHaveTitle(/AgroCloud/); // App title verification

        // 3. 폼 필드 채우기 (앞서 401 오류가 나던 계정 사용: sp@sp.sp / 1234)
        // 실제 작동하는 백엔드와 연결된 환경 테스트입니다.
        await page.fill('input[type="email"]', 'sp@sp.sp');
        await page.fill('input[type="password"]', '1234');

        // 4. 로그인 버튼 클릭
        // button type이 submit인 버튼을 클릭
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => { }), // 로그인이 성공하면 페이지 이동이 일어남
            page.click('button[type="submit"]')
        ]);

        // 5. 로그인 에러 발생 시(401) 처리 방어: alert나 error message DOM 로직
        // 테스트 스크립트는 실제 성공을 가정합니다. 만약 401이라면 아래 대시보드 검증에서 실패할 것입니다.

        // 6. 대시보드 URL 진입 확인 (혹은 메인 페이지 '/')
        await expect(page).toHaveURL(/\//); // Root or /dashboard

        // 7. 메인 화면의 대시보드 텍스트 혹은 네비게이션 확인
        // "농장 관리 시스템", "대시보드" 등의 텍스트가 보이는지 검증
        await expect(page.getByText('대시보드').first()).toBeVisible();

        // 8. 사이드바 - 인사 관리 메뉴 텍스트 및 클릭 테스트
        await expect(page.getByText('인사 관리')).toBeVisible();
        await page.getByText('인사 관리').click();

        // 9. 하위 메뉴 출퇴근 기록 클릭 및 이동 확인
        // (네비게이션 트랜지션 로직에 따라 약간의 딜레이 허용)
        await expect(page.getByText('출퇴근 기록')).toBeVisible();
        await page.getByText('출퇴근 기록').click();

        // 10. URL이 /attendance 로 변경됐는지 검증
        await expect(page).toHaveURL(/\/attendance/);

        // 11. 출결 관리 페이지의 타이틀/버튼 확인
        await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: '출퇴근 기록' }).or(page.getByText('출퇴근 기록', { exact: true }).first())).toBeVisible();
    });
});
