pipeline {
    agent any

    environment {
        // Keeps the Playwright browsers inside the workspace folder
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/ms-playwright"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from repository...'
                // Code configuration happens inside the Jenkins UI
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
                echo 'Downloading required browsers...'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run Automation Tests') {
            steps {
                echo 'Executing Playwright Test Suite...'
                // 'bat' is used for Windows environments
                bat 'npx playwright test' 
            }
        }
    }

    post {
        always {
            echo 'Archiving test results...'
            // Automatically captures your HTML report even if tests fail
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}
