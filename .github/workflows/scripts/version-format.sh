# Single source of truth for this repo's version-string shapes. Source this
# (`source .github/workflows/scripts/version-format.sh`) instead of
# re-typing these patterns — a future suffix-scheme change (already
# happened once: -N -> +N) only needs updating here.
#
# Consumed by: promote-release.yml, production-release.yml,
# updatePluginVersion.sh, and rc-release.yml's notify-team job (its
# Jira base-version step) — all of these already have the repo checked
# out before they validate a version string.
#
# NOT consumed by rc-release.yml's validate-release job or rc-smoke.yml's
# decide job: both intentionally fail fast on a bad workflow_dispatch input
# *before* paying for a checkout, so sourcing this file isn't available to
# them yet. They keep their own copy of the pattern in sync by hand, in a
# variable named VERSION_REGEX — grep for VERSION_REGEX across
# .github/workflows/ when this file's suffix patterns change.
VERSION_CORE='[0-9]+\.[0-9]+\.[0-9]+'
VERSION_SUFFIX_RC='-rc[0-9]+'
VERSION_SUFFIX_BUILD='\+[0-9]+'

# A final, publishable version: clean X.Y.Z, or a hotfix build X.Y.Z+N.
VERSION_FINAL_REGEX="^${VERSION_CORE}(${VERSION_SUFFIX_BUILD})?\$"
# An -rcN candidate, capturing the base X.Y.Z for the promote step's strip.
VERSION_RC_CAPTURE_REGEX="^(${VERSION_CORE})${VERSION_SUFFIX_RC}\$"
