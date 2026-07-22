.PHONY: db-up db-down

docker-up:
	docker compose up

docker-down:
	docker compose down

backend-up:
	bun run dev:backend

frontend-up:
	bun run dev:frontend

seed:
	bun run seed

db-reset:
	docker compose down -v
