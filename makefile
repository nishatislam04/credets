.PHONY: podman-up podman-down backend-up frontend-up seed db-reset

# Foreground stack that tears everything down on Ctrl+C (or exit),
# freeing port 5432 so another project can start right after.
podman-up:
	@trap 'podman-compose down >/dev/null 2>&1 || true' EXIT INT TERM; podman-compose up

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
