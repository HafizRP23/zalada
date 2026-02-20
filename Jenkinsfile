pipeline {
    agent any

    environment {
        // You can define variables here, or set them in Jenkins credentials
        DOCKER_IMAGE_NAME = 'zalada'
        COMPOSE_PROJECT_NAME = 'zalada_project'
    }

    stages {
        stage('Checkout') {
            steps {
                // Check out the code from the Git repository
                checkout scm
            }
        }

        stage('NPM Install') {
            steps {
                sh 'npm install'
            }
        }

        /* 
        stage('Test') {
            steps {
                // Uncomment this when you have written tests (e.g. jest/vitest)
                // sh 'npm run test'
            }
        }
        */

        stage('Build Artifacts') {
            steps {
                // Build typescript source to dist/
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                // Build the application docker image (Production target)
                sh "docker build --target production -t ${DOCKER_IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            steps {
                // This will start the services defined in docker-compose.yml
                // mysqldb, migrations, and node-app
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! The application is running.'
        }
        failure {
            echo 'Deployment failed! Please check the logs.'
            // You can also add notification integrations here (Slack, Email)
        }
        always {
            // Clean up unused docker images to save space
            sh 'docker system prune -f'
        }
    }
}
