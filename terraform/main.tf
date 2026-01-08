# Create a simple VPC
resource "aws_vpc" "k8s_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "k8s-vpc"
  }
}

# Create a public subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.k8s_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "k8s-public-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.k8s_vpc.id

  tags = {
    Name = "k8s-igw"
  }
}

# Route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.k8s_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "k8s-public-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group - Enhanced for real application
resource "aws_security_group" "k8s_sg" {
  name        = "k8s-security-group"
  description = "Allow required ports for Kubernetes and applications"
  vpc_id      = aws_vpc.k8s_vpc.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes API
  ingress {
    description = "Kubernetes API"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NodePort range
  ingress {
    description = "NodePort Services"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All traffic outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "k8s-sg"
  }
}

# Get latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance - Kubernetes Master with k3s (Amazon Linux 2)
resource "aws_instance" "k8s_master" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name               = var.ssh_key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "k8s-master"
  }

user_data = <<-EOF
#!/bin/bash
set -ex

# Update and install Docker
yum update -y
yum install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Install k3s using the official installer
export INSTALL_K3S_EXEC="--docker"
curl -sfL https://get.k3s.io | sh -

# Wait 30 seconds for installation
sleep 30

# Setup kubectl config
mkdir -p /home/ec2-user/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /home/ec2-user/.kube/config
sudo chown -R ec2-user:ec2-user /home/ec2-user/.kube
sudo chmod 600 /home/ec2-user/.kube/config
echo 'export KUBECONFIG=/home/ec2-user/.kube/config' >> /home/ec2-user/.bashrc

# Create project directory
mkdir -p /home/ec2-user/project/k8s

sudo /usr/local/bin/k3s server --docker & sleep 10

EOF
}

# CloudWatch Dashboard for monitoring
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = var.cloudwatch_dashboard_name  # Using variable instead of hardcoded
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.k8s_master.id]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "EC2 CPU Usage"
        }
      }
    ]
  })
}