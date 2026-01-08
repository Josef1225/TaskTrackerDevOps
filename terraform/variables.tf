variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 0
}

variable "ssh_key_name" {
  description = "Name of SSH key pair in AWS"
  type        = string
  default     = "vockey"
}

variable "public_key_path" {
  description = "Path to your public key file"
  type        = string
  default     = ""
}

# OPTIONAL: If you want to make CloudWatch dashboard name configurable
variable "cloudwatch_dashboard_name" {
  description = "Name for CloudWatch dashboard"
  type        = string
  default     = "k3s-dashboard"
}