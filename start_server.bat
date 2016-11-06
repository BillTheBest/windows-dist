setlocal
cd /d %~dp0


SET DATA_ROOT=data
SET MONGO_PREFIX=_MONGO
SET "MONGO_DATA=%DATA_ROOT%\%MONGO_PREFIX%"

SET RUN_HIDDEN="TRUE"


taskkill /f /im nginx-windows.exe
taskkill /f /im php-cgi.exe
taskkill /f /im server.exe
taskkill /f /im mongod-windows.exe


REM :: Start PHP-fastcgi on port 9000
RunHiddenConsole php\php-cgi.exe -b 0.0.0.0:9011 -c php\php.ini

REM :: Start NGINX - WEB-Server
start /b nginx.exe

REM Delete lock file
del "%MONGO_DATA%\mongod.lock"

REM :: Start Mongo-DB for device server
start /b mongo\mongod-windiws.exe --quiet --dbpath %MONGO_DATA% --storageEngine=mmapv1

REM :: Start the Device - Server

cd server/windows
start /b server.exe
cd ..\..\