# this is where we will lay out information about our databases tables

## database table columns

1. user (only one)
2. session (for simple auth)
3. types
4. credentials (our main resource table)

### user table

1. id
2. name
3. usename
4. email
5. password -hash
6. special_password -raw for now. soon enc it
7. createdAt
8. updatedAt


### session

1. id -the actual sessionId attached to user each req
2. userId -foreignKey
3. token - no idea what this does
4. expiresAt -24hour
5. createdAt


### types

1. label - varchar
2. description - text

### credentials

1. id
2. title - text
3. short description - text
4. long description - text
5. thumbnail - BYTEA - we will store as binary data
6. data -jsonB
7. images -jsonB
8. notes - text
9. tags - jsonB
10. types_id - refer to types table

#### access database in docker from terminal

```bash
docker compose exec db bash
psql -U nishat -d credets_db
```

#### use db instance to write query

```bash
import { sql } from "@db/connection" // sadly we need to manually type this out

const users = sql`SELECT * FROM users`
```

> note! it is still buggy! i dont know why! lol


### clear out db for reset purpose

```bash
docker compose down -v
docker compose up 
```

when we update our sql file to change db structure,
just flush down the docker volume and run it up!
