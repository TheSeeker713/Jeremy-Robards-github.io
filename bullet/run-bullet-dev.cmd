@echo off
REM Double-clickable wrapper to start the Bullet Note dev server.
REM Move this file to Desktop and double-click it to run (it calls the PS script in the project folder).

REM Adjust these paths if you move files around
set PROJECT_DIR=G:\DEV\Coding Projects\bullet note taking app
set PS_SCRIPT=%PROJECT_DIR%\run-dev.ps1

echo Starting Bullet Note dev server for project:
echo %PROJECT_DIR%

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -ProjectDir "%PROJECT_DIR%"

pause
