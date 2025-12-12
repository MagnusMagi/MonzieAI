# iOS Build Fix: ip.txt Sandbox Error

## Problem

iOS build fails with sandbox error:
```
error: Sandbox: bash(4095) deny(1) file-write-create /Users/.../monzieai.app/ip.txt
```

## Root Cause

React Native's `react-native-xcode.sh` script tries to create an `ip.txt` file in the app bundle directory to store the Metro bundler's IP address. However, Xcode's sandbox security model prevents writing to the app bundle directory during build.

## Solution

Added `SKIP_BUNDLING_METRO_IP=1` environment variable to the build script to skip `ip.txt` file creation.

### What Changed

In `ios/monzieai.xcodeproj/project.pbxproj`, the "Bundle React Native code and images" build phase script now includes:

```bash
# Skip Metro IP file creation to avoid sandbox errors
export SKIP_BUNDLING_METRO_IP=1
```

### Impact

- **Positive**: Build will succeed without sandbox errors
- **Note**: The `ip.txt` file won't be created, but this is not critical for app functionality
- **Alternative**: If you need the IP file for development, you can manually create it or use Metro bundler's network discovery

## Verification

After this fix, the build should complete successfully. The app will still work normally - the `ip.txt` file is only used for development convenience to help iOS devices discover the Metro bundler's IP address.

## Related Files

- `ios/monzieai.xcodeproj/project.pbxproj` - Build script configuration
- `node_modules/react-native/scripts/react-native-xcode.sh` - React Native build script (line 27 creates ip.txt)

