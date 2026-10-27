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
                // Removing '--with-deps' stops Playwright from invoking the blocked .ps1 system dependencies script
                bat 'npx.cmd playwright install'
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
