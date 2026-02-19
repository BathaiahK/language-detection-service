@echo off
echo ========================================
echo  Starting E2E Test Environment
echo ========================================
echo.

echo Step 1: Building TypeScript code...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)
echo Build successful!
echo.

echo Step 2: Starting Docker services...
docker compose -f docker-compose.test.yml up -d
if %errorlevel% neq 0 (
    echo Docker compose failed! Make sure Docker is running.
    exit /b %errorlevel%
)
echo Docker services started!
echo.

echo Step 3: Waiting for services to be healthy (30 seconds)...
timeout /t 30 /nobreak
echo.

echo Step 4: Verifying service health...
curl -f http://localhost:3101/health
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Service health check failed. Waiting 15 more seconds...
    timeout /t 15 /nobreak
)
echo.

echo Step 5: Running E2E tests...
call npm run test:e2e
set TEST_RESULT=%errorlevel%
echo.

echo Step 6: Cleaning up Docker services...
docker compose -f docker-compose.test.yml down -v
echo.

echo ========================================
if %TEST_RESULT% equ 0 (
    echo  ✓ E2E Tests PASSED!
) else (
    echo  ✗ E2E Tests FAILED
)
echo ========================================
exit /b %TEST_RESULT%
