#!/bin/bash

# Check that there are two arguments
if [ $# -ne 1 ]; then
  echo "Usage: $0 newBuildNumber"
  exit 1
fi

# Assign arguments to variables
newBuildNumber=$1

# Output the arguments
echo "pwd: $(pwd)"
echo "New iOS SDK Version 1: newBuildNumber"
echo "Updating Package.json file"
gsed -i -r -e "s/\"buildNumber\": \"[0-9]+\"/\"buildNumber\": \"$newBuildNumber\"/gi" package.json
git add package.json
