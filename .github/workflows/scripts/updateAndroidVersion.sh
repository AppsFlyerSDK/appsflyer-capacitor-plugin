#!/bin/bash

# Check that there are two arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 newAndroidVersion newAndroidPluginBridgeVersion"
  exit 1
fi

# Assign arguments to variables
newAndroidVersion=$1
newAndroidPluginBridgeVersion=$2

# Output the arguments
echo "pwd: $(pwd)"
echo "New Android SDK Version: $newAndroidVersion"
echo "New Android Plugin Bridge (af-android-plugin-bridge) Version: $newAndroidPluginBridgeVersion"
echo "Updating Package.json file"
sed -i -r -e "s/\"androidSdkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"androidSdkVersion\": \"$newAndroidVersion\"/gi" package.json
# af-android-plugin-bridge is pinned on its own package.json field, independent of the
# af-android-sdk-bom platform import above — android/build.gradle reads both dynamically
# (af_sdk_version / af_plugin_bridge_version), so bumping this field is the only step needed.
sed -i -r -e "s/\"androidPluginBridgeVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"androidPluginBridgeVersion\": \"$newAndroidPluginBridgeVersion\"/gi" package.json
echo "Updating README.md file"
sed -i -r -e "s/Android AppsFlyer SDK \*\*[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\*\*/\Android AppsFlyer SDK **$newAndroidVersion**/gi" README.md
git add package.json README.md
