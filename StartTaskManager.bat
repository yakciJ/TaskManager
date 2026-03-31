@echo off
title TaskFlow - Task Manager
echo.
echo  ========================================
echo   TaskFlow - Personal Task ^& Habit Manager
echo  ========================================
echo.

:: Check if PostgreSQL is running (optional check)
echo [1/3] Starting .NET Backend API on port 5174...
start "TaskFlow API" /min cmd /c "cd /d "%~dp0api" && dotnet run --launch-profile http"

:: Give API a moment to start
timeout /t 3 >nul

echo [2/3] Starting Next.js Frontend on port 3000...
start "TaskFlow Frontend" /min cmd /c "cd /d "%~dp0client" && npm run dev"

echo [3/3] Waiting for services to be ready...
timeout /t 6 >nul

echo.
echo  Launching TaskFlow in App Mode...
start msedge --app=http://localhost:3000 --window-size=1400,900 2>nul
if %errorlevel% neq 0 (
    start chrome --app=http://localhost:3000 --window-size=1400,900 2>nul
)
if %errorlevel% neq 0 (
    start http://localhost:3000
)

echo.
echo  TaskFlow is running!
echo  - Frontend: http://localhost:3000
echo  - API:      http://localhost:5174
echo.
echo  Close the two minimized terminal windows to stop the app.
echo.
pause
