#!/bin/bash

# Check that there are two arguments
if [ $# -ne 4 ]; then
  echo "Usage: $0 pluginVersion=<pluginVersion> buildNumber=<buildNumber> iOSVersion=<iOSVersion> androidVersion=<androidVersion> "
  exit 1
fi

# Assign arguments to variables
pluginVersion=$(echo $1| cut -d'=' -f 2)
buildNumber=$(echo $2| cut -d'=' -f 2)
iOSVersion=$(echo $3| cut -d'=' -f 2)
androidVersion=$(echo $4| cut -d'=' -f 2)

echo "pluginVersion: $pluginVersion"
echo "buildNumber: $buildNumber"
echo "iOSVersion: $iOSVersion"
echo "androidVersion: $androidVersion"

./.github/workflows/scripts/updatePluginVersion.sh $pluginVersion
./.github/workflows/scripts/updateBuildNumber.sh $buildNumber
./.github/workflows/scripts/updateIosVersion.sh $iOSVersion
./.github/workflows/scripts/updateAndroidVersion.sh $androidVersion

# run from project root
#./.github/workflows/scripts/updatePlugin.sh pluginVersion=6.10.5 buildNumber=120 iOSVersion=6.10.3 androidVersion=6.10.6
