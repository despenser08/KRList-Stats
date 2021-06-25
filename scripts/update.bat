@echo off

docker-compose build
docker-compose pull
docker-compose rm -s -f
docker-compose up -d
docker image prune -f
docker-compose logs -f bot
