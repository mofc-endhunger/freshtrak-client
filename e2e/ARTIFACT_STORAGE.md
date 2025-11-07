# Test Artifact Storage

This document describes how test artifacts are stored and accessed in the CI/CD pipeline.

## Artifact Types

Playwright generates several types of artifacts:

1. **HTML Reports**: Interactive test reports with detailed information
2. **JSON Results**: Machine-readable test results
3. **JUnit XML**: Standard format for CI/CD integration
4. **Screenshots**: Captured on test failures
5. **Videos**: Recorded for failed tests
6. **Traces**: Detailed execution logs for debugging

## Artifact Locations

### Local Development
- HTML Report: `playwright-report/index.html`
- Test Results: `test-results/`
- Screenshots: `test-results/*/screenshots/`
- Videos: `test-results/*/videos/`
- Traces: `test-results/*/traces/`

### CI/CD (AWS CodeBuild)
- All artifacts are collected in `test-artifacts/` directory
- Stored in CodeBuild artifacts
- Available for download from AWS Console

## Accessing Artifacts

### Local Development

View HTML report:
```bash
npm run test:e2e:report
```

Or open directly:
```bash
open playwright-report/index.html
```

### CI/CD

1. **AWS CodeBuild Console**:
   - Navigate to your build project
   - Select a build
   - Download artifacts from the Artifacts section

2. **AWS CLI**:
```bash
aws codebuild batch-get-builds --ids <build-id>
```

3. **S3** (if configured):
   - Artifacts are stored in the configured S3 bucket
   - Access via S3 console or CLI

## Artifact Retention

### Current Setup
- Artifacts are stored in CodeBuild
- Retention follows CodeBuild project settings
- Default retention: 30 days (configurable)

### Recommended Retention Policy
- **HTML Reports**: 30 days
- **Screenshots/Videos**: 30 days
- **Traces**: 14 days (larger files)
- **JSON/JUnit**: 90 days (for analytics)

## Artifact Size Management

To manage artifact sizes:

1. **Limit video recording**: Only record on failure (already configured)
2. **Limit trace collection**: Only on retry (already configured)
3. **Clean old artifacts**: Configure retention policies
4. **Compress artifacts**: Use gzip compression if needed

## S3 Storage (Optional)

To store artifacts in S3:

1. Create S3 bucket for test artifacts
2. Update buildspec.yml to upload artifacts:

```yaml
post_build:
  commands:
    - aws s3 cp test-artifacts/ s3://your-bucket/test-artifacts/$CODEBUILD_BUILD_ID/ --recursive
```

3. Configure bucket lifecycle policies for automatic cleanup

## Artifact Access URLs

If artifacts are stored in S3 with public access:

```
https://your-bucket.s3.amazonaws.com/test-artifacts/{build-id}/playwright-report/index.html
```

## Troubleshooting

### Artifacts Not Generated
- Check test execution completed
- Verify output directories exist
- Check disk space in CI environment

### Artifacts Too Large
- Reduce video/trace collection
- Compress artifacts before upload
- Use artifact retention policies

### Cannot Access Artifacts
- Verify CodeBuild project permissions
- Check S3 bucket permissions (if used)
- Ensure artifacts are included in buildspec.yml

