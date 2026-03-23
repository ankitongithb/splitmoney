@REM Maven Wrapper Script (Windows)
@echo off
SET MAVEN_VERSION=3.9.6
SET MAVEN_HOME=%USERPROFILE%\.m2\wrapper\maven-%MAVEN_VERSION%

IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Apache Maven %MAVEN_VERSION%...
    mkdir "%MAVEN_HOME%"
    powershell -Command "Invoke-WebRequest -Uri 'https://downloads.apache.org/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%TEMP%\maven.zip'; Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%TEMP%\maven_extract' -Force; xcopy /E /I /Y '%TEMP%\maven_extract\apache-maven-%MAVEN_VERSION%\*' '%MAVEN_HOME%'"
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
