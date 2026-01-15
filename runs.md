# Backend (no build args needed - uses env at runtime)
cd cloud-project-back
docker build -t arfaoui131/cloud-backend:latest .
docker push arfaoui131/cloud-backend


# On EC2 instance with Docker installed
# Backend (point to RDS endpoint)
docker run -d --name arfaoui131/cloud-backend \
  -e PGHOST=project-database-1.clkaa254aytz.us-east-1.rds.amazonaws.com \
  -e PGPORT=5432 \
  -e PGUSER=postgres \
  -e PGPASSWORD=27219400Ayyoub \
  -e PGDATABASE=projectdb1 \
  -e PGSSLMODE=require \
  -e PORT=3000 \
  -p 3000:3000 \
  arfaoui131/cloud-backend:latest
