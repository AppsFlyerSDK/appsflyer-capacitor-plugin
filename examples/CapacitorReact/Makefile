.PHONY: help build sync run-ios run-android open-ios open-android install clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "%-14s %s\n", $$1, $$2}'

install: ## npm install
	npm install

build: ## Build web assets + sync into native projects
	npm run rebuild

ios: ## Add ios platform if missing
	test -d ios || npm run addIos

android: ## Add android platform if missing
	test -d android || npm run addAndroid

run-ios: build ios ## Build and run on iOS simulator (boots one if none running)
	xcrun simctl bootstatus booted -b 2>/dev/null || open -a Simulator
	npx cap run ios

run-android: build android ## Build and run on Android emulator (boots one if none running)
	adb get-state 1>/dev/null 2>&1 || $$ANDROID_HOME/emulator/emulator -avd $$(ls $$ANDROID_HOME/../avd 2>/dev/null | sed 's/\.avd$$//' | head -1) &
	npx cap run android

clean: ## Remove native platforms and build output
	rm -rf ios android build
