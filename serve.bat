@echo off
setlocal EnableExtensions

REM Double-click helper to run serve.ps1 without PowerShell policy headaches.
REM Usage:
REM   serve.bat
REM   serve.bat rrhh.html
REM   serve.bat 8080 rrhh.html

set "PORT=5500"
set "PAGE=index.html"

if not "%~1"=="" (
  if "%~2"=="" (
    REM If arg1 is numeric -> port; else -> page
    set "_arg=%~1"
    set /a _n=%_arg% >nul 2>nul
    if errorlevel 1 (
      set "PAGE=%~1"
    ) else (
      set "PORT=%~1"
    )
  ) else (
    set "PORT=%~1"
    set "PAGE=%~2"
  )
)

set "ROOT=%~dp0"
pushd "%ROOT%" >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%serve.ps1" -Port %PORT% -Page "%PAGE%"

popd >nul
endlocal
