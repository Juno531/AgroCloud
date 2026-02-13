# 모바일 접속을 위한 방화벽 규칙 추가
# 이 스크립트는 관리자 권한으로 실행해야 합니다

Write-Host "🔥 방화벽 규칙 추가 중..." -ForegroundColor Cyan

# 포트 5173 (프론트엔드 개발 서버)
netsh advfirewall firewall add rule name="Vite Dev Server (5173)" dir=in action=allow protocol=TCP localport=5173

# 포트 8080 (백엔드 서버) - 필요한 경우
$addBackend = Read-Host "백엔드 서버 포트(8080)도 열으시겠습니까? (Y/N)"
if ($addBackend -eq "Y" -or $addBackend -eq "y") {
    netsh advfirewall firewall add rule name="Spring Boot Backend (8080)" dir=in action=allow protocol=TCP localport=8080
    Write-Host "✅ 백엔드 포트(8080)도 열었습니다!" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ 방화벽 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 모바일에서 접속하세요:" -ForegroundColor Yellow
Write-Host "   https://192.168.219.104:5173/" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  보안 경고가 나타나면 '고급 → 계속 진행'을 선택하세요" -ForegroundColor Yellow
