@echo off
REM ================================================================
REM LEDGER NETWORK - CONFIGURAR VARIABLES EN RAILWAY
REM Ejecutar DESPUES de: railway login
REM ================================================================

echo Configurando variables de entorno en Railway...

railway variables set RESEND_API_KEY=re_2WCFF29c_52it5A9G5HJvK7gwyhaSbTFc
railway variables set RESEND_FROM_EMAIL=noreply@humanidfi.com
railway variables set JWT_SECRET=cd7b4df21262bd07bc4ca3c0fbea5901dd54a5673128892a1ede52d806f173f4841663c2efe935c06299500e9277d196beb0857a40af261f4f84da8a2fe22f21

echo.
echo Verificando variables configuradas:
railway variables

echo.
echo DONE - Variables configuradas en Railway.
echo El deploy ya esta corriendo (push hecho a las 09:34).
