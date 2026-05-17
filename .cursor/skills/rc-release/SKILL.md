---
name: rc-release
description: Describes how the RC release pipeline works for the AppsFlyer Capacitor plugin and maps each stage to its workflow file. Use when inspecting, triggering, or debugging the RC-release, npm OIDC publish, rc-smoke, promote-release, or production-release workflows; not for day-to-day plugin development.
globs: .github/workflows/rc-release.yml,.github/workflows/rc-smoke.yml,.github/workflows/promote-release.yml,.github/workflows/production-release.yml,.github/workflows/npm-publish-oidc.yml,.github/workflows/lint-test-build.yml,.github/workflows/ios-e2e.yml,.github/workflows/android-e2e.yml,.af-e2e/**,.af-smoke/**,scripts/af-scenario-runner.sh,scripts/synthesize-rc-smoke-app.sh
---

# RC release pipeline — Capacitor plugin

Use this skill when:

- You're editing any of the release workflows (`rc-release.yml`, `rc-smoke.yml`, `promote-release.yml`, `production-release.yml`, `npm-publish-oidc.yml`).
- You're debugging a red RC gate or a missing `rc-smoke/npm` check-run.
- You're about to trigger an RC and want to confirm the inputs.
- A PR asks why a stage ran (or didn't).

This skill is a thin pointer. Contract content is owned by the tooling repo.

## Sources of truth

- Contract: [tooling/contracts/rc-release-contract.md](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/rc-release-contract.md)
- E2E scenarios: [tooling/contracts/e2e-test-contract.md](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/e2e-test-contract.md)
- Smoke scenarios: [tooling/contracts/smoke-test-contract.md](https://github.com/AppsFlyerSDK/appsflyer-mobile-plugin-tooling/blob/main/contracts/smoke-test-contract.md)
- Operator manual: [`docs/RELEASE_USER_MANUAL.md`](../../../docs/RELEASE_USER_MANUAL.md)

## Stage → workflow map

| Stage | Workflow | Job or trigger |
|---|---|---|
| `RC-PREP` | [`rc-release.yml`](../../../.github/workflows/rc-release.yml) | `prepare-branch` |
| `RC-CI` | [`lint-test-build.yml`](../../../.github/workflows/lint-test-build.yml) | `workflow_call` from rc-release |
| `RC-E2E iOS` | [`ios-e2e.yml`](../../../.github/workflows/ios-e2e.yml) | `workflow_call` from rc-release |
| `RC-E2E Android` | [`android-e2e.yml`](../../../.github/workflows/android-e2e.yml) | `workflow_call` from rc-release |
| `RC-PUBLISH` | [`rc-release.yml`](../../../.github/workflows/rc-release.yml) | `publish-rc` dispatches [`npm-publish-oidc.yml`](../../../.github/workflows/npm-publish-oidc.yml) (honours `dry_run`) |
| `RC-SMOKE` | [`rc-smoke.yml`](../../../.github/workflows/rc-smoke.yml) | `workflow_run` on rc-release success or `workflow_dispatch` |
| `RC-PROMOTE` | [`promote-release.yml`](../../../.github/workflows/promote-release.yml) | `pull_request: labeled` with `pass QA ready for deploy` |
| `RC-RELEASE` | [`production-release.yml`](../../../.github/workflows/production-release.yml) | `pull_request: closed` (merged) on `main`; npm publish via [`npm-publish-oidc.yml`](../../../.github/workflows/npm-publish-oidc.yml) |

## Expected PR checks

A healthy RC PR has all of these green before promotion:

- `Lint, Test & Build`
- `iOS E2E`
- `Android E2E`
- `rc-smoke/npm` (posted by `rc-smoke.yml` after the RC is live on npm)

`promote-release.yml` verifies `rc-smoke/npm` specifically before stripping `-rcN`.

## When smoke runs vs when it doesn't

- **Runs automatically** after the RC-release workflow succeeds with `dry_run=false`.
- **Runs manually** via `workflow_dispatch` on `rc-smoke.yml` with `rc_version` + `release_branch` inputs (use for reruns).
- **Skipped** when the parent RC-release run was `dry_run=true` or failed; `rc-smoke.yml` posts a `skipped` check-run in that case.

## Secrets consumed

Names only:

| Secret | Stage | Purpose |
|---|---|---|
| `ENV_FILE` | `RC-E2E`, `RC-SMOKE` | QA app `.env` (`DEV_KEY`, `APP_ID`) |
| `CI_DEV_GITHUB_TOKEN` | `RC-PREP`, `RC-PUBLISH` (dispatch `npm-publish-oidc.yml`), `RC-PROMOTE`, `RC-SMOKE`, `RC-RELEASE` | branch push, PR ops, `workflow_dispatch` of npm publish, check_run posting |
| `CI_SLACK_WEBHOOK_URL` | `RC-PUBLISH`, `RC-SMOKE` (failure), `RC-PROMOTE` (failure), `RC-RELEASE` | Slack webhook for `slackapi/slack-github-action@v1` |
| `CI_JIRA_EMAIL`, `CI_JIRA_TOKEN` | `RC-PUBLISH`, `RC-RELEASE` | Jira REST API basic auth for `fixVersion=Capacitor SDK v<base_version>` lookup |
| `CI_JIRA_DOMAIN` (optional) | `RC-PUBLISH`, `RC-RELEASE` | Jira tenant override; defaults to `appsflyer.atlassian.net` |

Both `RC-PUBLISH` and `RC-RELEASE` publish by dispatching [`npm-publish-oidc.yml`](../../../.github/workflows/npm-publish-oidc.yml) (`workflow_dispatch`), which runs `npm publish --provenance` with `id-token: write`. npm allows one trusted publisher workflow name per package; configure npmjs.com for **`npm-publish-oidc.yml` only** (not `rc-release.yml` / `production-release.yml`). `CI_DEV_GITHUB_TOKEN` must be able to trigger workflow runs (e.g. `actions: write` on a classic PAT, or equivalent on a fine-grained token).

CI commits in `RC-PREP` and `RC-PROMOTE` are authored as `github-actions[bot] <github-actions[bot]@users.noreply.github.com>` via inline `git config`. No per-person secrets are used.

## Do not

- Do not add new release stages to CI that are not documented in the tooling `rc-release-contract.md`.
- Do not bypass `promote-release.yml` by pushing a version-strip commit directly to the release branch.
- Do not republish the same RC version; bump to `rcN+1` and rerun.
- Do not duplicate contract text in this skill; link to the tooling repo.
