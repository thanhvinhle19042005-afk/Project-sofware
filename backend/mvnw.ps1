# Maven Wrapper Script
# This file is used by Maven Wrapper to download and execute Maven

$MAVEN_VERSION = "3.9.6"
$MAVEN_DOWNLOAD_URL = "https://dlcdn.apache.org/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
$MAVEN_HOME = "$HOME\.m2\wrapper\maven-$MAVEN_VERSION"

if (!(Test-Path $MAVEN_HOME)) {
    Write-Host "Downloading Maven $MAVEN_VERSION..."
    $tempFile = New-TemporaryFile
    Invoke-WebRequest -Uri $MAVEN_DOWNLOAD_URL -OutFile "$tempFile.zip"
    Expand-Archive -Path "$tempFile.zip" -DestinationPath "$HOME\.m2\wrapper"
    Remove-Item "$tempFile.zip"
    Move-Item "$HOME\.m2\wrapper\apache-maven-$MAVEN_VERSION" $MAVEN_HOME
}

& "$MAVEN_HOME\bin\mvn.cmd" $args
