@echo off
REM Sobe o Save Point completo (Backend + Frontend) com dois cliques.
REM Cada servidor abre na sua propria janela. Feche as janelas para parar.

cd /d "%~dp0"

echo Iniciando o Save Point...
echo  - Backend  em http://localhost:3001
echo  - Frontend em http://localhost:5173
echo.

start "Save Point - Backend"  cmd /k "cd Backend && npm start"
start "Save Point - Frontend" cmd /k "cd Frontend && npm run dev"

echo Pronto! As duas janelas foram abertas.
