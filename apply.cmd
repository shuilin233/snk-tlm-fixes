@echo off
setlocal EnableExtensions
rem =====================================================================
rem  SNK food patch  ::  health_boost -> absorption
rem
rem  Usage:
rem      apply.cmd "D:\Games\PCL\MyInstance\versions\MyVersion"
rem      apply.cmd /revert "D:\...\MyVersion"
rem      set FORCE=1 && apply.cmd "D:\...\MyVersion"
rem
rem  The path argument may be:
rem      - the version-isolated folder that directly contains the .js file
rem      - an instance root  (looks into .\kubejs and .\versions\*)
rem  Reads/writes:  kubejs\startup_scripts\registry\Item_food_effect.js
rem  Restart Minecraft after applying - startup scripts load once at launch.
rem =====================================================================

set "EXPECTED=7429701408500b9d5fb2692c8d692841c64c5f16fc2cdc4572cbbacac4811fe2"
set "PATCHED=67b1f92a831b5255b33781dda8e2d6cc89e1d43907598d562dd19041326be903"
set "REL=kubejs\startup_scripts\registry\Item_food_effect.js"
set "SELF=%~dp0"

set "MODE=apply"
if /i "%~1"=="/revert" (
    set "MODE=revert"
    shift
)

set "ARG=%~1"
if "%ARG%"=="" (
    echo [ERROR] No instance path given.
    echo         apply.cmd "C:\path\to\instance-or-version-folder"
    goto :fail
)

set "TARGET="
if exist "%ARG%\Item_food_effect.js"                          set "TARGET=%ARG%"
if not defined TARGET if exist "%ARG%\%REL%"                  set "TARGET=%ARG%\kubejs\startup_scripts\registry"
if not defined TARGET for /d %%V in ("%ARG%\versions\*") do (
    if not defined TARGET if exist "%%V\%REL%" set "TARGET=%%V\kubejs\startup_scripts\registry"
)
if not defined TARGET if exist "%ARG%\..\%REL%"              set "TARGET=%ARG%\..\kubejs\startup_scripts\registry"

if not defined TARGET (
    echo [ERROR] Could not find %REL% under: %ARG%
    echo         Pass the version-isolated folder ^(the one that contains kubejs^) directly.
    goto :fail
)

set "FILE=%TARGET%\Item_food_effect.js"
echo [i] target file : %FILE%

call :hash "%FILE%" H
if not defined H goto :hashfail
echo [i] sha256      : %H%

if /i "%MODE%"=="revert" goto :do_revert

:do_apply
if /i "%H%"=="%PATCHED%" (
    echo [OK] Already patched. Nothing to do.
    goto :end
)
if /i not "%H%"=="%EXPECTED%" (
    echo [ERROR] File does not match the known original - it was modified by someone else.
            echo         Expected : %EXPECTED%
            echo         Found    : %H%
    echo         Refusing to overwrite. Re-read README.md, or set FORCE=1 if you are sure.
    if /i not "%FORCE%"=="1" goto :fail
    echo [WARN] FORCE=1 - continuing anyway.
)
if not exist "%SELF%files\Item_food_effect.js" (
    echo [ERROR] files\Item_food_effect.js missing next to this script.
    goto :fail
)
copy /y "%FILE%" "%FILE%.pre-snk.bak" >nul
if errorlevel 1 goto :copyfail
copy /y "%SELF%files\Item_food_effect.js" "%FILE%" >nul
if errorlevel 1 goto :copyfail
echo [OK] Backup written: Item_food_effect.js.pre-snk.bak
echo [OK] Patched. Restart Minecraft to load the new startup script.
goto :end

:do_revert
if /i not "%H%"=="%PATCHED%" if /i "%FORCE%" neq "1" (
    echo [ERROR] Current file is not the patched version. Set FORCE=1 to override.
    goto :fail
)
if not exist "%FILE%.pre-snk.bak" (
    echo [ERROR] No Item_food_effect.js.pre-snk.bak found - cannot revert.
    goto :fail
)
copy /y "%FILE%.pre-snk.bak" "%FILE%" >nul
if errorlevel 1 goto :copyfail
echo [OK] Reverted from Item_food_effect.js.pre-snk.bak. Restart Minecraft.
goto :end

:hash
set "OUT="
set "H="
for /f "usebackq skip=1 tokens=*" %%L in (`certutil -hashfile %1 SHA256`) do if not defined H set "H=%%L"
if defined H set "H=%H: =%"
exit /b 0

:hashfail
echo [ERROR] certutil could not hash the file. Is the path readable?
goto :fail

:copyfail
echo [ERROR] Copy failed - is the game running, or the folder read-only?
:fail
endlocal
exit /b 1

:end
endlocal
exit /b 0
