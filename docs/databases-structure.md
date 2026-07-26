# This Is Where We Will Lay Out Information About Our Databases Tables

This document describes the database tables, their columns, and how to access them.

## Database Table Columns

1. user (only one)
2. session (for simple auth)
3. types
4. credentials (user credentials)
5. credential_images (multiple images of each credential)

### User Table

1. name
2. usename
3. email
4. password -hash
5. special_password -raw now. soon enc it

### Session

1. userId -foreignKey
2. token - no idea what this does
3. expiresAt

### Types

1. label - varchar
2. value - varchar
3. description - text

### Credentials

1. title - text
2. short description - text
3. long description - text
4. thumbnail_url
5. thumbnail_format - varchar - always webp
6. thumbnail_width
7. thumbnail_height
8. version
9. data -text
10. notes -text
11. tags -text

### Credential_images

1. image_url
2. format
3. width
4. height
5. byte_size
6. sort_order

## Access Database in Docker from Terminal

inspect via dblab `dblab --config`

and if need to inspect db via docker:

```bash
podman-compose exec db bash
psql -U nishat -d credets_db
```

## Use Db Instance to Write Query

```bash
import { sql } from "@db/connection";

const users = sql`SELECT * FROM users`
```

## Reset Database Data

**turn off running docker-compose** then

```bash
podman-compose down -v
podman-compose up
```

## Seed Db

run `bun run seed` at project root
