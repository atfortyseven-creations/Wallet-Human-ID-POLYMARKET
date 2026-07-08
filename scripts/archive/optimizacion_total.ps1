# ============================================================
#  SCRIPT DE OPTIMIZACION TOTAL DEL SISTEMA - BY ANTIGRAVITY
#  Ejecutar como ADMINISTRADOR
#  Requisito: Disco D: con espacio disponible
# ============================================================

$ErrorActionPreference = "SilentlyContinue"
$LOG = "C:\optimizacion_log.txt"
function Log($msg) { $ts = Get-Date -Format "HH:mm:ss"; "$ts | $msg" | Tee-Object -FilePath $LOG -Append }

Log "====== INICIO DE OPTIMIZACION TOTAL ======"

# PASO 0: Verificar discos
Log "Analizando discos..."
$C = Get-PSDrive C
$D = Get-PSDrive D
$C_Free_Before = [math]::Round($C.Free/1GB, 2)
$D_Free = [math]::Round($D.Free/1GB, 2)
Log "C: Libre=$C_Free_Before GB | D: Libre=$D_Free GB"

if ($D_Free -lt 30) {
    Log "ERROR: El disco D no tiene suficiente espacio libre ($D_Free GB). Se necesitan al menos 30 GB."
    Write-Host "ERROR: El disco D necesita al menos 30 GB libres. Tiene $D_Free GB." -ForegroundColor Red
    exit 1
}

# PASO 1: LIMPIEZA PROFUNDA DE C:
Log "--- PASO 1: LIMPIEZA DE ARCHIVOS TEMPORALES Y BASURA ---"

# Vaciar Papelera de Reciclaje
$shell = New-Object -ComObject Shell.Application
$shell.Namespace(0xA).Items() | ForEach-Object { Remove-Item $_.Path -Recurse -Force }
Log "Papelera vaciada."

# Carpetas de temporales del sistema
$paths = @(
    "$env:TEMP",
    "$env:SystemRoot\Temp",
    "$env:SystemRoot\Prefetch",
    "$env:SystemRoot\SoftwareDistribution\Download",
    "$env:SystemDrive\Windows\Logs\CBS",
    "$env:LOCALAPPDATA\Temp",
    "$env:SystemRoot\Minidump",
    "$env:LOCALAPPDATA\CrashDumps"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Get-ChildItem -Path $p -Recurse -Force | Remove-Item -Recurse -Force
        Log "Limpiado: $p"
    }
}

# Caches de navegadores
$browserCaches = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Mozilla\Firefox\Profiles",
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Cache"
)
foreach ($bc in $browserCaches) {
    if (Test-Path $bc) {
        Get-ChildItem -Path $bc -Recurse -Force | Remove-Item -Recurse -Force
        Log "Cache navegador limpiado: $bc"
    }
}

# Limpiar Windows Update cache
Stop-Service -Name wuauserv -Force
Remove-Item "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force
Start-Service -Name wuauserv
Log "Cache de Windows Update limpiada."

# Eliminar Windows.old si existe (puede ser 10-20 GB)
if (Test-Path "C:\Windows.old") {
    Remove-Item "C:\Windows.old" -Recurse -Force
    Log "Carpeta Windows.old eliminada."
}

# Limpieza de disco integrada de Windows
Start-Process cleanmgr.exe -ArgumentList "/sagerun:1" -Wait
Log "Limpieza de disco ejecutada."

# PASO 2: DESHABILITAR HIBERNACION (libera hiberfil.sys ~4-8GB)
Log "--- PASO 2: DESHABILITAR HIBERNACION ---"
powercfg -h off
Log "Hibernacion deshabilitada. hiberfil.sys eliminado."

# PASO 3: MOVER CARPETAS DE USUARIO A D:
Log "--- PASO 3: REDIRECCIONANDO CARPETAS DE USUARIO A D: ---"

$userFolders = @{
    "Desktop"   = [System.Environment]::GetFolderPath("Desktop")
    "Documents" = [System.Environment]::GetFolderPath("MyDocuments")
    "Downloads" = "$env:USERPROFILE\Downloads"
    "Music"     = [System.Environment]::GetFolderPath("MyMusic")
    "Pictures"  = [System.Environment]::GetFolderPath("MyPictures")
    "Videos"    = [System.Environment]::GetFolderPath("MyVideos")
}

