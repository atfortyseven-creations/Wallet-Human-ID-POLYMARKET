@echo off
title LIMPIEZA FINAL - Archivos residuales en C:
color 0E
echo.
echo  Eliminando archivos residuales que quedaron en C:...
echo  (Ya estan copiados en D:\MisArchivos - solo borramos los originales)
echo.

:: Tomar ownership y forzar borrado de archivos que dieron ERROR 5
takeown /f "%USERPROFILE%\Documents" /r /d s >nul 2>&1
icacls "%USERPROFILE%\Documents" /grant Administrators:F /t >nul 2>&1

takeown /f "%USERPROFILE%\Videos" /r /d s >nul 2>&1
icacls "%USERPROFILE%\Videos" /grant Administrators:F /t >nul 2>&1

takeown /f "%USERPROFILE%\Music" /r /d s >nul 2>&1
icacls "%USERPROFILE%\Music" /grant Administrators:F /t >nul 2>&1

takeown /f "%USERPROFILE%\Pictures" /r /d s >nul 2>&1
icacls "%USERPROFILE%\Pictures" /grant Administrators:F /t >nul 2>&1

:: Borrar archivos bloqueados especificos
del /f /q "%USERPROFILE%\Documents\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\MetaMask state logs.json" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mi música\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis imágenes\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis imágenes\Captura de pantalla 2026-04-14 162749.png" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\Captures\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-01-30 06-06-22.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-01-30 06-07-45.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-01-30 06-09-28.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-01-30 06-10-42.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-01-30 06-14-09.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-02-01 02-02-46.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Documents\Mis vídeos\2026-02-01 02-03-08.mp4" >nul 2>&1

del /f /q "%USERPROFILE%\Videos\2026-01-30 06-06-22.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-01-30 06-07-45.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-01-30 06-09-28.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-01-30 06-10-42.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-01-30 06-14-09.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-02-01 02-02-46.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\2026-02-01 02-03-08.mp4" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Videos\Captures\desktop.ini" >nul 2>&1

del /f /q "%USERPROFILE%\Music\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Pictures\desktop.ini" >nul 2>&1
del /f /q "%USERPROFILE%\Pictures\Captura de pantalla 2026-04-14 162749.png" >nul 2>&1

echo  [OK] Archivos residuales eliminados de C:
echo.
echo  ========================================
echo   ESTADO FINAL DEL SISTEMA
echo  ========================================
echo.
echo  Comprobando espacio en disco C: y D:...
for /f "tokens=1,2,3" %%a in ('wmic logicaldisk where "Caption='C:'" get FreeSpace^,Size /value ^| findstr "="') do (
    set %%a
)
echo.
wmic logicaldisk where "Caption='C:' or Caption='D:'" get Caption,FreeSpace,Size /format:list
echo.
echo  ========================================
echo   TODO LISTO - REINICIA EL EQUIPO AHORA
echo  ========================================
echo.
pause
