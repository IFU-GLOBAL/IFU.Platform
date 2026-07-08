#!/usr/bin/env bash
set -euo pipefail

# IFU AWS bootstrap helper.
# This script documents and checks the AWS resources required by the developer package.
# It intentionally avoids creating or changing infrastructure unless you uncomment commands.

AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="${APP_NAME:-IFU.Platform}"
S3_BUCKET="${S3_BUCKET:-ifu-platform-media-assets}"
SES_FROM_EMAIL="${SES_FROM_EMAIL:-no-reply@internationalfarmunion.com}"

echo "IFU Platform AWS bootstrap check"
echo "Region: ${AWS_REGION}"
echo "Amplify app: ${APP_NAME}"
echo "S3 bucket: ${S3_BUCKET}"
echo "SES sender: ${SES_FROM_EMAIL}"
echo

echo "Checking AWS caller identity..."
aws sts get-caller-identity
echo

echo "Checking SES identity status..."
aws sesv2 get-email-identity \
  --region "${AWS_REGION}" \
  --email-identity "${SES_FROM_EMAIL}" || true
echo

echo "Checking S3 media bucket..."
aws s3api head-bucket --bucket "${S3_BUCKET}" || true
echo

cat <<'NEXT_STEPS'
Manual/admin items that may still be required:
1. Attach Amplify SSR compute role with SES send permissions.
2. Verify internationalfarmunion.com in SES and add DKIM/SPF/DMARC DNS records.
3. Connect Amplify custom domain and validate ACM certificate.
4. Configure WAF/Shield/CloudWatch/CloudTrail/GuardDuty/Security Hub per IFU AWS policy.
5. Confirm S3 bucket policy/CORS before enabling document upload routes.

Creation commands are intentionally not run by default. Uncomment and review before use:

# aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION"
# aws sesv2 create-email-identity --region "$AWS_REGION" --email-identity "$SES_FROM_EMAIL"
NEXT_STEPS
