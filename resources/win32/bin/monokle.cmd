@echo off
setlocal
set MONOKLE_RUN_AS_NODE=1
"%~dp0..\monokle.exe" "%~dp0..\resources\app\out\cli.js" %*
endlocal
