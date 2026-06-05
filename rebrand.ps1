$root = "D:\Projects\Wallet Human Polymarket ID"
$extensions = @("*.tsx","*.ts","*.json","*.html","*.css","*.md")
$exclude = @("node_modules",".next",".git","rebrand.ps1")

$files = Get-ChildItem -Path $root -Recurse -Include $extensions | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($ex in $exclude) {
        if ($path -like "*$ex*") { $skip = $true; break }
    }
    -not $skip
}

$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # All variants of the old brand name
    $content = $content -replace "WHALE ALERT NETWORK", "WHALE NETWORK"
    $content = $content -replace "Whale Alert Network", "Whale Network"
    $content = $content -replace "WHALE ALERT PRO", "WHALE NETWORK PRO"
    $content = $content -replace "Whale Alert Pro", "Whale Network Pro"
    $content = $content -replace "whale-alert-pro", "whale-network"
    $content = $content -replace "whale_alert_network", "whale_network"
    $content = $content -replace "WhaleAlertPro", "WhaleNetworkPro"
    $content = $content -replace "WhaleAlertNetwork", "WhaleNetwork"

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Rebranded: $($file.FullName)"
        $count++
    }
}

Write-Host ""
Write-Host "Done! Rebranded $count files."
