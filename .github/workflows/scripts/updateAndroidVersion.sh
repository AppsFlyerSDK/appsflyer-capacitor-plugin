#!/bin/bash

if [ $# -ne 2 ]; then
  echo "Usage: $0 newAndroidVersion newAndroidPluginBridgeVersion"
  exit 1
fi

newAndroidVersion=$1
newAndroidPluginBridgeVersion=$2

# Defense-in-depth: rc-release.yml's validate-release is the primary check, but this script has other/future callers.
SDK_VERSION_REGEX='^[0-9]+\.[0-9]+\.[0-9]+$'
if ! [[ "$newAndroidVersion" =~ $SDK_VERSION_REGEX ]]; then
  echo "newAndroidVersion '$newAndroidVersion' does not match $SDK_VERSION_REGEX"
  exit 1
fi
if ! [[ "$newAndroidPluginBridgeVersion" =~ $SDK_VERSION_REGEX ]]; then
  echo "newAndroidPluginBridgeVersion '$newAndroidPluginBridgeVersion' does not match $SDK_VERSION_REGEX"
  exit 1
fi

echo "pwd: $(pwd)"
echo "New Android SDK Version: $newAndroidVersion"
echo "New Android Plugin Bridge (af-android-plugin-bridge) Version: $newAndroidPluginBridgeVersion"
echo "Updating Package.json file"
sed -i -r -e "s/\"androidSdkVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"androidSdkVersion\": \"$newAndroidVersion\"/gi" package.json
# af-android-plugin-bridge is pinned on its own field, independent of the af-android-sdk-bom import above; android/build.gradle reads both dynamically.
sed -i -r -e "s/\"androidPluginBridgeVersion\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"androidPluginBridgeVersion\": \"$newAndroidPluginBridgeVersion\"/gi" package.json
echo "Updating README.md file"
sed -i -r -e "s/Android AppsFlyer SDK \*\*[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\*\*/\Android AppsFlyer SDK **$newAndroidVersion**/gi" README.md
git add package.json README.md
