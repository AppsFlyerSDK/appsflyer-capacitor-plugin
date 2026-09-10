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
source "$(dirname "$0")/version-format.sh"

if ! [[ "$newPluginVersion" =~ $VERSION_FINAL_REGEX || "$newPluginVersion" =~ $VERSION_RC_CAPTURE_REGEX ]]; then
  echo "Error: '$newPluginVersion' does not match expected version format ($VERSION_FINAL_REGEX or $VERSION_RC_CAPTURE_REGEX)" >&2
  exit 1
fi

# perl (not sed -r, used elsewhere in these scripts) because VERSION_SUFFIX_BUILD's literal "+"
# needs backslash-escaping whose ERE handling differs between BSD sed (macOS) and GNU sed (CI/Linux).
perl -pi -e "s/\"version\": \"${VERSION_CORE}(${VERSION_SUFFIX_RC}|${VERSION_SUFFIX_BUILD})?\"/\"version\": \"$newPluginVersion\"/g" package.json
git add package.json