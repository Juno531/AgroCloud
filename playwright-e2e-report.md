# Playwright E2E 프론트엔드 테스트 요약

---

## 📅 테스트 환경
- **Target URL**: `http://localhost:5173` (Vite Development Server)
- **Framework**: Playwright
- **Browser**: Chromium

## 🚀 테스트 시나리오 및 결과

**[테스트 1] User Login and Verify Dashboard Access**
- **시나리오 단계:**
  1. `/login` 페이지 진입
  2. 브라우저 타이틀이 `AgroCloud`가 포함되는지 검증
  3. 로그인 폼에 유효 계정(`sp@sp.sp` / `1234`) 입력 및 `Sign In` 클릭
  4. 로그인 성공 후 렌더링된 컴포넌트 중 **대시보드** 텍스트 노출 여부 확인
  5. 사이드바 네비게이션을 통해 **인사 관리** 메뉴 확장
  6. **출퇴근 기록** 하위 메뉴 렌더링 확인 및 클릭
  7. 실제 URL 라우팅이 `/attendance`로 변경되었는지 검증
  8. 최종 도착한 출퇴근 기록 페이지 요소(Header/Title) 정상 파싱 검증
- **결과:** ✅ **PASSED** (응답 속도: 약 2.6s)

---

### 💡 추가 분석
위의 테스트 케이스는 프론트엔드의 라우팅 구조(React Router)와 전역 상태(Context API/Zustand 등)를 거쳐 백엔드(Spring Boot Spring Security `/api/v1/auth/login`)에서 JWT를 발급받은 뒤 화면이 전환되는 **핵심 인증 및 레이아웃 이동 플로우가 100% 정상적**임을 의미합니다. 

이전에 TestSprite 환경에서 발생하던 `403` 포트 문제(엔드포인트 V1 누락) 및 플랫폼 터널 지연 문제가 현 개발 환경(로컬 E2E 테스트)에서는 쾌적하게 동작하고 있습니다.
