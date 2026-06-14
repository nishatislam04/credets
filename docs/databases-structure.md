# this is where we will lay out information about our databases tables

## database table columns

1. user (only one)
2. session (for simple auth)
3. types
4. credentials (our main resource table)
5. credential_images (store multiple images here)

### user table

1. name
2. usename
3. email
4. password -hash
5. special_password -raw for now. soon enc it


### session

1. id -the actual sessionId attached to user each req
2. userId -foreignKey
3. token - no idea what this does
4. expiresAt -24hour


### types

1. label - varchar
2. value - varchar
3. description - text

### credentials

1. title - text
2. short description - text
3. long description - text
4. thumbnail_image_data - BYTEA - we will store as binary data
5. thumbnail_format - varchar - always webp format
6. thumbnail_width
7. thumbnail_height
8. data -jsonB
9. notes - text
10. tags - jsonB

### credential_images

1. image_data
2. format
3. width
4. height
5. byte_size
6. sort_order


## access database in docker from terminal

we dont normally need to do this. we will use our `dblab --config` and inspect db there. but just in case, if its needed

```bash
docker compose exec db bash
psql -U nishat -d credets_db
```

## use db instance to write query

```bash
import { sql } from "@db/connection";

const users = sql`SELECT * FROM users`
```


## reset database data

first turn off docker compose service that was already on by `ctrl+c` then

```bash
docker compose down -v
docker compose up 
```

## seed

to seed database, just run `bun run seed` at project root dir
