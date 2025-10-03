terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# AWS Amplify App
resource "aws_amplify_app" "admin_dashboard" {
  name       = var.app_name
  repository = var.repository_url

  # Build settings with custom npm install --force
  build_spec = <<-EOT
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
  EOT

  # Environment variables
  dynamic "environment_variables" {
    for_each = var.environment_variables
    content {
      name  = environment_variables.key
      value = environment_variables.value
    }
  }

  # Enable auto branch creation for feature branches (optional)
  enable_auto_branch_creation = var.enable_auto_branch_creation
  enable_branch_auto_build    = var.enable_branch_auto_build
  enable_branch_auto_deletion = var.enable_branch_auto_deletion

  # Platform
  platform = "WEB_COMPUTE"

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  # OAuth token for private repositories
  access_token = var.github_access_token

  tags = var.tags
}

# Branch configuration
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.admin_dashboard.id
  branch_name = var.main_branch_name

  enable_auto_build = true

  # Environment variables specific to this branch (optional)
  dynamic "environment_variables" {
    for_each = var.branch_environment_variables
    content {
      name  = environment_variables.key
      value = environment_variables.value
    }
  }

  tags = var.tags
}

# Optional: Additional branches
resource "aws_amplify_branch" "develop" {
  count = var.create_develop_branch ? 1 : 0

  app_id      = aws_amplify_app.admin_dashboard.id
  branch_name = "develop"

  enable_auto_build = true

  tags = var.tags
}

# Domain association (optional)
resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.admin_dashboard.id
  domain_name = var.domain_name

  # Subdomain settings
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.subdomain_prefix
  }

  # Optional: Add develop branch subdomain
  dynamic "sub_domain" {
    for_each = var.create_develop_branch ? [1] : []
    content {
      branch_name = aws_amplify_branch.develop[0].branch_name
      prefix      = "develop"
    }
  }
}
