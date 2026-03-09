import { test, expect } from '@playwright/test';

test('create work record without keyword', async ({ page }) => {
  // 1. 로그인
  await page.goto('https://localhost:5173/login');
  await page.fill('input[name="email"]', 'test@sp.sp');
  await page.fill('input[name="password"]', '1234');
  await page.click('button[type="submit"]');

  // 2. 작업 관리 페이지로 이동
  await page.waitForURL('**/work');
  
  // 3. 새 작업 생성 모달 열기
  await page.click('button:has-text("새 작업 생성")');
  
  // 4. 폼 작성 (키워드 선택 안 함)
  const taskName = `Test Task ${new Date().getTime()}`;
  await page.fill('input[name="taskName"]', taskName);
  
  // 날짜는 기본값 사용
  
  // 5. 저장
  await page.click('button:has-text("작업 저장")');
  
  // 6. 성공 확인 (새로고침 후 목록에 나타나는지 확인)
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=' + taskName)).toBeVisible();
});
