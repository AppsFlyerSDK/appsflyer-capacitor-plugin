#!/bin/bash

# Check that there are two arguments
if [ $# -ne 1 ]; then
  echo "Usage: $0 newPluginVersion"
  exit 1
fi

# Assign arguments to variables
newPluginVersion=$1

# Output the arguments
echo "pwd: $(pwd)"
echo "New Plugin Version 1: $newPluginVersion"
# Plugin identity (name + version) is reported to native at runtime via the RPC
# setPluginInfo call, sourced from package.json's `version` at src/index.ts's
# AppsFlyerSDK construction — there is no hardcoded Swift/Kotlin version constant
# to bump post-7.0.2, so package.json is the only file this step touches.
echo "Updating Package.json file"
sed -i -r -e "s/\"version\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"version\": \"$newPluginVersion\"/gi" package.json
git add package.json