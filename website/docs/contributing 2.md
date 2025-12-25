---
sidebar_position: 13
title: Contributing
---

# Contributing to MonzieAI

Thank you for your interest in contributing to MonzieAI! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 20.18.0 or higher
- npm or yarn
- Git
- Xcode 15+ (for iOS development)
- Android Studio (for Android development)
- Expo CLI and EAS CLI

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/monzieai.git
cd monzieai

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/monzieai.git

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Fill in your API keys
# SUPABASE_URL=your_url
# SUPABASE_ANON_KEY=your_key
# FAL_API_KEY=your_key
```

## 🔄 Development Workflow

### Branching Strategy

We use Git Flow with the following branch types:

```
main          - Production-ready code
develop       - Integration branch
feature/*     - New features
bugfix/*      - Bug fixes
hotfix/*      - Emergency fixes
release/*     - Release preparation
```

### Creating a Branch

```bash
# Update your local repository
git checkout develop
git pull upstream develop

# Create a feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b bugfix/issue-number-description
```

### Making Changes

1. Make your changes in small, logical commits
2. Write/update tests for your changes
3. Ensure all tests pass
4. Update documentation if needed
5. Follow coding standards

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good: Clear naming, proper types
interface User {
  id: string;
  email: string;
  isPremium: boolean;
}

async function fetchUserProfile(userId: string): Promise<User> {
  // Implementation
}

// ❌ Bad: Poor naming, any types
interface U {
  i: any;
  e: any;
  p: any;
}

function f(id: any): any {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Functional component with proper types
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

// ❌ Bad: Class component, no types
export class Button extends Component {
  render() {
    return <TouchableOpacity onPress={this.props.onPress} />;
  }
}
```

### File Organization

```typescript
// File structure within components
MyComponent/
├── index.ts                 // Export
├── MyComponent.tsx          // Main component
├── MyComponent.styles.ts    // Styles
├── MyComponent.test.tsx     // Tests
└── types.ts                 // Types
```

### Naming Conventions

```typescript
// Components: PascalCase
HomeScreen.tsx
UserProfile.tsx
SceneCard.tsx

// Services: camelCase with 'Service' suffix
imageGenerationService.ts
analyticsService.ts

// Hooks: camelCase with 'use' prefix
useAuth.ts
useScenes.ts

// Utils: camelCase
formatDate.ts
validateEmail.ts

// Constants: UPPER_SNAKE_CASE
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const API_TIMEOUT = 30000;

// Interfaces/Types: PascalCase
interface User {}
type Scene = {};
```

### Code Style

```typescript
// Use const for constants
const API_URL = 'https://api.example.com';

// Use let for variables that change
let counter = 0;

// Prefer arrow functions
const handlePress = () => {
  console.log('Pressed');
};

// Use async/await instead of .then()
async function fetchData() {
  try {
    const data = await api.get('/data');
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Destructure props
const Component = ({ title, onPress }: Props) => {
  // Implementation
};

// Use optional chaining
const userName = user?.profile?.name;

// Use nullish coalescing
const displayName = userName ?? 'Guest';
```

### ESLint and Prettier

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format code
npm run format
```

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependencies
- **ci**: CI/CD changes
- **chore**: Other changes (maintenance, etc.)

### Examples

```bash
# Feature
git commit -m "feat(auth): add Google sign-in support"

# Bug fix
git commit -m "fix(gallery): resolve image loading issue on iOS"

# Documentation
git commit -m "docs(api): update Supabase integration guide"

# Multiple lines
git commit -m "feat(generation): add batch image generation

- Implement queue system
- Add progress tracking
- Update UI for batch operations

Closes #123"
```

### Commit Best Practices

- ✅ Write clear, concise commit messages
- ✅ Use present tense ("add feature" not "added feature")
- ✅ Limit subject line to 50 characters
- ✅ Separate subject from body with blank line
- ✅ Use body to explain what and why vs. how
- ✅ Reference issues and PRs in footer

## 🔀 Pull Request Process

### Before Submitting

```bash
# 1. Update your branch with latest develop
git checkout develop
git pull upstream develop
git checkout your-branch
git rebase develop

# 2. Run tests
npm test

# 3. Run linting
npm run lint

# 4. Check for type errors
npx tsc --noEmit

# 5. Update documentation if needed
```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing on iOS
- [ ] Manual testing on Android

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #(issue number)
```

### Code Review Process

1. **Submit PR**: Create PR from your branch to `develop`
2. **Automated Checks**: Wait for CI/CD to pass
3. **Code Review**: At least one maintainer must approve
4. **Address Feedback**: Make requested changes
5. **Approval**: Get final approval
6. **Merge**: Maintainer will merge your PR

### Review Criteria

Reviewers will check for:
- ✅ Code quality and readability
- ✅ Test coverage
- ✅ Performance impact
- ✅ Security considerations
- ✅ Documentation updates
- ✅ Consistent coding style
- ✅ No breaking changes (unless intentional)

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Unit Test Example
describe('imageGenerationService', () => {
  it('should generate image successfully', async () => {
    const params = {
      userId: 'test-user',
      sceneId: 'test-scene',
      photoUri: 'test-photo.jpg',
      gender: 'male',
    };

    const result = await imageGenerationService.generate(params);

    expect(result).toBeDefined();
    expect(result.imageUrl).toBeTruthy();
  });

  it('should throw error when user limit exceeded', async () => {
    // Test implementation
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- Focus on critical paths
- Test edge cases and error conditions
- Mock external dependencies

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing existing functionality
- Fixing bugs that affect documented behavior
- Adding new APIs or services
- Changing configuration

### Documentation Structure

```
docs/
├── README.md              # Overview
├── ARCHITECTURE.md        # System architecture
├── API.md                 # API reference
├── SETUP.md               # Setup guide
├── DEPLOYMENT.md          # Deployment guide
└── ...
```

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep it up-to-date
- Cross-reference related docs

## 🐛 Issue Reporting

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check documentation and troubleshooting guide
3. Try to reproduce the issue
4. Gather relevant information

### Bug Report Template

```markdown
## Bug Description
A clear description of the bug

## To Reproduce
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Platform: iOS/Android
- OS Version: 
- App Version: 
- Device: 

## Screenshots
[Add screenshots if applicable]

## Additional Context
Any other relevant information
```

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this work?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Any other relevant information
```

## 🎯 Areas for Contribution

### High Priority

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✅ Test coverage
- ♿ Accessibility improvements
- 🌍 Internationalization

### Medium Priority

- ✨ New features (discuss first)
- ⚡ Performance optimizations
- 🎨 UI/UX enhancements
- 📱 Platform support (Android)

### Good First Issues

Look for issues labeled:
- `good first issue`
- `beginner friendly`
- `documentation`
- `help wanted`

## 💡 Tips for Contributors

### Communication

- Be responsive to feedback
- Ask questions if unclear
- Keep discussions professional
- Update your PR status

### Best Practices

- Start small with first contribution
- Focus on one thing per PR
- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow existing code style

### Getting Help

- Check documentation first
- Ask in discussions or issues
- Join community channels
- Contact maintainers

## 📞 Contact

- **Email**: dev@monzieai.com
- **GitHub Issues**: [Create an issue](https://github.com/yourorg/monzieai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/monzieai/discussions)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to MonzieAI! 🎉

---

**Last Updated**: 2024
**Version**: 1.0.0