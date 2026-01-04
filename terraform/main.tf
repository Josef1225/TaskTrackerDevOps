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

# EC2 Instance - Kubernetes Master with k3s
resource "aws_instance" "k8s_master" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name               = var.ssh_key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20  # Increased for real deployment
    volume_type = "gp3"
  }

  tags = {
    Name = "k8s-master"
  }

user_data = <<-EOF
#!/bin/bash

# ---------------------------
# Install Docker and Git
# ---------------------------
yum install -y docker git
systemctl start docker
systemctl enable docker

# Give ec2-user permission to use Docker
usermod -aG docker ec2-user
chmod 666 /var/run/docker.sock

# ---------------------------
# Install k3s (Rancher Kubernetes)
# ---------------------------
curl -sfL https://get.k3s.io | sh -

# ---------------------------
# Start k3s server using full path
# ---------------------------
/usr/local/bin/k3s server --docker &

# Wait for k3s to initialize
sleep 150

# ---------------------------
# Set up kubectl wrapper using full path
# ---------------------------
tee /usr/local/bin/kubectl << 'SCRIPT'
#!/bin/bash
/usr/local/bin/k3s kubectl "$@"
SCRIPT

chmod +x /usr/local/bin/kubectl

# ---------------------------
# Create symlink for k3s for root
# ---------------------------
ln -sf /usr/local/bin/k3s /usr/bin/k3s

# ---------------------------
# Set KUBECONFIG for ec2-user
# ---------------------------
mkdir -p /home/ec2-user/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ec2-user/.kube/config
chown -R ec2-user:ec2-user /home/ec2-user/.kube
echo 'export KUBECONFIG=/home/ec2-user/.kube/config' >> /home/ec2-user/.bashrc

# ---------------------------
# Create project directory
# ---------------------------
mkdir -p /home/ec2-user/project
chown -R ec2-user:ec2-user /home/ec2-user/project

# ---------------------------
# Test if k3s is running
# ---------------------------
if /usr/local/bin/k3s kubectl get nodes >/dev/null 2>&1; then
    echo "=== SUCCESS: k3s is running ==="
    /usr/local/bin/k3s kubectl get nodes
else
    echo "=== WARNING: k3s may still be starting ==="
    echo "Run manually: /usr/local/bin/k3s kubectl get nodes"
fi

echo "Setup complete"
EOF
}