@echo off
setlocal EnableDelayedExpansion

:: ️  SOVEREIGN VAULT DAEMON (PRO-ACTIVE MANAGER)
:: -----------------------------------------------
:: This script manages the "System Vault" which captures 
:: blockchain and security telemetry from the cloud to your local storage.

TITLE SOVEREIGN VAULT - ACTIVE MONITOR
COLOR 0B
mode con: cols=85 lines=25

:: Change Current Working Directory to the location of this script
cd /d "%~dp0"

:BANNER
cls
echo =================================================================================
echo   WHALE ALERT NETWORK: SOVEREIGN VAULT DAEMON (V1.1 - ELITE)
echo =================================================================================
echo.

:: 1. CHECK FOR NODE.JS
echo [SYSTEM] Verifying terminal dependencies...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed or NOT in your PATH.
    echo Please install Node from https://nodejs.org/ to proceed.
    pause
    exit /b
)

:: 2. LOAD CONFIGURATION (From local .env if exists)
echo [SYSTEM] Checking for vault configuration...
set "VAULT_PORT=7007"
set "VAULT_SECRET=SOVEREIGN_QUANTUM_KEY_777"

if exist ".env" (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="VAULT_PORT" set "VAULT_PORT=%%b"
        if "%%a"=="SOVEREIGN_VAULT_SECRET" set "VAULT_SECRET=%%b"
    )
    echo [SYSTEM] Configuration loaded from .env
) else (
    echo [SYSTEM] .env not found. Using institutional defaults.
)

:: 3. PREPARE COLD STORAGE
echo [SYSTEM] Auditing vault-storage directory...
if not exist "vault-storage" (
    echo [SYSTEM] Generating new cold storage vault...
    mkdir "vault-storage"
)

:: 4. EXECUTION
echo ---------------------------------------------------------------------------------
echo [SYSTEM] Starting System Vault Receiver...
echo [STATUS] PORT: %VAULT_PORT%
echo [STATUS] DAEMON: scripts\vault-daemon.js
echo [STATUS] MODE: LISTENING FOR CLOUD TELEPORTATION
echo.
echo [ADVICE] Keep this window open for 24/7 autonomous data persistence.
echo ---------------------------------------------------------------------------------
echo.

set "SOVEREIGN_VAULT_SECRET=%VAULT_SECRET%"
set "VAULT_PORT=%VAULT_PORT%"

:RUN
:: Si existe la versión TypeScript, lanzarla con TSX. Si no, lanzar la versión JS nativa.
if exist "scripts\vault-daemon.ts" (
    npx tsx scripts\vault-daemon.ts
) else (
    node scripts\vault-daemon.js
)

if %errorlevel% neq 0 (
    echo.
    echo [ALERT] Daemon crashed or connection error. 
    echo [SYSTEM] Restarting in 5 seconds...
    timeout /t 5 >nul
    goto RUN
)

pause
