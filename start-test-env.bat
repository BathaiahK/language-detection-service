@echo off
echo Building service...
call npm run build

echo.
echo Starting test environment...
docker compose -f docker-compose.test.yml up -d

echo.
echo Waiting for services to be healthy...
timeout /t 30 /nobreak

echo.
echo Checking service status...
docker compose -f docker-compose.test.yml ps

echo.
echo Testing service health...
curl http://localhost:3101/health

echo.
echo ========================================
echo Test environment is ready!
echo.
echo To run tests: npm run test:e2e
echo To stop:      docker compose -f docker-compose.test.yml down -v
echo ========================================
