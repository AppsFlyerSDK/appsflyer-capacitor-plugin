#!/usr/bin/env bash
#
# Validates that the npm artifact contains the native files Capacitor needs.
# Use `pack` before publishing, and `dir-ios` / `dir-android` after installing
# a registry artifact in smoke tests.

set -euo pipefail

MODE="${1:-pack}"
ROOT="${2:-}"

COMMON_FILES=(
  "package.json"
  "dist/esm/index.js"
  "dist/esm/index.d.ts"
  "dist/plugin.cjs.js"
)

IOS_FILES=(
  "Package.swift"
  "AppsflyerCapacitorPlugin.podspec"
  "ios/Plugin/AppsFlyerPlugin.swift"
  "ios/Plugin/AppsFlyerAttribution.swift"
)

ANDROID_FILES=(
  "android/build.gradle"
  "android/src/main/AndroidManifest.xml"
  "android/src/main/java/capacitor/plugin/appsflyer/sdk/AppsFlyerPlugin.kt"
)

missing=()

append_required_files() {
  REQUIRED_FILES=("${COMMON_FILES[@]}")
  case "$1" in
    pack|dir-all)
      REQUIRED_FILES+=("${IOS_FILES[@]}" "${ANDROID_FILES[@]}")
      ;;
    dir-ios)
      REQUIRED_FILES+=("${IOS_FILES[@]}")
      ;;
    dir-android)
      REQUIRED_FILES+=("${ANDROID_FILES[@]}")
      ;;
    *)
      echo "Usage: $0 {pack|dir-all|dir-ios|dir-android} [package_dir]"
      exit 2
      ;;
  esac
}

append_required_files "$MODE"

if [[ "$MODE" == "pack" ]]; then
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT

  npm_config_cache="${npm_config_cache:-${NPM_CONFIG_CACHE:-/tmp/npm-cache}}" \
    npm pack --dry-run --json > "$tmp"

  for file in "${REQUIRED_FILES[@]}"; do
    if ! jq -e --arg path "$file" 'any(.[0].files[]?; .path == $path)' "$tmp" >/dev/null; then
      missing+=("$file")
    fi
  done
else
  if [[ -z "$ROOT" ]]; then
    echo "Package directory is required for $MODE"
    exit 2
  fi

  for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$ROOT/$file" ]]; then
      missing+=("$file")
    fi
  done
fi

if [[ "${#missing[@]}" -gt 0 ]]; then
  echo "::error::npm package is missing required Capacitor files:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
fi

echo "npm package file validation passed for $MODE."
