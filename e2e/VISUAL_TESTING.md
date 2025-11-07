# Visual Regression Testing

This document describes visual regression testing setup and usage for the FreshTrak Client application.

## Overview

Visual regression testing compares screenshots of the application to detect unintended visual changes. This helps catch UI regressions that functional tests might miss.

## How It Works

1. **Baseline Screenshots**: Initial screenshots are taken and stored as baselines
2. **Test Execution**: Tests take screenshots during execution
3. **Comparison**: New screenshots are compared to baselines
4. **Reporting**: Differences are highlighted and reported

## Setup

### Initial Setup

1. Generate baseline screenshots:
```bash
npm run test:e2e:update-snapshots
```

Or use the baseline generation script:
```bash
npx ts-node e2e/scripts/generate-baselines.ts
```

2. Commit baseline screenshots to version control

### Updating Baselines

When UI changes are intentional, update baselines:

```bash
npm run test:e2e:update-snapshots
```

## Running Visual Tests

### Run All Visual Tests

```bash
npm run test:e2e:visual
```

### Run Specific Visual Test

```bash
npx playwright test e2e/tests/visual/dashboard-visual.spec.ts
```

### Update Snapshots

```bash
npm run test:e2e:update-snapshots
```

## Visual Test Structure

Visual tests are located in `e2e/tests/visual/`:

- `dashboard-visual.spec.ts` - Dashboard visual tests
- `login-visual.spec.ts` - Login page visual tests
- `events-visual.spec.ts` - Events page visual tests
- `registration-visual.spec.ts` - Registration page visual tests
- `family-visual.spec.ts` - Family page visual tests
- `account-visual.spec.ts` - Account page visual tests

## Screenshot Comparison

### Threshold

The threshold determines how different screenshots can be before failing:

- **0.0**: Exact match required
- **0.2**: Default, allows minor differences (recommended)
- **0.5**: Allows significant differences
- **1.0**: Allows any difference

### Comparison Options

```typescript
await compareScreenshot(page, 'dashboard', {
  fullPage: true,        // Capture full page
  threshold: 0.2,        // Comparison threshold
  timeout: 10000,        // Wait timeout
});
```

## Masking Dynamic Content

Some content changes between test runs (timestamps, user data, etc.). Mask these elements:

```typescript
import { createMaskSelectors, COMMON_MASKS } from '../../utils/visual-testing';

const masks = createMaskSelectors([
  COMMON_MASKS.timestamps,
  COMMON_MASKS.dates,
  COMMON_MASKS.userNames,
]);
```

### Common Masks

- `COMMON_MASKS.timestamps` - Timestamp elements
- `COMMON_MASKS.dates` - Date elements
- `COMMON_MASKS.userNames` - User name elements
- `COMMON_MASKS.ids` - ID elements
- `COMMON_MASKS.qrCodes` - QR code elements
- `COMMON_MASKS.avatars` - Avatar images

## Best Practices

1. **Mask Dynamic Content**: Always mask timestamps, dates, and user-specific data
2. **Use Appropriate Thresholds**: Balance between catching regressions and allowing minor differences
3. **Full Page vs Element**: Use full page for layout tests, element screenshots for component tests
4. **Regular Updates**: Update baselines when UI changes are intentional
5. **Review Differences**: Always review visual differences before updating baselines

## Troubleshooting

### Tests Fail Due to Minor Differences

- Increase threshold slightly
- Check if differences are intentional
- Mask more dynamic content

### Screenshots Look Different But Should Match

- Check for timing issues (wait for networkidle)
- Verify dynamic content is masked
- Check for browser-specific rendering differences

### Baseline Screenshots Missing

- Run baseline generation script
- Check baseline directory exists
- Verify file permissions

## CI/CD Integration

Visual tests run automatically in CI/CD. To update baselines in CI:

```bash
npm run test:e2e:update-snapshots
```

**Note**: Only update baselines after intentional UI changes and code review.

## Future Enhancements

- [ ] Integration with Percy or Chromatic
- [ ] Automated baseline updates
- [ ] Visual diff highlighting
- [ ] Cross-browser visual comparison
- [ ] Responsive design visual testing

