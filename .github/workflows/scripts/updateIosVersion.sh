#!/bin/bash

# Check that there are two arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 newIosVersion newIosFrameworkVersion"
  exit 1
fi

# Assign arguments to variables
newIosVersion=$1
newIosFrameworkVersion=$2

# Output the arguments
echo "pwd: $(pwd)"
echo "New iOS SDK (AppsFlyerRPC) Version: $newIosVersion"
echo "New iOS AppsFlyerFramework-Static Version: $newIosFrameworkVersion"
echo "Updating Package.json file"
sed -i -r -e "s/\"iosSdkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"iosSdkVersion\": \"$newIosVersion\"/gi" package.json
sed -i -r -e "s/\"iosFrameworkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"iosFrameworkVersion\": \"$newIosFrameworkVersion\"/gi" package.json
echo "Updating README.md file"
sed -i -r -e "s/iOS AppsFlyer SDK \*\*[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\*\*/\iOS AppsFlyer SDK **$newIosVersion**/gi" README.md
echo "Updating Package.swift SwiftPM pins"
sed -i -r -e "s|(appsflyer-apple-rpc\.git\", exact: \")[0-9]+\.[0-9]+\.[0-9]+|\1${newIosVersion}|g" Package.swift
sed -i -r -e "s|(AppsFlyerFramework-Static\.git\", exact: \")[0-9]+\.[0-9]+\.[0-9]+|\1${newIosFrameworkVersion}|g" Package.swift
echo "Updating ios/Podfile CocoaPods pin"
sed -i -r -e "s/(pod 'AppsFlyerRPC', ')[0-9]+\.[0-9]+\.[0-9]+(')/\1${newIosVersion}\2/g" ios/Podfile
git add package.json README.md Package.swift ios/Podfile