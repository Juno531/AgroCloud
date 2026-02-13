@echo off
echo ========================================
echo Stopping Farm ERP Docker Containers
echo ========================================
echo.

docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Docker containers stopped successfully!
    echo ========================================
    echo.
    echo To remove volumes as well, run:
    echo   docker-compose down -v
    echo.
) else (
    echo.
    echo [ERROR] Failed to stop Docker containers!
    pause
    exit /b 1
)

pause
