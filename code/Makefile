.PHONY: help build up down logs clean

help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start containers"
	@echo "  make down       - Stop containers"
	@echo "  make logs       - View logs"
	@echo "  make clean      - Remove containers and images"
	@echo "  make dev        - Start in development mode"
	@echo "  make prod       - Start in production mode"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f

dev:
	docker-compose up

prod:
	docker-compose -f docker-compose.prod.yml up -d

restart:
	docker-compose restart

shell:
	docker-compose exec app sh

test:
	docker-compose run --rm app npm test