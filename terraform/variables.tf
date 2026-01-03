variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "eks_cluster_name" {
  type    = string
  default = "academy-eks"
}

variable "eks_version" {
  type    = string
  default = "1.24"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "node_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "node_desired_capacity" {
  type    = number
  default = 1
}

variable "node_min_capacity" {
  type    = number
  default = 1
}

variable "node_max_capacity" {
  type    = number
  default = 1
}
