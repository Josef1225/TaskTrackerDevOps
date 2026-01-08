pipeline {
    agent any

    environment {
        EC2_IP = '44.193.222.125'
        DOCKER_REGISTRY = 'youcefkhelaifia'
        SERVICES = "user-service task-service notification-service nginx-gateway client"
    }

    stages {
        stage('Checkout Repository') {
            steps {
                git(
                    url: 'https://github.com/Josef1225/TaskTrackerDevOps.git',
                    credentialsId: 'github-credentials',
                    branch: 'main'
                )
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    for (service in SERVICES.split()) {
                        echo "Building and pushing ${service}"
                        sh """
                            docker build \
                                -t ${DOCKER_REGISTRY}/${service}:latest \
                                -f ./${service}/dockerfile ./${service}
                            docker push ${DOCKER_REGISTRY}/${service}:latest
                        """
                    }
                }
            }
        }

        stage('Copy Kubernetes Manifests to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_IP} 'mkdir -p /home/ec2-user/project/k8s'
                        scp -o StrictHostKeyChecking=no -r ./k8s/* ec2-user@${EC2_IP}:/home/ec2-user/project/k8s/
                    """
                }
            }
        }

        stage('Deploy to k3s on EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_IP} '
                            export KUBECONFIG=/home/ec2-user/.kube/config
                            cd /home/ec2-user/project/k8s
                            sudo /usr/local/bin/k3s kubectl apply -f .
                        '
                    """
                }
            }
        }

        stage('Wait for Pods to be Ready') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_IP} '
                            echo "Waiting for pods to be ready..."
                            sleep 30
                        '
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_IP} '
                            export KUBECONFIG=/home/ec2-user/.kube/config
                            
                            echo "=== Pods Status ==="
                            sudo /usr/local/bin/k3s kubectl get pods -o wide
                            
                            echo ""
                            echo "=== Services Status ==="
                            sudo /usr/local/bin/k3s kubectl get svc -o wide
                            
                            # Get service ports
                            CLIENT_PORT=\$(sudo /usr/local/bin/k3s kubectl get svc client -o jsonpath="{.spec.ports[0].nodePort}" 2>/dev/null || echo "31907")
                            NGINX_PORT=\$(sudo /usr/local/bin/k3s kubectl get svc nginx-gateway-service -o jsonpath="{.spec.ports[0].nodePort}" 2>/dev/null || echo "32255")
                            
                            echo ""
                            echo "✅ DEPLOYMENT COMPLETE"
                            echo "========================================"
                            echo "Frontend Application:"
                            echo "  http://${EC2_IP}:\$CLIENT_PORT"
                            echo ""
                            echo "Backend API Gateway:"
                            echo "  http://${EC2_IP}:\$NGINX_PORT"
                            echo ""
                            echo "API Endpoints:"
                            echo "  Users: http://${EC2_IP}:\$NGINX_PORT/api/users"
                            echo "  Tasks: http://${EC2_IP}:\$NGINX_PORT/api/tasks"
                            echo "  Notifications: http://${EC2_IP}:\$NGINX_PORT/api/notifications"
                            echo "========================================"
                        '
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_IP} '
                            # Get client port
                            CLIENT_PORT=\$(sudo /usr/local/bin/k3s kubectl get svc client -o jsonpath="{.spec.ports[0].nodePort}" 2>/dev/null || echo "31907")
                            
                            echo ""
                            echo "=== Health Check ==="
                            echo -n "Frontend (Client): "
                            STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:\$CLIENT_PORT)
                            if [ "\$STATUS" = "200" ] || [ "\$STATUS" = "301" ] || [ "\$STATUS" = "302" ] || [ "\$STATUS" = "304" ]; then
                                echo "✅ ONLINE (Status: \$STATUS)"
                            else
                                echo "⚠️  CHECKING (Status: \$STATUS)"
                            fi
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed. Check the logs above.'
        }
        always {
            sh 'docker system prune -f 2>/dev/null || true'
        }
    }
}