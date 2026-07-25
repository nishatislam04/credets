.PHONY: db-up db-down

podman-up:
	podman-compose up

podman-down:
	podman-compose down

backend-up:
	bun run dev:backend

frontend-up:
	bun run dev:frontend

seed:
	bun run seed

db-reset:
	podman-compose down -v
