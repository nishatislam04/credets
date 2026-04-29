this is where we will lay out information about our databases tables

# database table columns

1. user (only one)
2. session (for simple auth)
3. credentials (our main resource table)


# user table

1. id
2. name 
3. usename
4. email
5. password -hash
6. specialPassword -raw for now. soon enc it
7. createdAt
8. updatedAt


# session

1. id -the actual sessionId attached to user each req
2. userId -foreignKey
3. token - no idea what this does
4. expiresAt -24hour
5. createdAt


# credentials

1. id 
2. type -enum supported
3. data -json
4. images -url or urls (maybe another json?)
5. createdAt
6. updatedAt


# access database in docker from terminal

```bash
docker compose exec db bash
psql -U nishat -d credets_db
```

# use db instance to write query

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

when we update our sql file to change db structure, just flush down the docker volume and run it up!
