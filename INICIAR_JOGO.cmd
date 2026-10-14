@echo off
setlocal
title Imperio do Queijo - Servidor local
cd /d "%~dp0"
if errorlevel 1 goto directory_error

where node.exe >nul 2>nul
if errorlevel 1 goto node_error
where npm.cmd >nul 2>nul
if errorlevel 1 goto node_error

if not exist "node_modules\vite\bin\vite.js" (
    echo Instalando as dependencias do jogo. Aguarde...
    call npm.cmd ci --cache "%~dp0.npm-cache"
    if errorlevel 1 goto install_error
)

echo.
echo Iniciando Imperio do Queijo e abrindo o navegador...
echo Endereco fixo: http://127.0.0.1:5173/
echo Se o jogo ja estiver em execucao, o navegador abrira essa mesma instancia.
echo Mantenha esta janela aberta enquanto utiliza o jogo.
echo Para encerrar o servidor, pressione Ctrl+C ou feche esta janela.
echo.
call npm.cmd run start
if errorlevel 1 goto start_error
exit /b 0

:directory_error
echo ERRO: Nao foi possivel acessar a pasta do jogo.
pause
exit /b 1

:node_error
echo ERRO: Node.js e npm precisam estar instalados e disponiveis no PATH.
echo Instale uma versao LTS compativel de Node.js em https://nodejs.org/
echo Depois, execute este arquivo novamente.
pause
exit /b 1

:install_error
echo ERRO: A instalacao falhou. Confira a conexao e a mensagem acima.
pause
exit /b 1

:start_error
echo ERRO: O servidor nao iniciou corretamente. Confira a mensagem acima.
pause
exit /b 1
