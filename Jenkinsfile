pipeline {
    agent any
    
    environment {
        // Credentials from Jenkins (you've set these up)
        AWS_ACCESS_KEY_ID = credentials('aws_access_key_id')
        AWS_SECRET_ACCESS_KEY = credentials('aws_secret_access_key')
        AWS_SESSION_TOKEN = credentials('aws_session_token')
        GITHUB_TOKEN = credentials('github-token')
        GITHUB_CREDENTIALS = credentials('github-credentials')
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        
        // These will be captured from Terraform output
        K8S_MASTER_IP = ''
        SSH_USER = 'ec2-user'
        PROJECT_DIR = '/home/ec2-user/project'
    }
    
    stages {
        stage('Terraform Init') {
            steps {
                script {
                    dir('terraform') {
                        sh 'terraform init'
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            steps {
                script {
                    dir('terraform') {
                        sh '''
                        terraform apply -auto-approve
                        
                        # Capture outputs for Jenkins
                        terraform output -raw master_public_ip > ../master_ip.txt
                        terraform output -raw ssh_user > ../ssh_user.txt
                        '''
                    }
                    // Read Terraform outputs into Jenkins environment
                    env.K8S_MASTER_IP = readFile('master_ip.txt').trim()
                    env.SSH_USER = readFile('ssh_user.txt').trim()
                }
            }
        }
        
        stage('Setup SSH Connection') {
            steps {
                script {
                    // This assumes you have the SSH key configured in Jenkins
                    // Or you're using SSH agent forwarding
                    sh "ssh-keyscan ${env.K8S_MASTER_IP} >> ~/.ssh/known_hosts"
                }
            }
        }
        
        stage('Clone Repository on Master') {
            steps {
                script {
                    // SSH to master and clone your repo
                    sh """
                    ssh ${env.SSH_USER}@${env.K8S_MASTER_IP} << 'EOF'
                    cd ${env.PROJECT_DIR}
                    
                    # Clone your application repository
                    git clone https://\${GITHUB_TOKEN}@github.com/your-username/your-repo.git .
                    
                    # Or if using SSH:
                    # git clone git@github.com:your-username/your-repo.git .
                    
                    echo "Repository cloned successfully"
                    EOF
                    """
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                script {
                    // SSH to master and deploy your Kubernetes manifests
                    sh """
                    ssh ${env.SSH_USER}@${env.K8S_MASTER_IP} << 'EOF'
                    cd ${env.PROJECT_DIR}/k8s
                    
                    # 1. First, check if kubectl works
                    kubectl get nodes
                    
                    # 2. Apply secrets and configmaps first
                    kubectl apply -f secrets.yaml
                    kubectl apply -f app-config.yaml
                    kubectl apply -f nginx-configmap.yaml
                    
                    # 3. Deploy backend services
                    kubectl apply -f user-service-deployment.yaml
                    kubectl apply -f task-service-deployment.yaml
                    kubectl apply -f notification-service-deployment.yaml
                    
                    # 4. Deploy frontend
                    kubectl apply -f client-deployment.yaml
                    kubectl apply -f client-service.yaml
                    
                    # 5. Deploy nginx gateway
                    kubectl apply -f nginx-deployment.yaml
                    kubectl apply -f nginx-service.yaml
                    
                    # 6. Check deployment status
                    echo "=== Deployment Status ==="
                    kubectl get pods
                    kubectl get services
                    
                    # 7. Get application URL
                    NGINX_NODEPORT=\$(kubectl get svc nginx-service -o jsonpath='{.spec.ports[0].nodePort}')
                    echo "Application will be available at: http://\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):\${NGINX_NODEPORT}"
                    EOF
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    // Wait a bit and verify the deployment
                    sleep 60
                    
                    sh """
                    ssh ${env.SSH_USER}@${env.K8S_MASTER_IP} << 'EOF'
                    echo "=== Final Verification ==="
                    kubectl get pods --all-namespaces
                    kubectl get svc --all-namespaces
                    
                    # Check pod status
                    kubectl wait --for=condition=Ready pods --all --timeout=300s
                    
                    echo "=== All pods are running! ==="
                    EOF
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "Deployment successful! Application is running."
            script {
                // Get the application URL
                sh """
                ssh ${env.SSH_USER}@${env.K8S_MASTER_IP} << 'EOF'
                NGINX_NODEPORT=\$(kubectl get svc nginx-service -o jsonpath='{.spec.ports[0].nodePort}')
                MASTER_IP=\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
                echo "Application URL: http://\${MASTER_IP}:\${NGINX_NODEPORT}"
                EOF
                """
            }
        }
        failure {
            echo "Deployment failed. Check logs above."
        }
        always {
            // Optional: Clean up temporary files
            sh 'rm -f master_ip.txt ssh_user.txt'
        }
    }
}