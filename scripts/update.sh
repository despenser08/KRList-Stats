#!/bin/bash

sudo docker-compose build
sudo docker-compose pull
sudo docker-compose rm -s -f
sudo docker-compose up -d
sudo docker image prune -f
sudo docker-compose logs -f bot
