pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'youcefkhelaifia'
        BUILD_TAG = "dev-${BUILD_NUMBER}"
    }
    
    stages {
        stage('Setup Environment') {
            steps {
                sh '''
                    echo "=== Setting up environment ==="
                    
                    # 1. Ensure kubectl is installed
                    if ! command -v kubectl &> /dev/null; then
                        echo "Installing kubectl..."
                        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                        chmod +x kubectl
                        sudo mv kubectl /usr/local/bin/
                        echo "✅ kubectl installed"
                    fi
                    
                    # 2. Check Docker
                    echo "Docker: $(docker --version 2>/dev/null || echo 'Checking...')"
                    
                    # 3. Setup kubeconfig if missing
                    if [ ! -f "/var/jenkins_home/.kube/config" ]; then
                        echo "Setting up kubeconfig..."
                        mkdir -p /var/jenkins_home/.kube
                        # You'll need to copy your kubeconfig here
                        echo "NOTE: Need to copy kubeconfig to Jenkins container"
                    fi
                '''
            }
        }
        
        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "Logging into Docker Hub as ${DOCKER_USER}..."
                        
                        # Method 1: Simple login
                        docker login -u "${DOCKER_USER}" -p "${DOCKER_PASS}"
                        
                        # Verify login
                        docker pull hello-world
                        docker run --rm hello-world
                        
                        echo "✅ Docker Hub login successful!"
                    '''
                }
            }
        }
        
        stage('Build Images') {
            steps {
                sh '''
                    echo "Building images with tag: ${BUILD_TAG}"
                    
                    # Check and build each service
                    [ -f "./client/Dockerfile" ] && docker build -t ${DOCKER_REGISTRY}/client:${BUILD_TAG} ./client || echo "Skipping client - no Dockerfile"
                    [ -f "./user-service/Dockerfile" ] && docker build -t ${DOCKER_REGISTRY}/user-service:${BUILD_TAG} ./user-service || echo "Skipping user-service - no Dockerfile"
                    [ -f "./task-service/Dockerfile" ] && docker build -t ${DOCKER_REGISTRY}/task-service:${BUILD_TAG} ./task-service || echo "Skipping task-service - no Dockerfile"
                    [ -f "./notification-service/Dockerfile" ] && docker build -t ${DOCKER_REGISTRY}/notification-service:${BUILD_TAG} ./notification-service || echo "Skipping notification-service - no Dockerfile"
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh '''
                    echo "Pushing images to Docker Hub..."
                    
                    # Push all images that were built
                    docker images | grep "${DOCKER_REGISTRY}" | awk '{print $1":"$2}' | while read image; do
                        echo "Pushing: $image"
                        docker push "$image"
                    done
                    
                    echo "✅ Images pushed successfully!"
                '''
            }
        }
        
        stage('Deploy to Minikube') {
            steps {
                sh '''
                    echo "Deploying to Minikube..."
                    
                    # Update image tags in deployment files
                    sed -i "s|youcefkhelaifia/client:dev|${DOCKER_REGISTRY}/client:${BUILD_TAG}|g" k8s/client-deployment.yaml
                    sed -i "s|youcefkhelaifia/user-service:dev-v2|${DOCKER_REGISTRY}/user-service:${BUILD_TAG}|g" k8s/user-service-deployment.yaml
                    sed -i "s|youcefkhelaifia/task-service:dev-v2|${DOCKER_REGISTRY}/task-service:${BUILD_TAG}|g" k8s/task-service-deployment.yaml
                    sed -i "s|youcefkhelaifia/notification-service:dev-v2|${DOCKER_REGISTRY}/notification-service:${BUILD_TAG}|g" k8s/notification-service-deployment.yaml
                    
                    # Apply configurations
                    kubectl apply -f k8s/
                    
                    # Check deployment
                    echo "Deployment status:"
                    kubectl get pods
                    kubectl get svc nginx-gateway-service
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ CI/CD Pipeline Complete!'
            sh '''
                echo "=== Summary ==="
                echo "1. Images built and pushed to Docker Hub"
                echo "2. Kubernetes deployments updated"
                echo "3. Application deployed to Minikube"
                echo ""
                echo "Access your application:"
                echo "minikube service nginx-gateway-service --url"
            '''
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}