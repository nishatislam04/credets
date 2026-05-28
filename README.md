# This is my credentials app to manage my private credentials

## stacks

- backend are built on `bun` and exposed private api endpoint
- frontend are built on `tanstack router`
- postgresql
- shadcn ui library
- tanstack form to manage form
- use bun built in api to manage Image, CSRF, hash-password, sql client
- biome to lint and format
- the backend will be hosted on Render (probbably)
- but where we will host the frontend? i am still not sure. lol

## guide

read the `docs/` for fully understanding the app goal and feature

## setup the app

### 1. clone repo

```bash
git clone git@github.com:nishatislam04/credets.git
```

### 2. install

```bash
  cd credets
  bun i
```

we duplicate some env var in both root dir and backend dir.
carefully observe them

### 3. env setup

```bash
  cp .env.exmple .env
```

also paste the `.env` to the root `apps/backend/` dir

### 3. setup key for env

hit this command twice

```bash
openssl rand -hex 32
```

and set it in .env var `ENC_KEY`
we need this to encrypt and decrypt our special password
`ENC_KEY` we need this to encrypt and decrypt our special password.
`CSRF_SECRET_KEY` use for csrf verification

### 4. spin it up [the application source code part]

take a look at root `package.json` file

### 4.1. run both `frontend` and `backend` application

in one terminal,

```bash
bun run dev
```

### 4.2 or run backend only

```bash
  bun run dev:backend
```

### 4.3 or run frontend only

```bash
  bun run dev:frontend
```

### 5. spin up [docker-compose]

in a new terminal!

```bash
cd credets
make db-up
```

## access

### 1. the backend side at

```bash
http://localhost:8000
```

### 2. the frontend side at

```bash
http://localhost:3000
```

### database inspector

i am personally using `dblab` terminal app to view the database. all the ui looks buggy. so, i had decided to go with terminal app. check the guide at `docs/dblab.md` for details

### conclusion

good luck me!
