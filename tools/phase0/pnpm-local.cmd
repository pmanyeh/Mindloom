@echo off
rem Maploom audit helper. Uses the workspace toolchain without changing global PATH.
setlocal
set "maploomToolRoot=%~dp0..\..\.tmp\phase0-toolchain"
set "maploomNodeDir=%maploomToolRoot%\node-v24.22.1-win-x64"
set "maploomPnpmDir=%maploomToolRoot%\pnpm\node_modules\.bin"
if not exist "%maploomNodeDir%\node.exe" (
  echo Audit toolchain missing. Install Node.js ^>=22.12 and pnpm 11.0.9.
  exit /b 1
)
if not exist "%maploomPnpmDir%\pnpm.cmd" (
  echo Audit pnpm missing. Restore .tmp\phase0-toolchain or use your installed pnpm.
  exit /b 1
)
set "PATH=%maploomNodeDir%;%maploomPnpmDir%;%PATH%"
call "%maploomPnpmDir%\pnpm.cmd" %*
exit /b %errorlevel%