foreach ($folderName in $userFolders.Keys) {
    $srcPath = $userFolders[$folderName]
    $dstPath = "D:\$folderName"

    if (-not (Test-Path $dstPath)) {
        New-Item -ItemType Directory -Path $dstPath -Force | Out-Null
    }

    if (Test-Path $srcPath) {
        $sizeGB = [math]::Round((Get-ChildItem $srcPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB, 2)
        Log "Moviendo '$folderName' ($sizeGB GB) a '$dstPath'..."
        robocopy "$srcPath" "$dstPath" /E /MOVE /R:1 /W:1 /NP /LOG+:$LOG | Out-Null

        # Redirigir en registro de Windows
        $regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders"
        $regKeyUser = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders"

        $shellNames = @{
            "Desktop"   = "Desktop"
            "Documents" = "Personal"
            "Downloads" = "{374DE290-123F-4565-9164-39C4925E467B}"
            "Music"     = "My Music"
            "Pictures"  = "My Pictures"
            "Videos"    = "My Video"
        }

        if ($shellNames.ContainsKey($folderName)) {
            $keyName = $shellNames[$folderName]
            Set-ItemProperty -Path $regKey -Name $keyName -Value $dstPath
            Set-ItemProperty -Path $regKeyUser -Name $keyName -Value $dstPath
        }

        Log "OK: '$folderName' movido a D:\"
    }
}

# PASO 4: MOVER PAGEFILE A D: (libera 4-16 GB en C)
Log "--- PASO 4: MOVER PAGEFILE A D: ---"
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put() | Out-Null
$currentPF = Get-WmiObject -Query "SELECT * FROM Win32_PageFileSetting"
foreach ($pf in $currentPF) { $pf.Delete() }
Set-WmiInstance -Class Win32_PageFileSetting -Arguments @{
    Name        = "D:\pagefile.sys"
    InitialSize = 4096
    MaximumSize = 8192
} | Out-Null
Log "Pagefile movido a D:\pagefile.sys (4-8GB). Requiere reinicio."

# PASO 5: REDUCIR PUNTOS DE RESTAURACION
Log "--- PASO 5: REDUCIR RESTAURACION DEL SISTEMA ---"
vssadmin resize shadowstorage /for=C: /on=C: /maxsize=3%
Get-WmiObject Win32_ShadowCopy | Sort-Object InstallDate | Select-Object -SkipLast 1 | ForEach-Object { $_.Delete() }
Log "Shadow storage reducido al 3% en C:"

# PASO 6: OPTIMIZACION DE RENDIMIENTO
Log "--- PASO 6: OPTIMIZACION DE RENDIMIENTO ---"

# Efectos visuales: rendimiento
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects"
if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
Set-ItemProperty -Path $regPath -Name "VisualFXSetting" -Value 2
Log "Efectos visuales ajustados para maximo rendimiento."

# Eliminar del inicio: apps pesadas conocidas
$startupKeys = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
)
$knownJunk = @("OneDrive", "Spotify", "Discord", "Teams", "Skype", "AdobeUpdater", "GoogleUpdate")
foreach ($key in $startupKeys) {
    foreach ($app in $knownJunk) {
        if (Get-ItemProperty -Path $key -Name $app -ErrorAction SilentlyContinue) {
            Remove-ItemProperty -Path $key -Name $app -Force
            Log "Eliminado del inicio: $app"
        }
    }
}

# Deshabilitar servicios innecesarios
$servicesToDisable = @(
    "DiagTrack",        # Telemetria Microsoft
    "dmwappushservice", # WAP Push
    "SysMain",          # Superfetch (picos de disco)
    "XblAuthManager",   # Xbox Live
    "XblGameSave",      # Xbox Save
    "XboxNetApiSvc",    # Xbox Red
    "MapsBroker"        # Mapas offline
)
foreach ($svc in $servicesToDisable) {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($s) {
        Stop-Service -Name $svc -Force
        Set-Service -Name $svc -StartupType Disabled
        Log "Servicio deshabilitado: $svc"
    }
}

# PASO 7: TEMPERATURA GPU/CPU
Log "--- PASO 7: OPTIMIZACION TEMPERATURA GPU/CPU ---"

# Power Throttling: Activar (reduce calor en procesos de fondo)
$throttlePath = "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling"
if (-not (Test-Path $throttlePath)) { New-Item -Path $throttlePath -Force | Out-Null }
Set-ItemProperty -Path $throttlePath -Name "PowerThrottlingOff" -Value 0
Log "Power Throttling activado - reduce calor en procesos de fondo."

# Plan de energia Equilibrado (mejor balance rendimiento/temperatura vs Alto Rendimiento)
powercfg -setactive SCHEME_BALANCED
Log "Plan de energia Equilibrado activado (mejor gestion de temperatura)."

# PASO 8: OPTIMIZAR DISCO
Log "--- PASO 8: OPTIMIZANDO DISCO C: ---"
$diskInfo = Get-PhysicalDisk | Select-Object -First 1
if ($diskInfo.MediaType -eq "SSD" -or $diskInfo.MediaType -eq "NVMe") {
    defrag C: /U /V /L
    Log "SSD/NVMe detectado: TRIM ejecutado."
} else {
    defrag C: /U /V
    Log "HDD detectado: Desfragmentacion ejecutada."
}

# PASO 9: LIMPIEZA RED Y DNS
Log "--- PASO 9: OPTIMIZACION RED ---"
ipconfig /flushdns | Out-Null
netsh winsock reset | Out-Null
Log "DNS limpiado y Winsock reseteado."

# RESULTADO FINAL
Log "--- RESULTADO FINAL ---"
$C_After = Get-PSDrive C
$C_Free_After = [math]::Round($C_After.Free/1GB, 2)
$GananciaGB = [math]::Round($C_Free_After - $C_Free_Before, 2)
Log "C: Espacio libre ANTES:  $C_Free_Before GB"
Log "C: Espacio libre AHORA:  $C_Free_After GB"
Log "Espacio recuperado en C: +$GananciaGB GB"
Log "====== OPTIMIZACION COMPLETADA - REINICIA EL EQUIPO ======"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   OPTIMIZACION COMPLETADA!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " C: Antes:   $C_Free_Before GB libres" -ForegroundColor Yellow
Write-Host " C: Ahora:   $C_Free_After GB libres" -ForegroundColor Green
Write-Host " Ganancia:  +$GananciaGB GB" -ForegroundColor Green
Write-Host ""
Write-Host " Log completo: C:\optimizacion_log.txt" -ForegroundColor White
Write-Host ""
Write-Host " >> REINICIA EL EQUIPO para aplicar todos los cambios <<" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Cyan
