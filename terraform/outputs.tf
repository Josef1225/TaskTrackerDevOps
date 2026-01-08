output "master_public_ip" {
  description = "Public IP address of the Kubernetes master node"
  value       = aws_instance.k8s_master.public_ip
}

output "master_private_ip" {
  description = "Private IP address of the Kubernetes master node"
  value       = aws_instance.k8s_master.private_ip
}

output "ssh_user" {
  description = "SSH username for the instance"
  value       = "ec2-user"
}

output "kubeconfig_path" {
  description = "Path to kubeconfig on the master node"
  value       = "/home/ec2-user/.kube/config"
}

output "project_directory" {
  description = "Directory where Jenkins should clone the project"
  value       = "/home/ec2-user/project"
}

output "ssh_command" {
  description = "SSH command to connect to the master node"
  value       = "ssh ec2-user@${aws_instance.k8s_master.public_ip}"
}

output "cloudwatch_dashboard_url" {
  description = "URL to access CloudWatch dashboard"
  value       = "https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "connection_info" {
  description = "Connection information for Jenkins"
  value = <<-EOT
  ===========================================
  Kubernetes Cluster Ready!
  
  Master Node Public IP: ${aws_instance.k8s_master.public_ip}
  
  SSH Command:
  ssh ec2-user@${aws_instance.k8s_master.public_ip}
  
  For Jenkins:
  - Kubeconfig: /home/ec2-user/.kube/config
  - Project Directory: /home/ec2-user/project
  - Clone your repo to: /home/ec2-user/project/k8s
  
  CloudWatch Dashboard:
  https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}
  
  ===========================================
  EOT
}