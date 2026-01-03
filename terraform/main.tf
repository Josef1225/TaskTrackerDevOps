# Create a simple VPC
resource "aws_vpc" "k8s_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "k8s-learning-vpc"
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

# Security Group
resource "aws_security_group" "k8s_sg" {
  name        = "k8s-security-group"
  description = "Allow SSH and Kubernetes ports"
  vpc_id      = aws_vpc.k8s_vpc.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP for testing
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
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

# EC2 Instance - Kubernetes Master with k3s
resource "aws_instance" "k8s_master" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name               = var.ssh_key_name  # Use existing key in AWS Academy

  root_block_device {
    volume_size = 10  # Smaller for testing
    volume_type = "gp3"
  }

  tags = {
    Name = "k8s-master"
  }

  # Inline user data to install k3s
  user_data = <<-EOF
              #!/bin/bash
              # Update system
              sudo yum update -y
              
              # Install Docker
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user
              
              # Install k3s (lightweight Kubernetes)
              curl -sfL https://get.k3s.io | sh -
              
              # Wait for k3s to start
              sleep 30
              
              # Configure kubectl for ec2-user
              mkdir -p /home/ec2-user/.kube
              sudo cp /etc/rancher/k3s/k3s.yaml /home/ec2-user/.kube/config
              sudo chown ec2-user:ec2-user /home/ec2-user/.kube/config
              echo 'export KUBECONFIG=$HOME/.kube/config' >> /home/ec2-user/.bashrc
              
              # Install kubectl
              curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
              sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
              
              # Create test deployment
              sudo kubectl create deployment nginx --image=nginx:alpine
              sudo kubectl expose deployment nginx --port=80 --type=NodePort
              
              echo "=== Kubernetes Setup Complete ==="
              echo "Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
              echo "To access: ssh ec2-user@$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
              echo "Once connected, run: kubectl get pods"
              EOF
}

# Optional: EC2 Instance - Kubernetes Worker
resource "aws_instance" "k8s_worker" {
  count         = var.worker_count
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name      = var.ssh_key_name

  tags = {
    Name = "k8s-worker-${count.index + 1}"
  }
}