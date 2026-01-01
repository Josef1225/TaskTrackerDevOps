pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "youcefkhelaifia"
        REGISTRY = "docker.io"
        KUBE_NAMESPACE = "default"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/client ./client
                docker build -t $DOCKERHUB_USER/user-service ./user-service
                docker build -t $DOCKERHUB_USER/task-service ./task-service
                docker build -t $DOCKERHUB_USER/notification-service ./notification-service
                docker build -t $DOCKERHUB_USER/nginx-gateway ./nginx
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                docker push $DOCKERHUB_USER/client
                docker push $DOCKERHUB_USER/user-service
                docker push $DOCKERHUB_USER/task-service
                docker push $DOCKERHUB_USER/notification-service
                docker push $DOCKERHUB_USER/nginx-gateway
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f k8s/
                '''
            }
        }
    }

    post {
        success {
            echo " Deployment successful"
        }
        failure {
            echo " Deployment failed"
        }
    }
}
