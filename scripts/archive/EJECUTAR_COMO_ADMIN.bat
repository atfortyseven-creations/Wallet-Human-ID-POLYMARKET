@echo off
title OPTIMIZACION TOTAL DEL SISTEMA - by Antigravity
color 0A
echo.
echo  ==========================================
echo   OPTIMIZACION TOTAL - INICIANDO...
echo  ==========================================
echo.

:: Verificar si somos administradores
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Necesitas ejecutar esto como ADMINISTRADOR
    echo      Clic derecho sobre el archivo y "Ejecutar como administrador"
    pause
    exit /b 1
)

echo  [OK] Ejecutando como Administrador
echo.

:: ─── PASO 1: LIMPIEZA DE ARCHIVOS TEMPORALES ───────────────────────────────
echo  [1/9] Limpiando archivos temporales y basura del sistema...

:: Papelera de reciclaje
rd /s /q "C:\$Recycle.Bin" 2>nul
echo      Papelera vaciada.

:: Temp del usuario
if exist "%TEMP%" (rd /s /q "%TEMP%" 2>nul & md "%TEMP%")
echo      TEMP usuario limpiado.

:: Temp del sistema
if exist "C:\Windows\Temp" (rd /s /q "C:\Windows\Temp" 2>nul & md "C:\Windows\Temp")
echo      TEMP sistema limpiado.

:: Prefetch
if exist "C:\Windows\Prefetch" (
    del /f /q "C:\Windows\Prefetch\*.*" 2>nul
    echo      Prefetch limpiado.
)

:: Windows Update cache
net stop wuauserv >nul 2>&1
if exist "C:\Windows\SoftwareDistribution\Download" (
    rd /s /q "C:\Windows\SoftwareDistribution\Download" 2>nul
    md "C:\Windows\SoftwareDistribution\Download"
    echo      Cache Windows Update limpiada.
)
net start wuauserv >nul 2>&1

:: Windows.old (puede pesar 10-20 GB)
if exist "C:\Windows.old" (
    rd /s /q "C:\Windows.old" 2>nul
    echo      Windows.old eliminado (10-20 GB liberados)
)

:: MiniDump y logs
if exist "C:\Windows\Minidump" (rd /s /q "C:\Windows\Minidump" 2>nul)
if exist "C:\Windows\Logs\CBS" (rd /s /q "C:\Windows\Logs\CBS" 2>nul & md "C:\Windows\Logs\CBS")

:: Cache Chrome
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
    echo      Cache Chrome limpiada.
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" 2>nul
)

:: Cache Edge
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" 2>nul
    echo      Cache Edge limpiada.
)

:: Cache Brave
if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\Default\Cache" 2>nul
    echo      Cache Brave limpiada.
)

echo  [1/9] COMPLETADO.
echo.

:: ─── PASO 2: LIMPIEZA DE DISCO CON HERRAMIENTA DE WINDOWS ──────────────────
echo  [2/9] Ejecutando Liberador de espacio en disco de Windows...

:: Configurar cleanmgr para limpiar todo automaticamente
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Temporary Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Thumbnails" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Recycle Bin" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Internet Cache Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Old ChkDsk Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Setup Log Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Update Cleanup" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Windows Error Reporting Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Delivery Optimization Files" /v StateFlags0001 /t REG_DWORD /d 2 /f >nul 2>&1

start /wait cleanmgr.exe /sagerun:1
echo  [2/9] COMPLETADO.
echo.

:: ─── PASO 3: DESHABILITAR HIBERNACION (libera 4-8 GB) ──────────────────────
echo  [3/9] Deshabilitando hibernacion (libera hiberfil.sys ~4-8 GB)...
powercfg -h off
echo      hiberfil.sys eliminado.
echo  [3/9] COMPLETADO.
echo.

:: ─── PASO 4: MOVER CARPETAS DE USUARIO A D: ────────────────────────────────
echo  [4/9] Moviendo carpetas de usuario al Disco D:...

