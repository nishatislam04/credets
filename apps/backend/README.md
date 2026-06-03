# @credets/backend

Bun HTTP server for the Credets credential management API.

## Stack

- **Runtime** — Bun (built-in SQL client, image processing, crypto)
- **Database** — PostgreSQL
- **Validation** — Zod (schemas shared via `@credets/shared-schema`)
- **Types** — Shared via `@credets/shared-types`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/credentials` | List credentials (paginated) |
| `GET` | `/api/credentials/:id` | Get single credential |
| `POST` | `/api/credentials` | Create credential |
| `PUT` | `/api/credentials/:id` | Update credential |
| `DELETE` | `/api/credentials/:id` | Delete credential |
| `GET` | `/api/types-listings` | List credential types |
| `GET` | `/api/csrf-token` | Generate CSRF token |

## Security

- **CSRF** — Token-based, generated per-session, validated on mutations
- **Encryption** — Credential secrets encrypted at rest with AES (`ENC_KEY`)
- **Password Hashing** — Bun's built-in `Bun.password.hash()`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ENC_KEY` | 64-char hex key for AES encryption |
| `CSRF_SECRET_KEY` | Secret for CSRF token signing |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 8000) |

## Development

```bash
bun run dev    # Watch mode with hot reload
bun start      # Production start
bun run type-check  # TypeScript check
```
