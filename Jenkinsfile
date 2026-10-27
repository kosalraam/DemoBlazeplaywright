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
                echo 'Downloading required browsers with Execution Policy Bypass...'
                // This forces Windows to ignore the signature restriction for this execution block
                bat 'powershell -ExecutionPolicy Bypass -Command "npx playwright install --with-deps"'
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
