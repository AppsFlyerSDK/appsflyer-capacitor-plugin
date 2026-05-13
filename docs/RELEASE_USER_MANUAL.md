# Release user manual (AppsFlyer Capacitor plugin)

One-page operator guide for cutting and shipping a release candidate. Read this end-to-end the first time; after that you'll only need steps 1 and 4-6.

The pipeline contracts live in [`appsflyer-mobile-plugin-tooling`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling). The actual release work happens here in [`appsflyer-capacitor-plugin`](https://github.com/AppsFlyerSDK/appsflyer-capacitor-plugin) via GitHub Actions; you don't need either repo checked out locally to run a release.

For contract meaning and stage IDs, see [`rc-release-contract.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/rc-release-contract.md).

## Prerequisites

- Write access to `AppsFlyerSDK/appsflyer-capacitor-plugin` on GitHub.
- Repo secrets: `ENV_FILE`, `CI_DEV_GITHUB_TOKEN`, `CI_SLACK_WEBHOOK_URL`, `CI_JIRA_EMAIL`, `CI_JIRA_TOKEN`. Optional: `CI_JIRA_DOMAIN` (defaults to `appsflyer.atlassian.net`). `ENV_FILE` must contain a valid `DEV_KEY` and `APP_ID` that launch cleanly on both platforms. CI commits are authored as `github-actions[bot]` via the workflow identity; no per-person secrets needed.
- npm trusted publishing configured on `appsflyer-capacitor-plugin` for both `rc-release.yml` and `production-release.yml`. Both workflows exchange the GitHub OIDC JWT for a per-job npm publish token; no `NPM_TOKEN` is stored in the repo.

## Step 1 — Trigger the RC workflow

1. Open the **Actions** tab → **RC Release** workflow → **Run workflow**.
2. Fill in the inputs:

   | Input | Example | Notes |
   |---|---|---|
   | `base_branch` | `develop` | Default. Override only when cutting a hotfix off `main`. |
   | `plugin_version` | `6.18.0-rc1` | Must match `^\d+\.\d+\.\d+-rc\d+$` |
   | `ios_sdk_version` | `6.17.9` | Native iOS SDK version |
   | `android_sdk_version` | `6.17.6` | Native Android SDK version |
   | `skip_unit` | `false` | Skips the lint + unit job inside Lint, Test & Build. |
   | `skip_e2e` | `false` | Skips RC-E2E iOS + Android. **Blocks publish-rc** unless `dry_run=true`. |
   | `dry_run` | `false` | Leave `true` for drills; set `false` for a real RC |

3. Click **Run workflow**. The workflow runs `validate-release`, then `prepare-branch`, `run-ci`, `run-e2e-ios`, and `run-e2e-android`. `publish-rc` waits on the pre-publish gate.

> **The release branch is frozen from this point forward.** `prepare-branch` cuts a branch like `releases/6.x.x/6.18.x/6.18.0-rc1` from `base_branch`. Every later stage (E2E, smoke, promote, production) checks out files from that branch. Pushing fixes to `develop` won't affect the in-flight RC; push to the release branch (or cherry-pick) instead.

## Step 2 — Wait for the automated gates

Four checks must go green before you do anything:

| Check | Workflow | Notes |
|---|---|---|
| `Lint, Test & Build` | `lint-test-build.yml` (via `rc-release.yml`) | ESLint, Prettier, plugin build, plus debug Android/iOS QA-app builds |
| `iOS E2E` | `ios-e2e.yml` | RC-E2E iOS gate |
| `Android E2E` | `android-e2e.yml` | RC-E2E Android gate |
| `rc-smoke/npm` | `rc-smoke.yml` | Posts only after `publish-rc` succeeds with `dry_run=false` |

- If any E2E gate fails, fix the code on the release branch and push. E2E re-runs automatically.
- If publish fails on a version collision, bump to `rcN+1` and rerun Step 1 with the new version.
- If `rc-smoke/npm` is red, the RC is broken on npm. Bump to `rcN+1`.
- If `rc-smoke/npm` is `skipped`, the parent run was a dry run or the RC isn't on npm yet. Don't apply the promote label; promotion will reject `skipped`.

## Step 3 — Review the auto-opened PR

`rc-release.yml` opens a PR from the release branch to `main` automatically after `publish-rc`. Review:

- Version bumps in `package.json`, `ios/Plugin/AppsFlyerPlugin.swift`, `Package.swift`, `README.md`.
- `CHANGELOG.md`; add the new version section if it isn't there yet.
- All four checks green on the PR head SHA.

Slack gets a ping from `notify-team` with the RC link and the Jira tickets pinned to `Capacitor SDK v<base_version>`.

## Step 4 — Apply the promote label

When everything is green, apply the label **`pass QA ready for deploy`** to the PR.

This triggers `promote-release.yml`, which:

1. Verifies `rc-smoke/npm` is `success` on the PR head SHA. A missing, in-progress, or `skipped` check fails this step with a PR comment; fix and re-apply the label.
2. Strips `-rcN` from `package.json` and `ios/Plugin/AppsFlyerPlugin.swift`.
3. Commits and pushes to the release branch.
4. Updates the PR title and body to "Ready for manual merge."

## Step 5 — Merge the PR

Two prerequisites must clear before the **Merge** button activates:

1. All workflow checks green (the four gates from Step 2 plus the `Promote Release` job).
2. PR review approval. Bot-authored commits can self-approve under typical org rulesets; human commits need a second maintainer.

When both clear, merge the PR manually. Bot merges are blocked, so a human clicks **Merge**.

## Step 6 — Confirm production publish

`production-release.yml` fires on the `main` merge commit:

- Publishes `appsflyer-capacitor-plugin@X.Y.Z` to npm with `--provenance --access public` via OIDC trusted publishing.
- Creates GitHub release `X.Y.Z`.
- Sends a Slack release notification.

Verify at <https://www.npmjs.com/package/appsflyer-capacitor-plugin> (a few minutes to index).

## Troubleshooting

### `iOS E2E` or `Android E2E` is red

1. Open the failing workflow run (`ios-e2e.yml` or `android-e2e.yml`) and download the report artifact.
2. Open the JSON report under `.af-e2e/reports/`; find the first `"status": "FAIL"` check; read its `evidence`.
3. Cross-reference the tooling [`docs/troubleshooting.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/docs/troubleshooting.md) for boot timeouts, adb flakes, simctl issues.
4. Fix the plugin source on the release branch, push. E2E re-runs automatically.

### `rc-smoke/npm` is red

1. Open the `rc-smoke.yml` run; download `rc-smoke-ios-reports` or `rc-smoke-android-reports`.
2. Check the JSON report for failing checks.
3. Typical causes: the npm RC has a genuine defect (bump to `rcN+1`), or a test-app regression shared with E2E (fix and bump).
4. After fixing, rerun Step 1 with `rc-release.yml` and the next `rcN`.

### `rc-smoke/npm` is skipped

- Parent run was `dry_run=true`: re-run Step 1 with `dry_run=false`.
- RC isn't indexed on npm yet: wait ~5 minutes and re-run `rc-smoke.yml` manually from the Actions tab with `rc_version` and `release_branch` inputs.

### When smoke is red: rcN+1 vs cherry-pick

**The RC artifact on npm is genuinely broken** (SDK regression, missing native binding, build defect):

1. Rerun Step 1 with `plugin_version=X.Y.Z-rcN+1`. npm doesn't allow republishing the same version.
2. The existing release branch gets the new version bump on top; the old RC stays on npm but is superseded.

**Only the test harness or fixture is broken** (smoke plan, scenario runner, example app behavior, workflow YAML; the published artifact is fine):

1. Push the fix directly to the release branch: `git checkout releases/6.x.x/.../X.Y.Z-rcN`, edit, commit, `git push`. Cherry-pick from `develop` if the fix already lives there.
2. Re-dispatch `rc-smoke.yml` from the Actions tab with the same `rc_version` and `release_branch` inputs.
3. Re-apply the promote label after smoke is green.

The cherry-pick path skips the rcN+1 bump and keeps the version line clean. Use it whenever the SDK code on npm itself isn't the problem.

### Rerunning smoke only

Dispatch `rc-smoke.yml` manually with:

- `rc_version`: the exact npm RC version string.
- `release_branch`: the release branch the check should be associated with.

A fresh `rc-smoke/npm` check posts on the latest commit of that branch.

### Rolling back a bad production release

Out of scope. The npm publish is immutable; a rollback is "bump the next patch release with a revert commit."

## Dry-run drill path

To exercise the pipeline without touching a real version:

1. Step 1 inputs: `plugin_version=99.99.99-rc1`, `ios_sdk_version=6.17.9`, `android_sdk_version=6.17.6`, `dry_run=true`.
2. Confirm E2E runs, `publish-rc` runs `npm publish --dry-run` (no real publish), PR is **not** opened, prerelease tag is **not** created, `rc-smoke/npm` posts `skipped`.
3. Apply the promote label and confirm it rejects with a PR comment ("rc-smoke/npm is skipped").
4. Clean up: delete the scratch release branch.

## Reference

- Stage IDs and pass criteria: [`rc-release-contract.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/rc-release-contract.md)
- Pre-publish E2E meaning: [`e2e-test-contract.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/e2e-test-contract.md)
- Post-publish smoke meaning: [`smoke-test-contract.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/smoke-test-contract.md)
- Test app behavior: [`test-app-contract.md`](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/test-app-contract.md)