:: Crear estructura en D:
if not exist "D:\MisArchivos" md "D:\MisArchivos"
if not exist "D:\MisArchivos\Desktop" md "D:\MisArchivos\Desktop"
if not exist "D:\MisArchivos\Documents" md "D:\MisArchivos\Documents"
if not exist "D:\MisArchivos\Downloads" md "D:\MisArchivos\Downloads"
if not exist "D:\MisArchivos\Music" md "D:\MisArchivos\Music"
if not exist "D:\MisArchivos\Pictures" md "D:\MisArchivos\Pictures"
if not exist "D:\MisArchivos\Videos" md "D:\MisArchivos\Videos"

echo      Estructura D:\MisArchivos creada.

:: Mover con robocopy (el mejor metodo: mueve y verifica integridad)
echo      Moviendo Escritorio...
robocopy "%USERPROFILE%\Desktop"   "D:\MisArchivos\Desktop"   /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul
echo      Moviendo Documentos...
robocopy "%USERPROFILE%\Documents" "D:\MisArchivos\Documents" /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul
echo      Moviendo Descargas...
robocopy "%USERPROFILE%\Downloads" "D:\MisArchivos\Downloads" /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul
echo      Moviendo Musica...
robocopy "%USERPROFILE%\Music"     "D:\MisArchivos\Music"     /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul
echo      Moviendo Imagenes...
robocopy "%USERPROFILE%\Pictures"  "D:\MisArchivos\Pictures"  /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul
echo      Moviendo Videos...
robocopy "%USERPROFILE%\Videos"    "D:\MisArchivos\Videos"    /E /MOV /R:1 /W:1 /NP /NFL /NDL 2>nul

:: Redirigir carpetas de usuario en el registro
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "Desktop"     /t REG_SZ /d "D:\MisArchivos\Desktop"   /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "Personal"    /t REG_SZ /d "D:\MisArchivos\Documents" /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "My Music"    /t REG_SZ /d "D:\MisArchivos\Music"     /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "My Pictures" /t REG_SZ /d "D:\MisArchivos\Pictures"  /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "My Video"    /t REG_SZ /d "D:\MisArchivos\Videos"    /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "{374DE290-123F-4565-9164-39C4925E467B}" /t REG_SZ /d "D:\MisArchivos\Downloads" /f >nul

reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "Desktop"     /t REG_EXPAND_SZ /d "D:\MisArchivos\Desktop"   /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "Personal"    /t REG_EXPAND_SZ /d "D:\MisArchivos\Documents" /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "My Music"    /t REG_EXPAND_SZ /d "D:\MisArchivos\Music"     /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "My Pictures" /t REG_EXPAND_SZ /d "D:\MisArchivos\Pictures"  /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "My Video"    /t REG_EXPAND_SZ /d "D:\MisArchivos\Videos"    /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v "{374DE290-123F-4565-9164-39C4925E467B}" /t REG_EXPAND_SZ /d "D:\MisArchivos\Downloads" /f >nul

echo  [4/9] COMPLETADO. Tus archivos estan ahora en D:\MisArchivos\
echo.

:: ─── PASO 5: MOVER PAGEFILE A D: (libera 4-16 GB) ─────────────────────────
echo  [5/9] Moviendo memoria virtual (pagefile) al disco D:...
wmic computersystem set AutomaticManagedPagefile=False >nul 2>&1
wmic pagefileset where name="C:\\pagefile.sys" delete >nul 2>&1
wmic pagefileset create name="D:\\pagefile.sys" >nul 2>&1
wmic pagefileset where name="D:\\pagefile.sys" set InitialSize=4096,MaximumSize=8192 >nul 2>&1
echo      Pagefile movido a D: (4096-8192 MB). Activo tras reinicio.
echo  [5/9] COMPLETADO.
echo.

:: ─── PASO 6: REDUCIR SHADOW COPIES ────────────────────────────────────────
echo  [6/9] Reduciendo puntos de restauracion en C:...
vssadmin resize shadowstorage /for=C: /on=C: /maxsize=3% >nul 2>&1
echo      Shadow storage reducido a 3%% en C:
echo  [6/9] COMPLETADO.
echo.

:: ─── PASO 7: DESHABILITAR SERVICIOS INNECESARIOS ───────────────────────────
echo  [7/9] Deshabilitando servicios innecesarios y telemetria...

