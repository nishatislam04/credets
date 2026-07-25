# this is where we will lay out information about our databases tables

## database table columns

1. user (only one)
2. session (for simple auth)
3. types
4. credentials (user credentials)
5. credential_images (multiple images of each credential)

### user table

1. name
2. usename
3. email
4. password -hash
5. special_password -raw now. soon enc it

### session

1. userId -foreignKey
2. token - no idea what this does
3. expiresAt

### types

1. label - varchar
2. value - varchar
3. description - text

### credentials

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

### credential_images

1. image_url
2. format
3. width
4. height
5. byte_size
6. sort_order

## access database in docker from terminal

inspect via dblab `dblab --config`

and if need to inspect db via docker:

```bash
podman-compose exec db bash
psql -U nishat -d credets_db
```

## use db instance to write query

```bash
import { sql } from "@db/connection";

const users = sql`SELECT * FROM users`
```

## reset database data

**turn off running docker-compose** then

```bash
podman-compose down -v
podman-compose up
```

## seed db

run `bun run seed` at project root
