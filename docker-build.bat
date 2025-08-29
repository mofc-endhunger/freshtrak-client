@echo off
REM FreshTrak Docker Build Script for Windows
REM Usage: docker-build.bat [dev|prod|test|clean]

setlocal enabledelayedexpansion

if "%1"=="" goto help

if "%1"=="dev" goto build_dev
if "%1"=="prod" goto build_prod
if "%1"=="test" goto run_tests
if "%1"=="clean" goto cleanup
if "%1"=="all" goto build_all
if "%1"=="help" goto help

echo [ERROR] Unknown command: %1
goto help

:build_dev
echo [INFO] Building development Docker image...
docker build -f Dockerfile.dev -t freshtrak:dev .
if %errorlevel% equ 0 (
    echo [SUCCESS] Development image built successfully!
) else (
    echo [ERROR] Failed to build development image
    exit /b 1
)
goto end

:build_prod
echo [INFO] Building production Docker image...
docker build -f Dockerfile -t freshtrak:prod .
if %errorlevel% equ 0 (
    echo [SUCCESS] Production image built successfully!
) else (
    echo [ERROR] Failed to build production image
    exit /b 1
)
goto end

:run_tests
echo [INFO] Running tests in container...
docker build -f Dockerfile.dev -t freshtrak:test .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build test image
    exit /b 1
)
docker run --rm freshtrak:test npm test -- --watchAll=false --passWithNoTests
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed
    exit /b 1
)
goto end

:cleanup
echo [INFO] Cleaning up Docker resources...
docker-compose down --remove-orphans
docker rmi freshtrak:dev freshtrak:prod freshtrak:test 2>nul
docker image prune -f
echo [SUCCESS] Cleanup completed!
goto end

:build_all
call :build_dev
if %errorlevel% neq 0 exit /b 1
call :build_prod
if %errorlevel% neq 0 exit /b 1
echo [SUCCESS] All images built successfully!
goto end

:help
echo FreshTrak Docker Build Script
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   dev     Build development image
echo   prod    Build production image
echo   test    Run tests in container
echo   clean   Clean up Docker resources
echo   all     Build both dev and prod images
echo   help    Show this help message
echo.
echo Examples:
echo   %0 dev      # Build development image
echo   %0 prod     # Build production image
echo   %0 test     # Run tests
echo   %0 clean    # Clean up resources
goto end

:end
endlocal
