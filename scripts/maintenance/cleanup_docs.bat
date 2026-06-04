@echo off
echo Cleaning up legacy documentation routes...

rd /s /q "app\docs\legal\cookie-policy"
rd /s /q "app\docs\legal\privacy-policy"
rd /s /q "app\docs\legal\risk-disclosure"
rd /s /q "app\docs\legal\terms-of-service"
rd /s /q "app\docs\legal\whale-code"
rd /s /q "app\docs\legal\whitepaper"

echo Legacy routes removed successfully!
echo The new [...slug] routing engine is now fully authoritative.
pause
