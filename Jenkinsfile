pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from repository...'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node packages...'
                bat 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo 'Downloading required browsers via CMD wrapper...'
                // Using .cmd bypasses the unsigned .ps1 file restrictions entirely
                bat 'npx.cmd playwright install --with-deps'
            }
        }

        stage('Run Automation Tests') {
            steps {
                echo 'Executing Playwright Test Suite...'
                bat 'npm test'
            }
        }
    }

    post {
        always {
            echo 'Archiving test results...'
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}
