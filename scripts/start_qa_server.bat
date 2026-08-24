@echo off
set PG_BIN=C:\pg_tmp\pgsql\bin
set PG_DATA=C:\pg_tmp\pgdata2
set PG_PORT=5433
set DB_NAME=humanity_qa
set QA_URL=postgresql://postgres:postgres@127.0.0.1:%PG_PORT%/%DB_NAME%

echo [1] Init DB...
"%PG_BIN%\initdb.exe" -U postgres -A trust -D "%PG_DATA%" --encoding=UTF8 --locale=C

echo [2] Start PG...
start /b "%PG_BIN%\postgres.exe" -D "%PG_DATA%" -p %PG_PORT% > C:\pg_tmp\pg.log 2>&1

timeout /t 4 /nobreak

echo [3] Create DB...
"%PG_BIN%\createdb.exe" -U postgres -p %PG_PORT% %DB_NAME%

echo [4] Push schema...
set DATABASE_URL=%QA_URL%
call npx prisma db push --accept-data-loss --skip-generate

echo [5] Start Next.js with QA env...
set JWT_SECRET=qa-test-jwt-secret-do-not-use-in-production-must-be-32chars
set NEXT_PUBLIC_APP_URL=http://localhost:3000
set APP_ENV=qa
set NODE_ENV=development
call npm run dev
