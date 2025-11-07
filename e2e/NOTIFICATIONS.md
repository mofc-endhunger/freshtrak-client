# Test Failure Notifications

This document describes how to set up notifications for Playwright E2E test failures in the CI/CD pipeline.

## Overview

When E2E tests fail in the CI/CD pipeline, notifications can be sent to alert the team. This helps ensure issues are caught and addressed quickly.

## Notification Options

### 1. AWS CodeBuild Notifications

CodeBuild can send notifications via SNS when builds fail.

#### Setup Steps:

1. **Create SNS Topic**:
```bash
aws sns create-topic --name codebuild-test-failures
```

2. **Subscribe to Topic**:
   - Email: `aws sns subscribe --topic-arn <arn> --protocol email --notification-endpoint your-email@example.com`
   - Slack: Use SNS to Slack integration
   - Teams: Use SNS to Teams webhook

3. **Configure CodeBuild Project**:
   - Go to CodeBuild Console
   - Select your project
   - Edit notifications
   - Enable notifications for failed builds
   - Select the SNS topic

### 2. Slack Notifications

#### Using SNS to Slack

1. Create Slack webhook URL
2. Create Lambda function to forward SNS to Slack
3. Subscribe Lambda to SNS topic

#### Using CodeBuild Notifications Directly

Configure in CodeBuild project settings:
- Notification type: Build state change
- Events: Build failed, Build phase failure
- Target: Slack webhook URL

### 3. Email Notifications

#### Simple Setup

1. Create SNS topic
2. Subscribe email addresses
3. Configure CodeBuild to publish to topic on failure

#### Advanced Setup

Use AWS SES for formatted emails with test results.

### 4. Teams Notifications

1. Create Teams webhook
2. Use Lambda function to format and send messages
3. Subscribe to SNS topic

## Notification Content

### Basic Notification

Includes:
- Build ID
- Build status
- Test failure count
- Link to build logs

### Enhanced Notification

Can include:
- Failed test names
- Screenshot links
- Test report URL
- Error messages
- Build duration

## Implementation Examples

### Example: SNS Topic Setup

```yaml
# In CloudFormation or Terraform
Resources:
  TestFailureTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: codebuild-test-failures
      DisplayName: CodeBuild Test Failures
```

### Example: Lambda Function for Slack

```javascript
exports.handler = async (event) => {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  
  const payload = {
    text: `🚨 E2E Tests Failed`,
    attachments: [{
      color: 'danger',
      fields: [{
        title: 'Build ID',
        value: message.buildId,
        short: true
      }, {
        title: 'Status',
        value: message.buildStatus,
        short: true
      }]
    }]
  };
  
  await fetch(slackWebhook, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
```

## Configuration in buildspec.yml

To trigger notifications on test failure, modify buildspec.yml:

```yaml
build:
  commands:
    - npm run test:e2e || (aws sns publish --topic-arn $SNS_TOPIC_ARN --message "Tests failed" && exit 1)
```

## Best Practices

1. **Don't Spam**: Only notify on actual failures, not warnings
2. **Include Context**: Provide build ID, commit, and test details
3. **Actionable**: Include links to logs and reports
4. **Filter**: Use notification rules to filter noise
5. **Escalation**: Set up escalation for critical failures

## Testing Notifications

To test notification setup:

1. Intentionally fail a test
2. Trigger a build
3. Verify notification is received
4. Check notification content

## Troubleshooting

### Notifications Not Sending

- Verify SNS topic permissions
- Check CodeBuild project notification settings
- Verify subscription is confirmed (for email)
- Check CloudWatch logs for Lambda errors

### Too Many Notifications

- Adjust notification filters
- Use notification rules
- Implement rate limiting
- Group notifications

## Future Enhancements

- [ ] Integration with PagerDuty
- [ ] Custom notification templates
- [ ] Test result summaries in notifications
- [ ] Screenshot attachments
- [ ] Notification preferences per team member

