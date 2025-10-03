#!/bin/bash

# Terraform Deployment Script for AWS Amplify
# This script helps automate the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    print_warning "AWS CLI is not installed. Make sure AWS credentials are configured."
else
    print_info "Checking AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Run 'aws configure' first."
        exit 1
    fi
    print_info "AWS credentials verified ✓"
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    print_warning "terraform.tfvars not found. Creating from example..."
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        print_info "Created terraform.tfvars from example file."
        print_warning "Please edit terraform.tfvars with your configuration before proceeding."
        exit 0
    else
        print_error "terraform.tfvars.example not found!"
        exit 1
    fi
fi

# Parse command line arguments
ACTION=${1:-plan}

case $ACTION in
    init)
        print_info "Initializing Terraform..."
        terraform init
        print_info "Terraform initialized successfully ✓"
        ;;
    
    plan)
        print_info "Running Terraform plan..."
        terraform plan
        ;;
    
    apply)
        print_info "Applying Terraform configuration..."
        terraform apply
        ;;
    
    deploy)
        print_info "Deploying to AWS Amplify..."
        terraform init -upgrade
        terraform plan -out=tfplan
        print_warning "Review the plan above. Press Enter to continue or Ctrl+C to cancel..."
        read
        terraform apply tfplan
        rm tfplan
        print_info "Deployment completed successfully ✓"
        print_info "Fetching outputs..."
        terraform output
        ;;
    
    destroy)
        print_warning "This will destroy all resources created by Terraform!"
        print_warning "Are you sure? Type 'yes' to confirm:"
        read CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            terraform destroy
            print_info "Resources destroyed successfully ✓"
        else
            print_info "Destroy cancelled."
        fi
        ;;
    
    output)
        print_info "Terraform outputs:"
        terraform output
        ;;
    
    validate)
        print_info "Validating Terraform configuration..."
        terraform validate
        print_info "Configuration is valid ✓"
        ;;
    
    *)
        echo "Usage: $0 {init|plan|apply|deploy|destroy|output|validate}"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize Terraform"
        echo "  plan     - Show execution plan"
        echo "  apply    - Apply Terraform configuration"
        echo "  deploy   - Full deployment (init + plan + apply)"
        echo "  destroy  - Destroy all resources"
        echo "  output   - Show Terraform outputs"
        echo "  validate - Validate Terraform configuration"
        exit 1
        ;;
esac
