pipeline {
  agent any

  stages {
    stage('Clean workspace') {
      steps {
        cleanWs()
      }
    }

    stage("Checkout from SCM") {
      steps {
        git branch: 'main', url: 'https://github.com/mirindaq/DHKTPM18B_Nhom02_Ecommerce'
        echo "✅ Checked out code successfully"
      }
    }

    stage("Copy env files") {
      steps {
        sh '''
          echo "📁 Copying environment files..."
          
          # Copy Backend env files
          mkdir -p Back-End/env
          sudo cp /home/ubuntu/EcommerceMobile/env/prod.env Back-End/env/prod.env
          sudo cp /home/ubuntu/EcommerceMobile/env/dev.env Back-End/env/dev.env
          
          ls -la Back-End/env/
          
          echo "✅ Environment files copied successfully"
        '''
      }
    }

    stage("Deployment") {
      steps {
        sh """
          echo "🚀 Starting deployment..."
          echo "🧹 Stopping and removing old containers..."

          sudo docker compose down || true

          echo "🔧 Building and starting containers with production environment..."
          sudo docker compose --env-file ./Back-End/env/prod.env up -d --build

          echo "✅ Deployment completed successfully!"
        """
      }
    }
  }
}
