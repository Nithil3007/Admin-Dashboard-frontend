variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name of the Amplify application"
  type        = string
  default     = "admin-dashboard-frontend"
}

variable "repository_url" {
  description = "GitHub repository URL (e.g., https://github.com/username/repo)"
  type        = string
}

variable "github_access_token" {
  description = "GitHub personal access token for private repositories"
  type        = string
  sensitive   = true
  default     = ""
}

variable "main_branch_name" {
  description = "Name of the main branch to deploy"
  type        = string
  default     = "main"
}

variable "environment_variables" {
  description = "Environment variables for the Amplify app"
  type        = map(string)
  default     = {}
}

variable "branch_environment_variables" {
  description = "Environment variables specific to the main branch"
  type        = map(string)
  default     = {}
}

variable "enable_auto_branch_creation" {
  description = "Enable automatic branch creation for feature branches"
  type        = bool
  default     = false
}

variable "enable_branch_auto_build" {
  description = "Enable automatic builds for new branches"
  type        = bool
  default     = true
}

variable "enable_branch_auto_deletion" {
  description = "Enable automatic deletion of branches when they are deleted from the repository"
  type        = bool
  default     = false
}

variable "create_develop_branch" {
  description = "Create a develop branch deployment"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for the Amplify app (leave empty to skip)"
  type        = string
  default     = ""
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for the main branch"
  type        = string
  default     = "www"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "production"
    ManagedBy   = "terraform"
    Project     = "admin-dashboard"
  }
}
