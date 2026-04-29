# this is my ongoing credentials app built on monorepo. 

## stacks
* backend are built in bun and exposed api 
* and frontend are built on tanstack router to consume the api's
* we also have postgresql db support
* we will be using shadcn ui library to build the frontend
* we use biome to lint the code!
* the backend will be hosted on Render
* but where we will host the frontend? i am still not sure

# guide
read the `docs/` for fully understanding the app goal and feature

# setup the app

### 1. clone repo

```bash
git clone git@github.com:nishatislam04/my-credets.git
```

### 2. install
we need to install in 3 directory (probbably)

  ### 2.1. at root directory
  
  ```bash
    cd my-credets
    bun i
  ```

  ### 2.2. at backend directory

  ```bash
    cd my-credets/app/backend/
    bun i
  ```

  ### 2.3. at frontend directory

  ```bash
    cd my-credets/app/frontend/
    bun i
  ```

  ### 3. env setup

  ```bash
    cp .env.exmple .env
  ```

### 3. setup key for env

```bash 
openssl rand -hex 32
```

and set it in .env var `ENC_KEY`

### 4. spin it up [the application source code part]

take a look at root `package.json` file

  ### 4.1. run both `frontend` and `backend` application
in one terminal,

```bash
bun run dev
```

  ### 4.2 run only backend

  ```bash
    bun run dev:backend
  ```

  ### 4.3 run only frontend

  ```bash
    bun run dev:frontend
  ```

### 5. spin up [the database part]
in a new terminal!

```bash 
cd my-credets
make db-up
```

# access

### 1. the backend

```bash
http://localhost:8000
```

### 2. the frontend

```bash
http://localhost:3000
```

### 3. the adminer (database viewer)

```bash
http://localhost:8080
```

# conclusion
good luck me!
