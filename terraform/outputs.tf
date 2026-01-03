output "master_public_ip" {
  description = "Public IP address of the Kubernetes master node"
  value       = aws_instance.k8s_master.public_ip
}

output "master_private_ip" {
  description = "Private IP address of the Kubernetes master node"
  value       = aws_instance.k8s_master.private_ip
}

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.k8s_vpc.id
}

output "ssh_command" {
  description = "SSH command to connect to the master node"
  value       = "ssh ec2-user@${aws_instance.k8s_master.public_ip}"
}

output "connection_info" {
  description = "Connection information"
  value = <<-EOT
  ===========================================
  Kubernetes Cluster Ready!
  
  Master Node Public IP: ${aws_instance.k8s_master.public_ip}
  
  To connect via SSH:
  ssh ec2-user@${aws_instance.k8s_master.public_ip}
  
  Once connected, check Kubernetes:
  kubectl get nodes
  kubectl get pods --all-namespaces
  
  Test application is running on:
  http://${aws_instance.k8s_master.public_ip}:$(sudo kubectl get svc nginx -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30000-32767")
  ===========================================
  EOT
}