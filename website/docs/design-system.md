---
sidebar_position: 16
title: Design System
description: MonzieAI Design System - Colors, Typography, Components, and Guidelines
---

# Design System

The MonzieAI design system provides a comprehensive set of design standards, components, and guidelines to ensure consistency across all documentation and user interfaces.

## Design Philosophy

### Minimalist & Clean
Our design philosophy emphasizes:
- **Clarity**: Clear visual hierarchy and readable typography
- **Simplicity**: Clean layouts with purposeful white space
- **Consistency**: Uniform patterns and predictable interactions
- **Accessibility**: WCAG 2.1 AA compliant designs
- **Performance**: Lightweight, optimized animations

---

## Color System

### Primary Colors

Our primary color palette uses subtle purple tones:

```css
/* Light Mode */
--ifm-color-primary: #6366f1;          /* Primary */
--ifm-color-primary-dark: #4f46e5;     /* Hover states */
--ifm-color-primary-darker: #4338ca;   /* Active states */
--ifm-color-primary-darkest: #3730a3;  /* Dark accents */
--ifm-color-primary-light: #818cf8;    /* Light accents */
--ifm-color-primary-lighter: #a5b4fc;  /* Very light */
--ifm-color-primary-lightest: #c7d2fe; /* Backgrounds */
```

```css
/* Dark Mode */
--ifm-color-primary: #818cf8;
--ifm-color-primary-dark: #6366f1;
--ifm-color-primary-light: #a5b4fc;
```

### Semantic Colors

```css
--ifm-color-success: #10b981;  /* Green - Success states */
--ifm-color-info: #3b82f6;     /* Blue - Information */
--ifm-color-warning: #f59e0b;  /* Orange - Warnings */
--ifm-color-danger: #ef4444;   /* Red - Errors */
```

### Neutral Colors

```css
/* Light Mode */
--ifm-background-color: #ffffff;
--ifm-background-surface-color: #f9fafb;
--ifm-card-background-color: #ffffff;

/* Text Colors */
--ifm-font-color-base: #1f2937;        /* Primary text */
--ifm-color-emphasis-700: #374151;     /* Secondary text */
--ifm-color-emphasis-600: #4b5563;     /* Tertiary text */
--ifm-color-emphasis-500: #6b7280;     /* Placeholder text */
--ifm-color-emphasis-400: #9ca3af;     /* Disabled text */
--ifm-color-emphasis-300: #d1d5db;     /* Borders */
--ifm-color-emphasis-200: #e5e7eb;     /* Dividers */
--ifm-color-emphasis-100: #f3f4f6;     /* Hover backgrounds */
```

### Usage Guidelines

**Do's:**
- ✅ Use primary colors for CTAs and interactive elements
- ✅ Use semantic colors for status indicators
- ✅ Maintain sufficient contrast ratios (4.5:1 minimum)
- ✅ Use emphasis colors for text hierarchy

**Don'ts:**
- ❌ Don't use bright, saturated colors
- ❌ Don't mix too many colors in one section
- ❌ Don't use color as the only indicator of state

---

## 📝 Typography

### Font Families

```css
/* Sans-serif - Body text */
--ifm-font-family-base: 
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
  'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 
  'Segoe UI Emoji';

/* Monospace - Code */
--ifm-font-family-monospace: 
  'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
  Consolas, 'Courier New', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 2.25rem (36px) | 700 | 1.2 | -0.02em |
| H2 | 1.75rem (28px) | 600 | 1.3 | -0.01em |
| H3 | 1.375rem (22px) | 600 | 1.4 | -0.01em |
| H4 | 1.125rem (18px) | 600 | 1.4 | normal |
| Body | 1rem (16px) | 400 | 1.7 | normal |
| Small | 0.9375rem (15px) | 400 | 1.6 | normal |
| Caption | 0.875rem (14px) | 500 | 1.5 | normal |
| Code | 0.9em | 400 | 1.6 | normal |

### Font Weights

```css
--ifm-font-weight-light: 300;
--ifm-font-weight-normal: 400;
--ifm-font-weight-medium: 500;
--ifm-font-weight-semibold: 600;
--ifm-font-weight-bold: 700;
```

### Usage Examples

```markdown
# H1 Heading - Page Titles
## H2 Heading - Section Titles
### H3 Heading - Subsections
#### H4 Heading - Minor Sections

Body text with **bold emphasis** and *italic style*.

`inline code` for technical terms.
```

---

## Spacing System

### Base Unit: 4px

All spacing follows an 8-point grid system (multiples of 4px):

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 5rem;     /* 80px */
```

### Spacing Guidelines

