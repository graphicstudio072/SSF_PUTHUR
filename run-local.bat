@echo off
title SSF PUTHUR SECTOR - Localhost Launcher
echo ========================================================
echo   Starting SSF PUTHUR SECTOR Portal (Localhost)
echo ========================================================
echo.

REM 1. Start Backend Server in a new window
echo Starting Backend Server on http://localhost:5000 ...
start "SSF Puthur Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm start"

REM Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

REM 2. Start Frontend Vite Server in a new window
echo Starting Frontend Client on http://localhost:5173 ...
start "SSF Puthur Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================================
echo   Local Servers Launched Successfully!
echo.
echo   Public Registration: http://localhost:5173
echo   Admin Dashboard:     http://localhost:5173/admin
echo   Default Admin PIN:   7860
echo ========================================================
echo.
pause
