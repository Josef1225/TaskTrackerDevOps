pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        CLUSTER_NAME = "my-cluster"
        NAMESPACE = "default"  // Kubernetes namespace
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout your GitHub repo
                git branch: 'main', url: 'https://github.com/Josef1225/TaskTrackerDevOps.git'
            }
        }

        stage('Docker Login') {
            steps {
                // Use Jenkins credentials for Docker login
                withCredentials([usernamePassword(credentialsId: 'Dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build images for each microservice
                    sh 'docker build -t youcefkhelaifia/client ./client'
                    sh 'docker build -t youcefkhelaifia/task-service ./task-service'
                    sh 'docker build -t youcefkhelaifia/user-service ./user-service'
                    sh 'docker build -t youcefkhelaifia/notification-service ./notification-service'
                    sh 'docker build -t youcefkhelaifia/nginx-gateway ./nginx-gateway'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    // Push images to Docker Hub
                    sh 'docker push youcefkhelaifia/client'
                    sh 'docker push youcefkhelaifia/task-service'
                    sh 'docker push youcefkhelaifia/user-service'
                    sh 'docker push youcefkhelaifia/notification-service'
                    sh 'docker push youcefkhelaifia/nginx-gateway'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply Kubernetes manifests (make sure they exist in repo)
                    sh 'kubectl apply -f k8s/client-deployment.yml'
                    sh 'kubectl apply -f k8s/task-service-deployment.yml'
                    sh 'kubectl apply -f k8s/user-service-deployment.yml'
                    sh 'kubectl apply -f k8s/notification-service-deployment.yml'
                    sh 'kubectl apply -f k8s/nginx-gateway-deployment.yml'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment succeeded!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}
