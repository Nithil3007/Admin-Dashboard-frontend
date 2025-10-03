output "amplify_app_id" {
  description = "ID of the Amplify app"
  value       = aws_amplify_app.admin_dashboard.id
}

output "amplify_app_arn" {
  description = "ARN of the Amplify app"
  value       = aws_amplify_app.admin_dashboard.arn
}

output "default_domain" {
  description = "Default domain for the Amplify app"
  value       = aws_amplify_app.admin_dashboard.default_domain
}

output "main_branch_url" {
  description = "URL of the main branch deployment"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.admin_dashboard.default_domain}"
}

output "develop_branch_url" {
  description = "URL of the develop branch deployment (if created)"
  value       = var.create_develop_branch ? "https://${aws_amplify_branch.develop[0].branch_name}.${aws_amplify_app.admin_dashboard.default_domain}" : null
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.domain_name != "" ? "https://${var.subdomain_prefix}.${var.domain_name}" : null
}

output "amplify_console_url" {
  description = "URL to the Amplify console for this app"
  value       = "https://console.aws.amazon.com/amplify/home?region=${var.aws_region}#/${aws_amplify_app.admin_dashboard.id}"
}
