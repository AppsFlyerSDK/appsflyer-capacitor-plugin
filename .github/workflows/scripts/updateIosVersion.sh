#!/bin/bash

# Check that there are two arguments
if [ $# -ne 1 ]; then
  echo "Usage: $0 newIosVersion"
  exit 1
fi

# Assign arguments to variables
newIosVersion=$1

# Output the arguments
echo "pwd: $(pwd)"
echo "New iOS SDK Version: $newIosVersion"
echo "Updating Package.json file"
sed -i -r -e "s/\"iosSdkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"iosSdkVersion\": \"$newIosVersion\"/gi" package.json
echo "Updating README.md file"
sed -i -r -e "s/iOS AppsFlyer SDK \*\*[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\*\*/\iOS AppsFlyer SDK **$newIosVersion**/gi" README.md
git add package.json README.md