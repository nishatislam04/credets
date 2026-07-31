1. DONE — backend test docs created under docs/tests/:
   test-install-and-setup.md, ci-github-actions-for-tests.md, backend/credentials/create.md
   so, first create a tests/ inside of docs/ and create a file naming test-install and setup.md
   this setup md file would cover the installing and setting it up for our backend side test
   we will only implement unit test cases on our backend only with [bunjs test support](https://bun.com/docs/test)
   show us if any additional pkg or tools need to be install in our monorepo setup

and dont write a GitHub actions file yet for tests. but guide me, teach me, and enlight me.
how to write a ci GitHub actions for this specific scenario.
so that i can understand how to write ci for test cases
and this GitHub actions file code and syntax and keywords.
because i never wrote a GitHub actions file before. so, i also want you to create a dedicated
docs file teaching and guiding me how to write GitHub actions for this test case only
and how this code actually will work. only cover push cases. no pr yet and main branch

and then create a backend/credentials/create inside of docs/tests/
analyze the whole backend code for credentials create endpoint
and tell me how to write unit test for this credentials create domain
note that, i dont want you to write actual test codes. i want to write it by myself manually handcoding
so that, later i could know, this block part need to be unit tested and this should be input
and this should be output and this is how i should write test code based on this code block requirements
so that i can gather knowledge about writting basic and intermediate level test cases for this part only
i want you to guide me how to point cases to test in this domain.
you will only show me what should be the cases to test in this create endpoint
and then i will read your analyzing, understanding and thinking model.
and then write test cases for it
you will only write enough informations so that it make me think, ahh! this is how i should approach
and this is how i should explore and this is how i should write cases to test it
cover very small to medium to long and complex cases and properly guide me for each cases
so that i can master up writting unit test cases and analyze what to test and how to test
and how to utilize bunjs test docs to properly write test in each case tests

2. DONE — database migration docs created at `docs/database-migrations.md` (Atlas, declarative)
   i want to keep my sql file a source of truth.
   so later, when i need to, i can just look at one single file and understand the structure, relationship
   but if i update the sql file and then push it and render auto deploy based on this new sql file
   then my prod app break. because, no migration was called and if called, it would need to reset the db
   but we cant have our prod db data reset each time, as its real user data
   so, we need to fix this issue and i think only the main solution here is to create a migration file
   i can manually or systematic way to create migration file. but then my sql would scatter around
   i wont have any single source of truth. which i detest the most.
   so, how can i keep single sql file and also introduce migration system
   so that it does not break our prod db schema...
   create a single dedicated docs about this in docs/ and tell me what i should do about it
   how i should fix this issue and keep my source sql file up to date and introduce migration system

3. DONE — dedicated CI/CD pipeline learning docs created at `docs/ci-cd-pipeline.md`
   the goal isnt here to create a bullete proof cicd pipeline and forget about it.
   the goal here is to: learn how to write GitHub actions file
   and know why each sections, keywords, command, block was written.
   we will only trigger cicd when push in main branch
   we will use ubuntu vm for cicd, hence this might be the most commonly choose one. and for free tier

- we will use this [checkout tools](https://github.com/marketplace/actions/checkout) to checkout our codebase
- we will use [bun](https://github.com/marketplace/actions/setup-bun) to install in our monorepo app
  since we have 3 package.json files. i think, we should run `bun i` only root dir.
  not in backend/ and frontend/ specifically
- we will use this [Biome tools](https://github.com/marketplace/actions/setup-biome)
  for linting and formatting our codebase, which needed to pass linting and formatting
- i found this [Biome reviewdog tools](https://github.com/marketplace/actions/run-biome-with-reviewdog)
  i think its nice to use. but i dont know, if i will get any benefits of using it.
  tell me, if i should use it and why
- also this [rumdl actions](https://github.com/marketplace/actions/rumdl-action) show me how to config it up
- add backend test command with bunjs api. soon, we will add backend tests. but not for frontend
- add frontend build command to verify if build success
- add docker build command to verify if backend build success. just run the containerfile
- also add this [cache actions tools](https://github.com/marketplace/actions/cache)
  and tell me how it actually works. and how it will works in our monorepo setup.
  and whats benefits we will get, by setting this cache actions
- if we should use [semantic version tools](https://github.com/marketplace/actions/semantic-version-manager) or not.
  why and why not use it
- show me how i should setup my GitHub secret credentials from render.
  so that the cd part works only after success ci
- show me how i should setup my local environment on my arch linux kde plasma endeavouros,
  so that, we can run these GitHub actions locally
  and test if all these tools are successfully working or not locally.
  we should be seeing the GitHub success or failed and log in this setup.
  so we know what exactly are happening in GitHub actions
- we also need to see GitHub actions results (cloud GitHub results) in our local development
  show me how to setup the config, so that we can see from locally,
  if GitHub actions success or fail and log

i have added everthing i know and understand from analyzing and research.
your job is here to read these links and do extend reseach and then
in that dedicated docs file, create a simple, straight to the points and nice formatted texts
and explain these tools and their behavior and how they would affect our local, production development
goal is here to research, not to write a GitHub actions file, which we dont understand anything
and i also want to know why all of these tools used and what purpose they serve
i may have missed any good practises for GitHub actions case,
you can add those in this docs file. so that i can learn about it

4. credentials listings skeleton card render very below. but this skeleton card should start rendering after the actions block

5. i am getting this error

```json
{
	"success": false,
	"error": "An unexpected error occurred",
	"message": "role \"nishat\" does not exist",
	"timestamp": "2026-07-31T01:45:42.083Z",
	"details": { "originError": "role \"nishat\" does not exist" },
	"data": {},
	"path": "http://localhost:8000/credentials?limit=12",
	"type": "internal-error"
}
```

this probably came from podman-compose yaml update. because i added this key.
`network_mode: host` and now db is probably not working
after my arch linux system update, this podman is very disturbing
if i dont add above network_mode, then i would get this error

```bash

> make podman-up
podman-compose up
c2ad77420d33bb4ad8694457d3edf7188076428582bd24e3dd4d09d6a1d52872
fbaa243599038521bbda8f6fa286d2a8fc1236509606f22de81d0739b0610ba7
69b2ec208575b69597784255eec6fa6a2985ee9e1a47f4411a51f7f5fdd193a9
b3354cfc20ca9e06c0965e999f7dba8ad65912a71d64e824d8c7c29104722573
4d909c755b0b3fde60c4fdabc6b44c77dfef0c30856815e37447cb2fd8a19ee6
8ce4a8e8584594fcba2e3d448678335773df0036db3badacfdb974281f01df4a
7e45a44746dd032e7686d67a80de9b730aa6816f0cb172ac6e743aaea8e6f61a
[db]            | Error: unable to start container 4d909c755b0b3fde60c4fdabc6b44c77dfef0c30856815e37447cb2fd8a19ee6: setting up Pasta: pasta failed with exit code 1:
[db]            | Failed to open() /dev/net/tun: No such device
[db]            | Failed to set up tap device in namespace
[db]            |
[minio]         | Error: unable to start container 8ce4a8e8584594fcba2e3d448678335773df0036db3badacfdb974281f01df4a: setting up Pasta: pasta failed with exit code 1:
[minio]         | Failed to open() /dev/net/tun: No such device
[minio]         | Failed to set up tap device in namespace
[minio]         |
```

now that i add this line. and remove the existing network block. i am getting this err
