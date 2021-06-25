@echo off

docker-compose build
docker-compose pull
docker-compose rm -s -f

rmdir /Q /S db
rmdir /Q /S logs

docker-compose up -d
docker image prune -f
docker-compose logs -f bot