| Use Case | Value | Example |
|----------|-------|---------|
| Between elements | 1rem (16px) | Paragraph spacing |
| Section padding | 2-5rem (32-80px) | Page sections |
| Component padding | 0.5-2rem (8-32px) | Cards, buttons |
| Inline spacing | 0.25-0.5rem (4-8px) | Icon spacing |

---

## 🔲 Border Radius

```css
--ifm-global-radius: 8px;          /* Default */
--ifm-button-border-radius: 6px;   /* Buttons */
--ifm-card-border-radius: 12px;    /* Cards */
--ifm-code-border-radius: 4px;     /* Code blocks */
```

### Usage

- **Small elements** (badges, pills): 4-6px
- **Medium elements** (buttons, inputs): 6-8px
- **Large elements** (cards, modals): 12-16px
- **Full round**: 50% or 9999px

---

## Shadows

### Shadow Scale

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Default elevation */
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
          0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* Medium elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* High elevation */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Highest elevation */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Usage Guidelines

- **Cards at rest**: shadow-sm or shadow
- **Cards on hover**: shadow-md
- **Modals/overlays**: shadow-lg or shadow-xl
- **Focus states**: Colored shadow with primary color

---

## 🎬 Animation System

### Timing Functions

```css
/* Ease in-out - Most common */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Ease out - Entering */
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);

/* Ease in - Exiting */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Duration Scale

```css
--duration-fast: 150ms;    /* Micro-interactions */
--duration-normal: 300ms;  /* Standard transitions */
--duration-slow: 500ms;    /* Complex animations */
--duration-slower: 800ms;  /* Scroll reveals */
```

### Standard Animations

#### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Slide In Down
```css
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale In
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Animation Guidelines

**Do's:**
- ✅ Use subtle, purposeful animations
- ✅ Keep durations under 500ms for UI elements
- ✅ Respect `prefers-reduced-motion`
- ✅ Use easing functions for natural motion

**Don'ts:**
- ❌ Don't animate everything
- ❌ Don't use long durations (>800ms) for interactions
- ❌ Don't create jarring, bouncy animations
- ❌ Don't animate on scroll without throttling

---

## 🔘 Button Components

### Primary Button

```tsx
<button className="button button--primary button--lg">
  Get Started
</button>
```

**Styles:**
- Background: `var(--ifm-color-primary)`
- Color: `white`
- Padding: `0.625rem 1.5rem`
- Border radius: `6px`
- Font weight: `500`
- Hover: Darker background, 1px translateY

### Secondary Button

```tsx
<button className="button button--secondary button--lg">
  Learn More
</button>
```

**Styles:**
- Background: `transparent`
- Border: `1.5px solid var(--ifm-color-emphasis-300)`
- Hover: Primary color border, light background

### Outline Button

```tsx
<button className="button button--outline button--primary button--lg">
  View Docs
</button>
```

**Styles:**
- Background: `transparent`
- Border: `1.5px solid var(--ifm-color-primary)`
- Color: `var(--ifm-color-primary)`
- Hover: Filled with primary color

### Button Sizes

| Size | Class | Padding | Font Size |
|------|-------|---------|-----------|
| Small | `button--sm` | 0.375rem 0.75rem | 0.875rem |
| Medium | (default) | 0.5rem 1rem | 0.9375rem |
| Large | `button--lg` | 0.625rem 1.5rem | 0.9375rem |

---

## 🎴 Card Components

### Standard Card

```tsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card description text goes here.</p>
  <a href="#">Learn more →</a>
</div>
```

**Styles:**
- Background: `var(--ifm-card-background-color)`
- Border: `1px solid var(--ifm-color-emphasis-200)`
- Border radius: `12px`
- Padding: `2rem`
- Hover: Border color change, shadow-md, translateY(-4px)

### Feature Card

```tsx
<div className="feature">
  <div className="feature__icon">🚀</div>
  <h3 className="feature__title">Feature Name</h3>
  <p className="feature__description">Description text.</p>
</div>
```

---

## Interactive Elements

### Links

```css
/* Default link */
a {
  color: var(--ifm-color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 150ms;
}

a:hover {
  border-bottom-color: var(--ifm-color-primary);
}
```

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: 2px;
}
```

### Hover Transforms

```css
/* Standard lift */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Scale on hover */
.hover-scale:hover {
  transform: scale(1.05);
}
```

---

## Badge System

### Badge Types

```tsx
<span className="badge badge--primary">New</span>
<span className="badge badge--success">Active</span>
<span className="badge badge--info">Info</span>
<span className="badge badge--warning">Beta</span>
<span className="badge badge--danger">Deprecated</span>
```

**Styles:**
- Padding: `0.25rem 0.625rem`
- Font size: `0.8125rem`
- Font weight: `500`
- Border radius: `4px`
- Border: `1px solid`

---

## Data Visualization

### Color Palette for Charts

```javascript
const chartColors = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#6b7280',
};
```

### Chart Guidelines

- Use consistent colors across charts
- Provide legends for accessibility
- Use patterns in addition to colors
- Ensure sufficient contrast

---

## 🌊 Special Effects

### Wave Divider

```tsx
<div className="wave-divider">
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86..."></path>
  </svg>
