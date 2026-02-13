# 백엔드 API 접근을 위한 방화벽 규칙 추가
# 이 스크립트는 관리자 권한으로 실행해야 합니다

Write-Host "🔥 백엔드 포트(8080) 방화벽 규칙 추가 중..." -ForegroundColor Cyan

netsh advfirewall firewall add rule name="Spring Boot Backend (8080)" dir=in action=allow protocol=TCP localport=8080

Write-Host ""
Write-Host "✅ 방화벽 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 이제 모바일에서 로그인을 시도하세요:" -ForegroundColor Yellow
Write-Host "   https://192.168.219.104:5173/" -ForegroundColor White
Write-Host ""
Write-Host "🔍 백엔드 API 주소: http://192.168.219.104:8080" -ForegroundColor Cyan
