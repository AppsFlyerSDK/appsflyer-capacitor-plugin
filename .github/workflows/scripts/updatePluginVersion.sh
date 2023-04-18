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
echo "Updating AppsFlyerPlugin.swift file"
sed -i -r -e "s/APPSFLYER_PLUGIN_VERSION = \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/APPSFLYER_PLUGIN_VERSION = \"$newPluginVersion\"/gi" ios/Plugin/AppsFlyerPlugin.swift
echo "Updating Package.json file"
sed -i -r -e "s/\"version\": \"[0-9]+.[0-9]+.[0-9]+(-rc[0-9]+)?\"/\"version\": \"$newPluginVersion\"/gi" package.json
git add AppsFlyerPlugin.swift package.json