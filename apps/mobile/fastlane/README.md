fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build iOS and upload to TestFlight

### ios build_only

```sh
[bundle exec] fastlane ios build_only
```

Build iOS IPA only (no upload)

### ios adhoc

```sh
[bundle exec] fastlane ios adhoc
```

Build iOS IPA with AdHoc signing for testing distribution

### ios build_release

```sh
[bundle exec] fastlane ios build_release
```

Build iOS IPA with app-store signing (no upload)

----


## Android

### android apk

```sh
[bundle exec] fastlane android apk
```

Build Android Release APK

### android aab

```sh
[bundle exec] fastlane android aab
```

Build Android AAB (for Play Store)

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
