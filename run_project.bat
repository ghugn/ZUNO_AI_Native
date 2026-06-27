:: run_project.bat
@echo off

:: Ensure we are in the project root
cd /d "%~dp0"

:: Start backend server in a new window
start "Backend" cmd /k "cd backend && npm install && npm run build && npm run start"

:: Start frontend server in a new window
start "Frontend" cmd /k "cd frontend && npm install && npm run build && npm run start"

:: Optional: keep this script window open
pause
