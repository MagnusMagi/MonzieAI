# 🧪 Maestro E2E Tests

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end testing.

## Installation

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Or using Homebrew (macOS)
brew tap mobile-dev-inc/tap
brew install maestro
```

## Running Tests

```bash
# Run all tests
maestro test .maestro/

# Run specific test
maestro test .maestro/auth-flow.yaml

# Run on iOS simulator
maestro test .maestro/ --device "iPhone 15 Pro"

# Run on Android emulator
maestro test .maestro/ --device "Pixel 5"
```

## Test Files

- `auth-flow.yaml` - Tests authentication flow
- `image-generation-flow.yaml` - Tests image generation flow

## Writing Tests

Maestro uses YAML format for test definitions. See [Maestro Documentation](https://maestro.mobile.dev/getting-started) for more details.

Example:
```yaml
appId: com.someplanets.monzieaiv2
---
- launchApp
- assertVisible: "Home"
- tapOn: "Generate"
```

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Maestro E2E Tests
  run: |
    maestro test .maestro/
```