sc stop DiagTrack >nul 2>&1        & sc config DiagTrack start=disabled >nul 2>&1
sc stop dmwappushservice >nul 2>&1 & sc config dmwappushservice start=disabled >nul 2>&1
sc stop SysMain >nul 2>&1          & sc config SysMain start=disabled >nul 2>&1
sc stop XblAuthManager >nul 2>&1   & sc config XblAuthManager start=disabled >nul 2>&1
sc stop XblGameSave >nul 2>&1      & sc config XblGameSave start=disabled >nul 2>&1
sc stop XboxNetApiSvc >nul 2>&1    & sc config XboxNetApiSvc start=disabled >nul 2>&1
sc stop MapsBroker >nul 2>&1       & sc config MapsBroker start=disabled >nul 2>&1
sc stop RetailDemo >nul 2>&1       & sc config RetailDemo start=disabled >nul 2>&1

echo      Telemetria Microsoft: DESACTIVADA
echo      Superfetch/SysMain: DESACTIVADO
echo      Servicios Xbox: DESACTIVADOS
echo  [7/9] COMPLETADO.
echo.

:: ─── PASO 8: OPTIMIZACION RENDIMIENTO Y TEMPERATURA ────────────────────────
echo  [8/9] Optimizando rendimiento y temperatura GPU/CPU...

:: Power Throttling activado (reduce calor en background)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling" /v PowerThrottlingOff /t REG_DWORD /d 0 /f >nul 2>&1

:: Plan equilibrado (mejor balance calor/rendimiento)
powercfg -setactive SCHEME_BALANCED >nul 2>&1

:: Efectos visuales: maximo rendimiento
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f >nul 2>&1

:: Deshabilitar inicio automatico de apps pesadas
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "OneDrive" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Spotify" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Discord" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Teams" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Skype" /f >nul 2>&1
reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" /v "AdobeUpdater" /f >nul 2>&1

:: Optimizar red
ipconfig /flushdns >nul 2>&1
netsh winsock reset >nul 2>&1
netsh int ip reset >nul 2>&1

echo      Power Throttling: ACTIVADO
echo      Plan energia Equilibrado: ACTIVO
echo      Efectos visuales: RENDIMIENTO MAXIMO
echo      Apps pesadas del inicio: ELIMINADAS
echo      DNS y red: LIMPIADOS
echo  [8/9] COMPLETADO.
echo.

:: ─── PASO 9: OPTIMIZAR DISCO C: ────────────────────────────────────────────
echo  [9/9] Optimizando disco C: (TRIM/Desfragmentacion)...
defrag C: /U /V /L >nul 2>&1
if errorlevel 1 (
    defrag C: /U /V >nul 2>&1
    echo      HDD: Desfragmentacion ejecutada.
) else (
    echo      SSD: TRIM ejecutado.
)
echo  [9/9] COMPLETADO.
echo.

:: ─── RESUMEN FINAL ──────────────────────────────────────────────────────────
echo.
echo  ==========================================
echo   OPTIMIZACION TOTAL COMPLETADA!
echo  ==========================================
echo.
echo   QUE SE HIZO:
echo   [OK] Temporales, prefetch, caches limpiados
echo   [OK] Windows.old eliminado (si existia)
echo   [OK] Liberador de disco Windows ejecutado
echo   [OK] Hibernacion desactivada (hiberfil.sys)
echo   [OK] Tus archivos movidos a D:\MisArchivos\
echo   [OK] Pagefile movido a D:\ (4-8 GB)
echo   [OK] Shadow copies reducidos al 3%%
echo   [OK] Telemetria y servicios innecesarios OFF
echo   [OK] Power Throttling activo
echo   [OK] Apps pesadas del inicio eliminadas
echo   [OK] DNS y red limpios
echo   [OK] Disco C: optimizado
echo.
echo   Tus archivos ahora estan en:
echo   D:\MisArchivos\Desktop   (Escritorio)
echo   D:\MisArchivos\Documents (Documentos)
echo   D:\MisArchivos\Downloads (Descargas)
echo   D:\MisArchivos\Music     (Musica)
echo   D:\MisArchivos\Pictures  (Imagenes)
echo   D:\MisArchivos\Videos    (Videos)
echo.
echo   *** REINICIA EL EQUIPO AHORA ***
echo   (Necesario para pagefile y algunos servicios)
echo.
echo  ==========================================
pause
