@echo off
echo Compiling Java files...

set CLASSPATH=

cd src\main\java

dir /s /B *.java > sources.txt

javac -d ..\..\..\target\classes @sources.txt

if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    del sources.txt
    exit /b 1
)

echo Compilation successful!
del sources.txt
cd ..\..\..
