# ─── AppsFlyer Capacitor Plugin — E2E Runner ────────────────────────────────
#
# Thin wrapper around scripts/af-scenario-runner.sh (same runner CI uses via
# .github/workflows/ios-e2e.yml / android-e2e.yml) that also makes sure a
# simulator/emulator is actually up before the runner needs one — the runner
# itself just errors out if none is booted.
#
# Usage:
#   make e2e-ios          Boot a simulator if needed, build, run E2E
#   make e2e-android      Boot an emulator if needed, build, run E2E
#   make e2e-all          Both platforms
#   make e2e-ios PHASE=phase_2 VERBOSE=1   Single phase, verbose
#   make report           Show latest report
#   make clean            Remove build artifacts and reports

SHELL := /bin/bash
RUNNER := scripts/af-scenario-runner.sh
PLAN := .af-e2e/test-plan.json

PHASE ?=
VERBOSE ?=
_PHASE_FLAG := $(if $(PHASE),--phase $(PHASE),)
_VERBOSE_FLAG := $(if $(VERBOSE),--verbose,)

# ─── iOS ────────────────────────────────────────────────────────────────────

.PHONY: ensure-ios-sim
ensure-ios-sim:
	@if xcrun simctl list devices booted -j | jq -e '.devices | to_entries[] | .value[] | select(.state=="Booted")' >/dev/null 2>&1; then \
		echo "iOS simulator already booted."; \
	else \
		echo "No booted iOS simulator, booting one..."; \
		UDID=$$(xcrun simctl list devices available -j | jq -r \
			'.devices | to_entries[] | select(.key | test("iOS-(1[7-9]|[2-9][0-9])")) | .value[] | select(.name | test("iPhone")) | .udid' | head -1); \
		test -n "$$UDID" || { echo "Error: no available iPhone simulator found."; exit 1; }; \
		xcrun simctl boot "$$UDID"; \
		open -a Simulator --args -CurrentDeviceUDID "$$UDID"; \
		xcrun simctl bootstatus "$$UDID" -b; \
	fi

.PHONY: e2e-ios
e2e-ios: ensure-ios-sim
	$(RUNNER) --platform ios --plan $(PLAN) --build $(_PHASE_FLAG) $(_VERBOSE_FLAG)

# ─── Android ────────────────────────────────────────────────────────────────

# ANDROID_HOME/ANDROID_SDK_ROOT are frequently unset in interactive shells
# even when Android Studio and the SDK are installed (they're normally only
# exported from .zshrc, which `make` doesn't source). Fall back to the
# default install locations so this works out of the box.
ANDROID_SDK := $(or $(ANDROID_HOME),$(ANDROID_SDK_ROOT),$(HOME)/Library/Android/sdk)
ADB := $(ANDROID_SDK)/platform-tools/adb
EMULATOR := $(ANDROID_SDK)/emulator/emulator
# Gradle (invoked by af-scenario-runner.sh's build_cmd) needs ANDROID_HOME in
# its own environment, not just as a Make variable — export it to children.
export ANDROID_HOME := $(ANDROID_SDK)

# Capacitor 8's android module requires JDK 21 (matches CI's zulu 21 in
# android-e2e.yml) — a stray JDK 17 on PATH fails compileDebugJavaWithJavac
# with an opaque "invalid source release: 21". Prefer JDK 21 if installed,
# regardless of what a plain `java` on PATH resolves to.
# `java_home -v 21` silently falls back to whatever JVM is installed instead
# of failing when no 21 is present, so verify the version directly. Also
# check Homebrew's keg-only openjdk@21 (`brew install openjdk@21`), which
# isn't registered with java_home until manually symlinked into
# /Library/Java/JavaVirtualMachines (that symlink step needs sudo).
JAVA_21_CANDIDATES := $(shell /usr/libexec/java_home -V 2>&1 | grep -oE '/Library/Java/JavaVirtualMachines/[^ ]*/Contents/Home') /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
JAVA_21_HOME := $(shell for h in $(JAVA_21_CANDIDATES); do "$$h/bin/java" -version 2>&1 | grep -q '"21\.' && echo "$$h" && break; done)
ifneq ($(JAVA_21_HOME),)
export JAVA_HOME := $(JAVA_21_HOME)
endif

.PHONY: ensure-android-emu
ensure-android-emu:
	@test -n "$(JAVA_21_HOME)" || { echo "Error: JDK 21 not found. Install it: brew install --cask zulu@21"; exit 1; }
	@test -x "$(ADB)" || { echo "Error: adb not found at $(ADB). Set ANDROID_HOME or install the SDK."; exit 1; }
	@if "$(ADB)" devices | awk 'NR>1 && $$2=="device"{found=1} END{exit !found}'; then \
		echo "Android emulator/device already running."; \
	else \
		echo "No running Android device, booting an emulator..."; \
		test -x "$(EMULATOR)" || { echo "Error: emulator not found at $(EMULATOR). Set ANDROID_HOME or install the SDK."; exit 1; }; \
		AVD=$$("$(EMULATOR)" -list-avds | head -1); \
		test -n "$$AVD" || { echo "Error: no AVD found. Create one first (Android Studio > Device Manager)."; exit 1; }; \
		echo "Booting AVD: $$AVD"; \
		nohup "$(EMULATOR)" -avd "$$AVD" -no-snapshot -netdelay none -netspeed full >/tmp/af-emulator.log 2>&1 & \
		"$(ADB)" wait-for-device; \
		until [ "$$("$(ADB)" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 2; done; \
	fi

.PHONY: e2e-android
e2e-android: ensure-android-emu
	$(RUNNER) --platform android --plan $(PLAN) --build $(_PHASE_FLAG) $(_VERBOSE_FLAG)

# ─── Both ───────────────────────────────────────────────────────────────────

.PHONY: e2e-all
e2e-all: e2e-ios e2e-android

# ─── Utilities ──────────────────────────────────────────────────────────────

.PHONY: report
report:
	@latest=$$(ls -t .af-e2e/reports/*.json 2>/dev/null | head -1); \
	test -n "$$latest" || { echo "No reports found."; exit 1; }; \
	echo "Latest report: $$latest"; \
	python3 -m json.tool "$$latest" | head -40

.PHONY: clean
clean:
	rm -rf .af-e2e/reports/*
	rm -rf examples/qa-test-app/ios/App/build
	cd examples/qa-test-app/android && ./gradlew clean -q 2>/dev/null || true
	@echo "Cleaned build artifacts and reports."

.PHONY: help
help:
	@echo "make e2e-ios      Boot simulator if needed, build, run iOS E2E"
	@echo "make e2e-android  Boot emulator if needed, build, run Android E2E"
	@echo "make e2e-all      Both platforms"
	@echo "make report       Show latest report"
	@echo "make clean        Remove build artifacts and reports"
