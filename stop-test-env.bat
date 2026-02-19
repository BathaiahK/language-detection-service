@echo off
echo Stopping test environment...
docker compose -f docker-compose.test.yml down -v
echo Test environment stopped!
