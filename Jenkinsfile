pipeline {
    agent any
    
    environment {
        KUBECONFIG = '/var/jenkins_home/kubeconfig-fixed.yaml'
    }
    
    stages {
        // STAGE 1: Check what we have
        stage('🔍 Inspect Project') {
            steps {
                script {
                    echo "=== Microservices CI/CD Pipeline ==="
                    echo "Build: ${BUILD_NUMBER}"
                    echo ""
                    
                    sh '''
                        echo "📁 Project Structure:"
                        ls -la
                        echo ""
                        echo "📦 Services Found:"
                        ls -d */ | grep -v ".git"
                    '''
                }
            }
        }
        
        // STAGE 2: Build ONE service (let's start simple)
        stage('🏗️ Build User Service') {
            when {
                expression { fileExists('user-service/Dockerfile') }
            }
            steps {
                dir('user-service') {
                    script {
                        echo "=== Building User Service ==="
                        
                        sh '''
                            echo "1. Checking Dockerfile..."
                            cat Dockerfile || echo "No Dockerfile found"
                            echo ""
                            
                            echo "2. Building Docker image..."
                            docker build -t user-service:${BUILD_NUMBER} .
                            
                            echo "3. Image created:"
                            docker images | grep user-service
                        '''
                    }
                }
            }
        }
        
        // STAGE 3: Deploy to Kubernetes
        stage('🚀 Deploy to Minikube') {
            when {
                expression { fileExists('k8s/') }
            }
            steps {
                dir('k8s') {
                    script {
                        echo "=== Deploying to Kubernetes ==="
                        
                        sh '''
                            echo "1. Available Kubernetes files:"
                            ls -la *.yaml 2>/dev/null || echo "No YAML files found"
                            echo ""
                            
                            echo "2. Deploying user service..."
                            # Check if we have a user service deployment
                            if [ -f "user-deployment.yaml" ] || [ -f "deployment.yaml" ]; then
                                # Deploy with current build number
                                kubectl --kubeconfig=$KUBECONFIG apply -f .
                                echo "✅ Deployed!"
                            else
                                # Create a simple deployment if none exists
                                echo "Creating simple deployment..."
                                cat > user-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: nginx:alpine  # Use simple public image for testing
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 80
    targetPort: 80
  type: NodePort
EOF
                                
                                kubectl --kubeconfig=$KUBECONFIG apply -f user-deployment.yaml
                            fi
                            
                            echo ""
                            echo "3. Checking deployment status..."
                            kubectl --kubeconfig=$KUBECONFIG get deployments
                            kubectl --kubeconfig=$KUBECONFIG get pods
                            kubectl --kubeconfig=$KUBECONFIG get services
                        '''
                    }
                }
            }
        }
        
        // STAGE 4: Simple Test
        stage('🧪 Simple Test') {
            steps {
                script {
                    echo "=== Testing Deployment ==="
                    
                    sh '''
                        echo "1. Waiting for pods to be ready..."
                        sleep 10
                        
                        echo "2. Pod status:"
                        kubectl --kubeconfig=$KUBECONFIG get pods
                        
                        echo ""
                        echo "3. Getting service URL:"
                        NODE_PORT=$(kubectl --kubeconfig=$KUBECONFIG get service user-service -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "Not found")
                        if [ "$NODE_PORT" != "Not found" ]; then
                            echo "🌐 Access at: http://localhost:$NODE_PORT"
                        else
                            echo "⚠️ Service not found"
                        fi
                    '''
                }
            }
        }
    }
    
    // POST-BUILD
    post {
        always {
            echo "=== Pipeline Complete ==="
            sh '''
                echo "Summary:"
                echo "Build: ${BUILD_NUMBER}"
                echo "Status: Finished"
                echo ""
                echo "To clean up:"
                echo "kubectl --kubeconfig=$KUBECONFIG delete deployment user-service"
                echo "kubectl --kubeconfig=$KUBECONFIG delete service user-service"
            '''
        }
        success {
            echo "✅ PIPELINE SUCCESS!"
            echo "Your microservice is deployed to Kubernetes!"
        }
    }
}