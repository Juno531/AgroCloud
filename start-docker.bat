@echo off
echo ========================================
echo Starting Farm ERP Backend with Docker
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running! Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [INFO] Building and starting Docker containers...
echo.

REM Start Docker Compose
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Docker containers started successfully!
    echo ========================================
    echo.
    echo Services available at:
    echo - Backend API: http://localhost:8080
    echo - Swagger UI: http://localhost:8080/swagger-ui.html
    echo - Health Check: http://localhost:8080/actuator/health
    echo - PostgreSQL: localhost:5432
    echo - Redis: localhost:6379
    echo.
    echo To view logs: docker-compose logs -f backend
    echo To stop: run stop-docker.bat or use 'docker-compose down'
    echo.
) else (
    echo.
    echo [ERROR] Failed to start Docker containers!
    echo Please check the error messages above.
    pause
    exit /b 1
)

pause
