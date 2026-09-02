#!/bin/bash
set -euo pipefail

# Package.swift pins two SPM packages that must resolve to a compatible pair:
# appsflyer-apple-rpc (auto-bumped by updateIosVersion.sh) and
# AppsFlyerFramework-Static (not auto-bumped — see the comment in Package.swift).
# They're allowed to diverge in general, so this isn't a "must match" check —
# it's a known-good-pairs allowlist. Add a line here whenever a new pairing is
# validated; a pin combination not listed fails the build instead of shipping
# silently mismatched.
#
# ponytail: hardcoded table, not a constraint-solver — there's exactly one
# known-good pairing today. Extend the table if/when that stops being true.
KNOWN_GOOD_PAIRS=(
  "7.0.13:7.0.2"
)

rpcVersion=$(grep -o 'appsflyer-apple-rpc\.git", exact: "[0-9.]*' Package.swift | grep -o '[0-9.]*$')
frameworkVersion=$(grep -o 'AppsFlyerFramework-Static\.git", exact: "[0-9.]*' Package.swift | grep -o '[0-9.]*$')

echo "appsflyer-apple-rpc: $rpcVersion"
echo "AppsFlyerFramework-Static: $frameworkVersion"

for pair in "${KNOWN_GOOD_PAIRS[@]}"; do
  if [ "$pair" = "${rpcVersion}:${frameworkVersion}" ]; then
    echo "OK: known-good pin pair"
    exit 0
  fi
done

echo "FAIL: appsflyer-apple-rpc $rpcVersion + AppsFlyerFramework-Static $frameworkVersion is not a known-good pairing."
echo "If this pairing was validated intentionally, add \"$rpcVersion:$frameworkVersion\" to KNOWN_GOOD_PAIRS in this script."
exit 1
