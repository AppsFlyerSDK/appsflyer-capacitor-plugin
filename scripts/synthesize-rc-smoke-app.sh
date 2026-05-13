#!/usr/bin/env bash
#
# synthesize-rc-smoke-app.sh — Build the registry-pinned smoke app from the
# canonical QA test app.
#
# Mirrors the Flutter "example_rc_smoke" mechanic: rsyncs examples/qa-test-app/
# to examples/qa-test-app-rc-smoke/, then rewrites the smoke app's package.json
# so it depends on the published RC artifact (e.g.
# "appsflyer-capacitor-plugin": "<X.Y.Z-rcN>") instead of the local
# "file:../.." path. The smoke app is otherwise byte-for-byte identical to
# the QA test app — same auto-run flow, same logger, same deep-link scheme —
# so the same .af-smoke/rc-test-plan.json applies without modification.
#
# Usage:
#   ./scripts/synthesize-rc-smoke-app.sh <rc_version>
#
# Requirements:
#   - bash 4+
#   - jq (for in-place package.json rewrites)
#   - rsync

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <rc_version>"
  exit 1
fi

RC_VERSION="$1"
SOURCE_APP="examples/qa-test-app"
SMOKE_APP="examples/qa-test-app-rc-smoke"

if [[ ! -d "$SOURCE_APP" ]]; then
  echo "Source QA app not found at $SOURCE_APP — run from repo root."
  exit 1
fi

# Validate semver-rc shape early to prevent silent garbage in package.json.
if ! [[ "$RC_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-rc[0-9]+)?$ ]]; then
  echo "Invalid RC version: $RC_VERSION"
  echo "Expected X.Y.Z or X.Y.Z-rcN"
  exit 1
fi

echo "Synthesizing $SMOKE_APP from $SOURCE_APP for RC $RC_VERSION"

# Wipe any previous synthesis so we never carry stale node_modules or
# build outputs into the new smoke run.
rm -rf "$SMOKE_APP"

# Skip artifacts that would only get rebuilt anyway.
rsync -a \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude 'ios/App/build' \
  --exclude 'ios/App/Pods' \
  --exclude 'ios/App/Podfile.lock' \
  --exclude 'android/.gradle' \
  --exclude 'android/build' \
  --exclude 'android/app/build' \
  --exclude 'android/local.properties' \
  "$SOURCE_APP"/ "$SMOKE_APP"/

# Rewrite the dependency. file:../.. -> exact RC version on registry.
PKG_JSON="$SMOKE_APP/package.json"
if [[ ! -f "$PKG_JSON" ]]; then
  echo "Synthesized smoke app missing package.json at $PKG_JSON"
  exit 1
fi

tmp=$(mktemp)
jq --arg ver "$RC_VERSION" \
  '.dependencies["appsflyer-capacitor-plugin"] = $ver' \
  "$PKG_JSON" > "$tmp"
mv "$tmp" "$PKG_JSON"

# Rename the app so npm doesn't think it's the same package as the source app.
tmp=$(mktemp)
jq '.name = "qa-test-app-rc-smoke" | .description = "RC-smoke variant pinned to a published npm artifact."' \
  "$PKG_JSON" > "$tmp"
mv "$tmp" "$PKG_JSON"

echo "Smoke app written. Dependency now points at appsflyer-capacitor-plugin@$RC_VERSION."
echo "Next steps (for reference):"
echo "  cd $SMOKE_APP && npm install && npm run build && npx cap sync"
