#!/bin/bash

# Check that there are two arguments
if [ $# -ne 1 ]; then
  echo "Usage: $0 newAndroidVersion"
  exit 1
fi

# Assign arguments to variables
newAndroidVersion=$1

# Output the arguments
echo "pwd: $(pwd)"
echo "New Android SDK Version: $newAndroidVersion"
echo "Updating Package.json file"
gsed -i -r -e "s/\"androidSdkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"androidSdkVersion\": \"$newAndroidVersion\"/gi" package.json
echo "Updating README.md file"
gsed -i -r -e "s/Android AppsFlyer SDK \*\*[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\*\*/\Android AppsFlyer SDK **$newAndroidVersion**/gi" README.md
git add package.json README.md