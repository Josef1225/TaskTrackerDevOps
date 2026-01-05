pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials'
        DOCKER_HUB_USERNAME    = 'youcefkhelaifia'
        GITHUB_CREDENTIALS     = 'github-credentials'

        EC2_USER = 'ec2-user'
        EC2_HOST = '3.238.218.72'   // your EC2 public IP
        SSH_KEY  = 'ec2-ssh-key'
    }

    stages {

        stage('Checkout') {
            steps {
                git(
                    url: 'https://github.com/Josef1225/TaskTrackerDevOps.git',
                    credentialsId: "${GITHUB_CREDENTIALS}"
                )
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    def services = [
                        'client',
                        'notification-service',
                        'task-service',
                        'user-service'
                    ]

                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS) {
                        for (s in services) {
                            sh """
                            docker build -t ${DOCKER_HUB_USERNAME}/${s}:latest ./${s}
                            docker push ${DOCKER_HUB_USERNAME}/${s}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('Copy K8s Manifests to EC2') {
            steps {
                sshagent([SSH_KEY]) {
                    sh """
                    scp -o StrictHostKeyChecking=no -r k8s \
                        ${EC2_USER}@${EC2_HOST}:/home/ec2-user/project/
                    """
                }
            }
        }

        stage('Deploy to k3s on EC2') {
            steps {
                sshagent([SSH_KEY]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/secrets.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/app-config.yaml

                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/user-service-deployment.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/task-service-deployment.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/notification-service-deployment.yaml

                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/client-deployment.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/client-service.yaml
                        /usr/local/bin/k8s kubectl apply -f /home/ec2-user/project/k8s/nginx-configmap.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/nginx-deployment.yaml
                        /usr/local/bin/k3s kubectl apply -f /home/ec2-user/project/k8s/nginx-service.yaml
                    '
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent([SSH_KEY]) {
                    sh """
                    ssh ${EC2_USER}@${EC2_HOST} '
                        /usr/local/bin/k3s kubectl get pods
                        /usr/local/bin/k3s kubectl get svc
                    '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment to EC2 k3s completed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check logs."
        }
    }
}