</div>
```

### Particle Background

Subtle animated particles for hero sections:
- 50 particles
- Slow movement (0.5px/frame)
- Connections within 120px
- Opacity: 0.1-0.5

### Gradient Overlays

```css
/* Subtle gradient */
background: radial-gradient(
  circle, 
  rgba(255, 255, 255, 0.1) 0%, 
  transparent 70%
);
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order

**Motion:**
- Respect `prefers-reduced-motion`
- Provide pause controls for auto-play
- Avoid seizure-inducing patterns

**Screen Readers:**
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Skip links for navigation

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
@media screen and (max-width: 768px) {
  /* Mobile styles */
}

@media screen and (max-width: 996px) {
  /* Tablet styles */
}

@media screen and (min-width: 997px) {
  /* Desktop styles */
}

@media screen and (min-width: 1200px) {
  /* Large desktop styles */
}
```

### Responsive Guidelines

- Design mobile-first
- Use relative units (rem, %, vh/vw)
- Stack columns on mobile
- Increase touch targets to 44x44px minimum
- Adjust font sizes for readability

---

## Dark Mode

### Dark Mode Colors

All colors automatically adjust in dark mode:

```css
[data-theme='dark'] {
  --ifm-background-color: #0f172a;
  --ifm-background-surface-color: #1e293b;
  --ifm-font-color-base: #f1f5f9;
  /* ... more colors */
}
```

### Dark Mode Guidelines

- Maintain 4.5:1 contrast ratio
- Use lighter primary colors
- Reduce shadow intensity
- Test all components in both modes

---

## 🧩 Component Library

### Available Components

| Component | Usage | Documentation |
|-----------|-------|---------------|
| Buttons | CTAs, actions | See Button Components |
| Cards | Content containers | See Card Components |
| Badges | Status indicators | See Badge System |
| Links | Navigation | See Interactive Elements |
| Tables | Data display | Markdown tables |
| Code Blocks | Code examples | Docusaurus default |
| Admonitions | Callouts | Docusaurus default |

---

## Code Examples

### Button with Icon

```tsx
<button className="cta-button button button--primary button--lg">
  <span>Get Started</span>
  <span className="button-icon">→</span>
</button>
```

### Animated Card

```tsx
<div className="card scroll-reveal">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

### Stats Badge

```tsx
<div className="stat-badge">
  <div className="stat-number">100+</div>
  <div className="stat-label">Features</div>
</div>
```

---

## Best Practices

### Do's ✅

1. **Consistency**: Use design system components consistently
2. **Accessibility**: Always consider keyboard and screen reader users
3. **Performance**: Optimize animations and images
4. **Spacing**: Use the spacing scale consistently
5. **Testing**: Test in both light and dark modes
6. **Responsive**: Design for mobile-first

### Don'ts ❌

1. Don't create custom colors outside the palette
2. Don't use different font families
3. Don't ignore accessibility guidelines
4. Don't create heavy animations
5. Don't hard-code pixel values
6. Don't skip responsive testing

---

## Getting Started

### Using the Design System

1. **Import CSS Variables**: Already included in `custom.css`
2. **Use Component Classes**: Apply predefined classes
3. **Follow Guidelines**: Refer to this documentation
4. **Test Thoroughly**: Check all breakpoints and themes

### Contributing

When adding new components:

1. Follow existing patterns
2. Use CSS variables
3. Support dark mode
4. Test accessibility
5. Document new components
6. Add to this guide

---

## 📚 Resources

### Design Tools

- **Figma**: Design mockups and prototypes
- **ColorBox**: Color palette generation
- **Type Scale**: Typography scale calculator
- **Contrast Checker**: WCAG compliance testing

### Code Resources

- **Docusaurus Theme**: [Documentation](https://docusaurus.io/docs/styling-layout)
- **Infima CSS**: [GitHub](https://github.com/facebookincubator/infima)
- **MDN Web Docs**: [CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Initial design system documentation
- ✅ Color palette defined
- ✅ Typography scale established
- ✅ Component library documented
- ✅ Animation system defined
- ✅ Accessibility guidelines added
- ✅ Dark mode support complete

---

## Support

For questions or suggestions about the design system:

- 📖 [Documentation](https://magnusmagi.github.io/MonzieAI/)
- 🐛 [Report Issues](https://github.com/MagnusMagi/MonzieAI/issues)
- 💬 [Discussions](https://github.com/MagnusMagi/MonzieAI/discussions)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready