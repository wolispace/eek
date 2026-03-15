@echo off
:: read in my local settings that sets vars like: set PHP_PATH="W:\My Drive\Apps\php7\php.exe"
call _env.bat

start "" http://localhost:8080/index.html

start "" %PHP_PATH% -S localhost:8080
pause
