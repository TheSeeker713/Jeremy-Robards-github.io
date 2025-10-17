@echo off
REM Portfolio Development Server Launcher
REM Starts both Decap CMS server and Python HTTP server, then opens admin panel

echo ======================================
echo  Portfolio Dev Server Starting...
echo ======================================
echo.

REM Start Decap CMS server in a new window
echo Starting Decap CMS server on port 8081...
start "Decap CMS Server" cmd /k "cd /d "%~dp0" && npx decap-server"

REM Wait a moment for decap-server to initialize
timeout /t 3 /nobreak > nul

REM Start Python HTTP server in a new window
echo Starting Python HTTP server on port 8000...
start "Python HTTP Server" cmd /k "cd /d "%~dp0" && python -m http.server 8000"

REM Wait for HTTP server to start
timeout /t 3 /nobreak > nul

REM Open admin panel in Firefox
echo Opening Content Manager in Firefox...
start firefox "http://localhost:8000/admin/"

echo.
echo ======================================
echo  Servers are running!
echo ======================================
echo  - Decap CMS: http://localhost:8081
echo  - Website: http://localhost:8000
echo  - Admin: http://localhost:8000/admin/
echo ======================================
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul
