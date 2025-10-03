# Terraform AWS Amplify Deployment

This Terraform configuration deploys the Admin Dashboard Frontend to AWS Amplify with a custom build configuration using `npm install --force`.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** installed (version >= 1.0)
3. **AWS CLI** configured with credentials
4. **GitHub Personal Access Token** (for private repositories)

## Setup Instructions

### 1. Configure AWS Credentials

```bash
# Option 1: Using AWS CLI
aws configure

# Option 2: Using environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### 2. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the generated token

### 3. Configure Terraform Variables

```bash
# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

Update the following required variables:
- `repository_url`: Your GitHub repository URL
- `github_access_token`: Your GitHub personal access token
- `environment_variables`: Any environment variables your app needs

### 4. Initialize Terraform

```bash
cd terraform
terraform init
```

### 5. Review the Deployment Plan

```bash
terraform plan
```

### 6. Deploy to AWS Amplify

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

### 7. Access Your Application

After deployment completes, Terraform will output:
- **amplify_app_id**: Your Amplify app ID
- **default_domain**: The default Amplify domain
- **main_branch_url**: Direct URL to your deployed app
- **amplify_console_url**: Link to AWS Amplify Console

## Build Configuration

The deployment uses a custom build specification with `npm install --force`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --force
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Environment Variables

To add environment variables for your Next.js app, update the `environment_variables` in `terraform.tfvars`:

```hcl
environment_variables = {
  NEXT_PUBLIC_API_URL = "https://api.example.com"
  NEXT_PUBLIC_ENV     = "production"
}
```

## Custom Domain

To configure a custom domain:

1. Update `terraform.tfvars`:
   ```hcl
   domain_name      = "yourdomain.com"
   subdomain_prefix = "www"
   ```

2. After deployment, verify your domain in the AWS Amplify Console
3. Update your DNS records as instructed by AWS

## Managing Multiple Branches

To enable automatic deployment for the `develop` branch:

```hcl
create_develop_branch = true
```

To enable automatic branch creation for all feature branches:

```hcl
enable_auto_branch_creation = true
enable_branch_auto_build    = true
```

## Updating the Deployment

After making changes to your configuration:

```bash
terraform plan
terraform apply
```

## Destroying Resources

To remove all AWS resources created by Terraform:

```bash
terraform destroy
```

## Troubleshooting

### Build Failures

1. Check the Amplify Console for build logs
2. Verify environment variables are set correctly
3. Ensure `npm install --force` resolves dependency conflicts

### Authentication Issues

- Verify your GitHub access token has the correct permissions
- Check that the repository URL is correct
- Ensure the token hasn't expired

### Domain Configuration

- Verify DNS records are configured correctly
- Allow up to 48 hours for DNS propagation
- Check domain verification status in Amplify Console

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

## Security Notes

- **Never commit** `terraform.tfvars` to version control (it's in `.gitignore`)
- Store sensitive values (tokens, keys) in environment variables or AWS Secrets Manager
- Rotate GitHub access tokens periodically
- Use IAM roles with least privilege principle
