@echo off
echo Starting Farm ERP Backend...
cd /d "%~dp0backend"
java -jar target\erp-backend-1.0.0.jar
pause
