@echo off
setlocal ENABLEDELAYEDEXPANSION

REM =============================================
REM CHRIST ERP - Helper Script (Windows)
REM Usage:
REM   run.bat setup   -> Install deps + create tables (+ optional fix)
REM   run.bat start   -> Start server (production)
REM   run.bat dev     -> Start server (development, auto-restart)
REM   run.bat all     -> setup + start
REM =============================================

IF "%1"=="" GOTO :help

IF /I "%1"=="setup" GOTO :setup
IF /I "%1"=="start" GOTO :start
IF /I "%1"=="dev"   GOTO :dev
IF /I "%1"=="all"   GOTO :all
GOTO :help

:setup
echo === Installing npm dependencies ===
call npm install || GOTO :error

echo === Creating database tables (npm run setup-db) ===
call npm run setup-db || GOTO :error

echo === Optional: Fixing ERPLogin schema and seeding users (node fix-database.js) ===
IF EXIST fix-database.js (
  node fix-database.js || echo (Skipping fix; you can run it manually if needed.)
) ELSE (
  echo (No fix-database.js found; skipping.)
)

echo === Setup completed successfully ===
GOTO :eof

:start
echo === Starting server (production) ===
call npm start
GOTO :eof

:dev
echo === Starting server (development, auto-restart) ===
call npm run dev
GOTO :eof

:all
call "%~f0" setup || GOTO :error
call "%~f0" start
GOTO :eof

:help
echo.
echo Usage:
echo   run.bat setup   ^> Install deps + create tables (+ optional fix)
echo   run.bat start   ^> Start server (production)
echo   run.bat dev     ^> Start server (development, auto-restart)
echo   run.bat all     ^> setup + start
echo.
echo After start, open: http://localhost:3000
echo   Login:     http://localhost:3000/login.html
echo   Register:  http://localhost:3000/register.html
GOTO :eof

:error
echo.
echo [ERROR] Command failed. See messages above.
exit /b 1
