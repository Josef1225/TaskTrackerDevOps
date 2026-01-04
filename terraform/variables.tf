variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"  # Increased for real deployment
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 0 # One worker for real deployment
}

variable "ssh_key_name" {
  description = "Name of SSH key pair in AWS"
  type        = string
  default     = "vockey"  # AWS Academy default
}

variable "public_key_path" {
  description = "Path to your public key file"
  type        = string
  default     = ""
}