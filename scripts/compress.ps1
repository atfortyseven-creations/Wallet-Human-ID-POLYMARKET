Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path (Get-Location).Path "public\models\update"
$files = Get-ChildItem -Path $sourceDir -Include *.png,*.jpg,*.jpeg -Recurse

foreach ($file in $files) {
    if ($file.Extension -eq ".webp" -or $file.Name -match "-compressed\.png") { continue }
    
    $inputPath = $file.FullName
    $outputPath = [System.IO.Path]::ChangeExtension($inputPath, ".jpg")
    
    Write-Host "Processing: $($file.Name)"
    
    try {
        $bmp = [System.Drawing.Image]::FromFile($inputPath)
        
        # Calculate new dimensions if > 2560px width
        $newWidth = $bmp.Width
        $newHeight = $bmp.Height
        if ($bmp.Width -gt 2560) {
            $newWidth = 2560
            $newHeight = [int]($bmp.Height * (2560.0 / $bmp.Width))
        }
        
        $newBmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $g = [System.Drawing.Graphics]::FromImage($newBmp)
        
        # Quality settings for rendering
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($bmp, 0, 0, $newWidth, $newHeight)
        $g.Dispose()
        
        # Save as JPEG with 75% quality
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]75)
        
        $bmp.Dispose()
        
        $newBmp.Save($outputPath, $codec, $params)
        $newBmp.Dispose()
        
        # Delete original if successful
        if ($outputPath -ne $inputPath) {
            Remove-Item $inputPath -Force
        }
        
        Write-Host "-> Compressed & saved as JPG"
    } catch {
        Write-Host "-> Error processing $($file.Name): $_"
    }
}

Write-Host "Compression complete!"
