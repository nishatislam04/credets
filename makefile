.PHONY: db-up db-down

db-up:
	docker compose up

db-down:
	docker compose down
