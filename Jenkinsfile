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
                echo 'Downloading browser binaries...'
                bat 'npx.cmd playwright install chromium'
            }
        }

        stage('Run Automation Tests') {
            steps {
                echo 'Executing Playwright Tests on Chromium...'
                // Changed from 'npm test' to run only the Chromium configuration
                bat 'npm run test:chromium'
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
