# Backend (no build args needed - uses env at runtime)
cd cloud-project-back
docker build -t cloud-backend:latest .


# On EC2 instance with Docker installed
# Backend (point to RDS endpoint)
docker run -d --name cloud-backend \
  -e PGHOST=<RDS_ENDPOINT> \
  -e PGPORT=5432 \
  -e PGUSER=<RDS_USER> \
  -e PGPASSWORD=<RDS_PASSWORD> \
  -e PGDATABASE=<RDS_DB> \
  -e PGSSLMODE=require \
  -e PORT=4000 \
  -p 4000:4000 \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/cloud-backend:latest
