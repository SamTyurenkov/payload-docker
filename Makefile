#!make
include .env
current_dir := $(dir $(abspath $(firstword $(MAKEFILE_LIST))))

USER_ID := $(shell id -u)
GROUP_ID := $(shell id -g)

# docker section
## default: builds all images
## to build only one image use: make docker-build ARGS="mongo"
docker-build:
	env USER_ID=${USER_ID} env GROUP_ID=${GROUP_ID} docker-compose build $(ARGS)

docker-rm:
	docker stop $(ARGS) && docker rm $(ARGS) && docker rmi $(ARGS)

docker-dev:
	env USER_ID=${USER_ID} env GROUP_ID=${GROUP_ID} env COMMAND="npm install && npm run dev" docker-compose up -d

docker-prod:
	env USER_ID=${USER_ID} env GROUP_ID=${GROUP_ID} env COMMAND="npm ci && npm run build && npm run start" docker-compose up -d

docker-down:
	docker-compose down

# linters
lint-js:
	docker exec -w /home/next/app node-payload npm run lint-js $(ARGS)

format-js:
	docker exec -w /home/next/app node-payload npm run format-js $(ARGS)

# frontend
npm:
	docker exec -w /home/next/app node-payload npm $(ARGS)