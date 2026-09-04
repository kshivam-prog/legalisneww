# Deployment Guide

Complete guide to deploy AI Agreement Analyzer to production.

## Table of Contents

1. [Quick Start (Docker)](#quick-start-docker)
2. [Local Installation](#local-installation)
3. [AWS Deployment](#aws-deployment)
4. [DigitalOcean Deployment](#digitalocean-deployment)
5. [Heroku Deployment](#heroku-deployment)
6. [Performance Tuning](#performance-tuning)

## Quick Start (Docker)

### Prerequisites
- Docker
- Docker Compose
- At least 8GB RAM
- 20GB disk space

### Deploy

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd legalisneww
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Docs: http://localhost/api/docs
   - Health Check: http://localhost/api/health

4. **Stop and cleanup**
   ```bash
   docker-compose down
   ```

### Configuration

Edit `.env` before running:
```bash
export LLM_DEVICE=cpu  # or cuda, mps
export LLM_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.1
```

## Local Installation

### Backend

1. **Setup Python environment**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Initialize database**
   ```bash
   python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
   ```

4. **Run backend**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Frontend

1. **Setup Node environment**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Serve frontend**
   ```bash
   npm run preview
   # or use Nginx/Apache to serve dist/ folder
   ```

## AWS Deployment

### Using EC2 + Docker

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance: t3.xlarge (minimum for LLM)
   - Storage: 50GB EBS
   - Security Group: Allow 80, 443, 8000

2. **Install Docker**
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

3. **Deploy**
   ```bash
   git clone <repository-url>
   cd legalisneww
   docker-compose up -d
   ```

4. **Setup SSL (Optional)**
   ```bash
   # Install Certbot
   sudo apt-get install certbot python3-certbot-nginx
   
   # Generate certificate
   sudo certbot certonly --standalone -d yourdomain.com
   
   # Update nginx.conf with SSL certificates
   # Restart nginx
   sudo docker-compose restart nginx
   ```

### Using ECS + Fargate

See AWS ECS deployment guide in the docs folder.

## DigitalOcean Deployment

### Using App Platform

1. **Connect GitHub Repository**
2. **Configure Build Command**
   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```

3. **Configure Run Command**
   ```bash
   cd backend && uvicorn app:app --host 0.0.0.0 --port 8000
   ```

4. **Set Environment Variables**
   - `LLM_DEVICE=cpu`
   - `LLM_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.1`
   - `DATABASE_URL=sqlite:///./agreement_analyzer.db`

5. **Configure Resources**
   - Memory: 8GB minimum
   - CPU: 4 cores
   - Persistent Disk: 20GB

### Using Droplet + Docker

1. **Create Droplet**
   - Size: 16GB RAM minimum
   - Image: Ubuntu 22.04
   - Region: Your closest region

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Deploy application**
   ```bash
   git clone <repository-url>
   cd legalisneww
   docker-compose -f docker-compose.yml up -d
   ```

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account
- Git repository

### Deploy

1. **Create Heroku apps**
   ```bash
   heroku create ai-agreement-analyzer-api
   heroku create ai-agreement-analyzer-web
   ```

2. **Configure backend**
   ```bash
   heroku config:set -a ai-agreement-analyzer-api \
     LLM_DEVICE=cpu \
     LLM_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.1
   ```

3. **Deploy**
   ```bash
   # Backend
   git subtree push --prefix backend heroku main
   
   # Frontend
   git subtree push --prefix frontend heroku-web main
   ```

Note: Heroku's free tier may not have enough resources for LLM inference.

## Performance Tuning

### CPU Optimization
- Use quantized models (smaller, faster)
- Increase `CHUNK_SIZE` for faster processing
- Enable compression in Nginx

### GPU Optimization
- Use NVIDIA GPU instances (AWS: p3.2xlarge)
- Set `LLM_DEVICE=cuda`
- Install CUDA toolkit: `pip install torch[cu118]`

### Memory Optimization
- Use smaller LLM models (3B instead of 7B)
- Implement document streaming for large files
- Increase `CHUNK_OVERLAP` to reduce redundancy

### Database Optimization
- Use PostgreSQL instead of SQLite for production
- Add database indexes
- Enable query result caching

### Load Balancing
- Use multiple backend instances with load balancer
- Implement job queue for analysis (Celery/Redis)
- Cache analysis results

## Monitoring & Logging

### Application Logging
```bash
# View FastAPI logs
docker logs ai-agreement-analyzer-api

# View Nginx logs
docker logs ai-agreement-analyzer-nginx
```

### Health Checks
```bash
curl http://localhost/api/health
```

### Performance Monitoring
- CPU: `docker stats`
- Memory: Monitor disk usage for models cache
- Response times: Check API logs

## Security Best Practices

1. **Update Environment**
   - Keep Docker images updated
   - Security patches: `apt-get update && apt-get upgrade`

2. **SSL/TLS Configuration**
   - Use HTTPS in production
   - Obtain certificates from Let's Encrypt

3. **Access Control**
   - Restrict API endpoints if needed
   - Implement authentication/authorization

4. **Data Privacy**
   - Regular database backups
   - Secure file uploads storage
   - Clear old analysis data periodically

5. **Resource Limits**
   - Set request size limits
   - Implement rate limiting
   - Monitor memory usage

## Scaling

### Horizontal Scaling (Multiple Instances)
1. Use load balancer (AWS ELB, Nginx)
2. Deploy multiple backend instances
3. Share database across instances
4. Use Redis for caching

### Vertical Scaling (Bigger Machine)
1. Upgrade instance type
2. Increase CPU/RAM/Disk
3. Enable GPU if available

### Caching Strategy
- Cache analysis results
- Implement Redis for session storage
- CDN for frontend assets

## Troubleshooting

### Model Not Loading
```bash
docker logs ai-agreement-analyzer-api | grep -i model
# Check: HF_HOME environment variable
# Set cache directory volume correctly
```

### Out of Memory
```bash
# Check memory usage
docker stats

# Solution: Use smaller model or add more RAM
```

### Slow Analysis
```bash
# Check CPU usage
docker stats

# Enable GPU if available
# Use quantized model
# Increase chunk size
```

### Database Errors
```bash
# Check database file exists
docker exec ai-agreement-analyzer-api ls -la *.db

# Backup and reset if corrupted
docker exec ai-agreement-analyzer-api sqlite3 agreement_analyzer.db .backup backup.db
```

## Backup & Recovery

### Backup Database
```bash
docker cp ai-agreement-analyzer-api:/app/backend/agreement_analyzer.db ./backup.db
```

### Backup Models
```bash
docker cp ai-agreement-analyzer-api:/app/models ./models_backup
```

### Restore
```bash
docker cp ./backup.db ai-agreement-analyzer-api:/app/backend/
docker cp ./models_backup ai-agreement-analyzer-api:/app/
```

## Cost Estimation

### AWS (Monthly)
- EC2 t3.xlarge: ~$150/month
- EBS 50GB: ~$5/month
- Data transfer: ~$10/month
- **Total: ~$165/month**

### DigitalOcean (Monthly)
- Standard droplet 16GB: ~$96/month
- Backups: ~$12/month
- **Total: ~$108/month**

### Heroku (Monthly)
- 2 Dyno Standard 2x: ~$100/month
- PostgreSQL Standard: ~$200/month
- **Total: ~$300/month** (not recommended for LLM)

---

For more information, see the main README.md file.
