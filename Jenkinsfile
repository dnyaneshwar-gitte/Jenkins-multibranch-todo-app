pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        DOCKER_IMAGE = "dnyaneshwar535/node-react-app"
        TAG = "${BRANCH_NAME}-${BUILD_NUMBER}"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'set NODE_ENV=test && npm test -- --runInBand'
            }
        }

        // ❌ REMOVED build stage (not needed)

        // ❌ REMOVED Start App Check (wrong in CI)

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${TAG}")
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    retry(3) {
                        docker.withRegistry('https://index.docker.io/v1/', 'docker-creds') {
                            dockerImage.push()
                        }
                    }
                }
            }
        }

        stage('Deploy Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo "Deploying to STAGING"
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying to PRODUCTION"
            }
        }
    }

    post {
        success {
            emailext (
                subject: "SUCCESS: Jenkins Pipeline",
                body: "Build Successful!",
                to: "dnyaneshwarg535@gmail.com"
            )
        }
        failure {
            emailext (
                subject: "FAILED: Jenkins Pipeline",
                body: "Build Failed!",
                to: "dnyaneshwarg535@gmail.com"
            )
        }
    }
}
