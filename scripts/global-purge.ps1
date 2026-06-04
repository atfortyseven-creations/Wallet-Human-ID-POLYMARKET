$root = "c:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID"
$extensions = @("*.tsx","*.ts","*.css","*.md")
$excludeDirs = @(".next","node_modules",".git")

$files = @()
foreach ($ext in $extensions) {
    $found = Get-ChildItem -Path $root -Filter $ext -Recurse -ErrorAction SilentlyContinue
    foreach ($f in $found) {
        $skip = $false
        foreach ($ex in $excludeDirs) {
            if ($f.FullName -like "*\$ex\*") { $skip = $true; break }
        }
        if (-not $skip) { $files += $f }
    }
}

$changedCount = 0
foreach ($file in $files) {
    try {
        $lines = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $original = $lines

        $lines = $lines.Replace('#FAF9F6','#FFFFFF').Replace('#faf9f6','#FFFFFF')
        $lines = $lines.Replace('#FFFDF8','#FFFFFF').Replace('#fffdf8','#FFFFFF')
        $lines = $lines.Replace('#F8F5EE','#FFFFFF').Replace('#f8f5ee','#FFFFFF')
        $lines = $lines.Replace('#FAFAF8','#FFFFFF').Replace('#fafaf8','#FFFFFF')
        $lines = $lines -replace 'bg-slate-50(?![0-9])','bg-black/5'
        $lines = $lines -replace 'bg-stone-50(?![0-9])','bg-black/5'
        $lines = $lines -replace 'bg-zinc-50(?![0-9])','bg-black/5'

        $isApiRoute = $file.FullName -like "*\api\*"
        if (-not $isApiRoute) {
            $lines = $lines.Replace('Intelligence Matrix','Analytics Engine')
            $lines = $lines.Replace('INTELLIGENCE MATRIX','ANALYTICS ENGINE')
            $lines = $lines.Replace('Whale Intelligence','Market Analytics')
            $lines = $lines.Replace('WHALE INTELLIGENCE','MARKET ANALYTICS')
            $lines = $lines.Replace('ZKShield','Security Protocol')
            $lines = $lines.Replace('ZKSHIELD','SECURITY PROTOCOL')
            $lines = $lines.Replace('Quantum Dots (QDs)','Network Score')
            $lines = $lines.Replace('Quantum Dots','Network Score')
            $lines = $lines.Replace('QUANTUM DOTS','NETWORK SCORE')
            $lines = $lines.Replace('Cryptographic State','Account Status')
            $lines = $lines.Replace('CRYPTOGRAPHIC STATE','ACCOUNT STATUS')
            $lines = $lines.Replace('Initialize Enclave','Create Wallet')
            $lines = $lines.Replace('Generate Enclave','Create Wallet')
            $lines = $lines.Replace('Secure Enclave','Wallet')
            $lines = $lines.Replace('Cosmic Forge','Data Studio')
            $lines = $lines.Replace('COSMIC FORGE','DATA STUDIO')
        }

        if ($lines -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $lines, [System.Text.Encoding]::UTF8)
            $changedCount++
            Write-Host "FIXED: $($file.Name)"
        }
    } catch {
        Write-Host "SKIP: $($file.Name) - $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "SECOND PASS COMPLETE: $changedCount files patched" -ForegroundColor Cyan
