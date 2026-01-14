@echo off
REM Batch file to clean, build, and serve MkDocs documentation site

echo ========================================
echo MkDocs Clean, Build, and Serve
echo ========================================
echo.

REM Change to the script's directory
cd /d "%~dp0"

REM Step 1: Clean
echo [1/3] Cleaning build artifacts...
if exist "site" (
    echo Removing site directory...
    rmdir /s /q "site"
    echo Site directory removed.
) else (
    echo Site directory does not exist, skipping...
)

if exist ".cache" (
    echo Removing .cache directory...
    rmdir /s /q ".cache"
    echo .cache directory removed.
)

echo Clean complete.
echo.

REM Step 2: Build
echo [2/3] Building MkDocs site...
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
    mkdocs build
) else (
    echo Virtual environment not found, using system Python...
    mkdocs build
)

if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo Build complete.
echo.

REM Step 3: Serve
echo [3/3] Starting MkDocs server...
echo.
echo Site will be available at: http://127.0.0.1:8000
echo Press Ctrl+C to stop the server.
echo.

if exist "venv\Scripts\activate.bat" (
    mkdocs serve
) else (
    mkdocs serve
)

pause
