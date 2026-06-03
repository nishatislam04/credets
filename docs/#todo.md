# our workflow


## create form more tasks --frontend

- [] 1. when click on single-label, key-value, information.
auto focus on those input.

- [] 2. add information on tags about addding comma for multiple tags

- [] 3. in `DataBlock` component, add manual types for `item`, `form`

- [] 4. add proper props for submit button. like loading and etc

- [] 5. when no data block exist, show a placeholder text

- [] 6. show server validation error in frontend form


### other

1. hide timestamp from gooey toast

---

## backend cleanup and setup for final and docs it all the steps

i want you to finalize my backend for production usage.
search and research what i am missing for a production environment for my setup and source codes
and how i should fix it and what will be nice to have and must to have
i am free person. cant pay anything. so suggest me some free tools, if you think which might be better for my backend setup and source codes.
you know what i have already and what is left to implment.
so based on that, provide suggestions and reccomendations.
and write those directly in a dedicated md file, so that i can take my sweet time to read it properly and decide what to do with it later
try to cover all kinds of cases for backend side only with bunjs and third party tools usage
i already hosted the backend side at render platform web service. free tier
and i am willing to use more 3rd party tools and packages if they will help my web project anyhow. tell me about them. why i might need them and how to utilize their free resources and free tier
check the .env.production.local file for production env keys
i am using neon db free tier postgesql
for now only talk about backend side. later we will talk about frontend side. now focus on backend side only

---

## update credential single page data-block ui looking in dark mode. and keep the light mode as it is[*]

update my single view credential page `data-block` ui component looks so that, it looks consistent with my other shadcn component. use shadcn ui components if necessary. so that, when we switch theme to dark mode. the data block does not looks weird and out of the world. by the way, right now, the data block bg and text color overall looks dumb in dark mode. but it looks perfect in light mode. update only dark mode to stay consistent with my page and other ui components look

---

## invalidate credential listings after create a new credential[*]

after creating a credential, when we go back to listings page, we dont see the newly created item. to see the new credential item, we need to refresh the page. but that was not how it was supposed to work. maybe the listings were cached or something else. just make sure, after creating a new credential, when we navigate back to listings, we will be able to see new credential item in the top as it was supposed to.

---

## invalidate credential listings after deleting a credential item[*]

after we delete a credential item, it redirect us back to listings, which is ok. then in the listings, we still see the old item. while it should not be there. fix this issue.

---

## back button position consistent

i want the back button postion consistent for single credential page, create page form, update page form. back button for the create and update page should be at the same line as the header. the header will be postioned at center and the back button should be at the left side. this postion concept should be similar for both create and edit page. back to listings from create page. back to single credential page from edit page

---

## fix credential delete issue by fixing the CORS error[*]

we cant delete credential item, in production. when we try to delete a credential item, i see CORS issue. please fix the cors issue

---

## important logs should be rendered for the backend side in backend terminal

we update our logger function to not show unnecessary logs in backend (render) terminal. and it properly working. now the issue is, all kinds of logs are suppressed. which we cant afford to. there are important stuffs, we need to log always. i want you to scan all the codes in backend side and make sure important incidents like creating resources, updating resources, delete resources or any failed attempt should be consoled in the terminal. in other word, make sure these incidents or similar important incidents logs does not suppressed.

---

## discard usequery approach, anywhere it is used

we used usequery to fetch data in frontend multiple places. like create form page, csrf fetching, typeslistings fetching. while, i think, we can keep typeslistings fetching inside of usequery because, it is needed later (after page render) but we should move the csrf fetching inside of tanstack router loader func. since this is important for the form. and show loading state and error state. so move csrf fetching logics to loader function for both create, edit form.

---

## extract delete ui logics and presentation logic into components[*]

i want you to extract credential delete logic into new component and import it in edit component. i dont want to clutter edit page anymore than it already is. so, all the backend hitting and ui representation of delete ui components, move it to a separate components. where should we put this delete logic is the real questions. should we create a delete frontend endpoint or just a private routes? since, delete button is in update page. i think it is best to create a private dir inside of update/ named -delete/ and put ui logics and backend hitting logics there

---

## create a dockerfile only now[*]

in our render production, they have bun version max support 1.3.4. but we need this bun version 1.3.14. so, we are planning to create a dockerfile and have the max latest bun version there. and choose docker in render. we hope that, it will works.
i need bun builin image processing. so, i am not sure, which bun varient to go with.
i want small bun image but also make sure, all the bun api is supported.
here is the docker [hub bun links](https://hub.docker.com/r/oven/bun)
the available varients are - debian,slim,alpine,distroless
on the local development, we will use local machine bun to power the local development.
but on the production, we want to make sure, render platform use our latest (1.3.14) version.
i want you to create the dockerfile for our backend part only. and design it based on our monorepo project structure. make sure to cache stuffs in dockerfile. like follow dockerfile best practises to design it based on our setup

---

## introduce a new database for our credential_images bin data

currently, we have a free tier of neon database. we store everything there. and we use bunjs sql client to communicate with that neondb in production. we have users, session, types, credentials, credential_images table in neon db.
i was planning to introduce a new database solely for our `credential_images` in production. so that means, in local, we will use single database to store all models. 
and we will use at least 2 databases. one for everything except credential_images and another one is for credential_images only. based on bunjs connection.ts file.
can we do that? and if we do that, what issues may arise?
should we separate the db like single for local development and 2 for production? it will complicate setup more? or we should also create 2 db locally, which may ease setup?
if we can accomplish that, we can transform our images more high quality. and lazy image loading (deferred)
so, tell me everything about it. how can we set it up and do we need to add any extra layers for this. everything in details with coding explanation. so that i can understand how it may works and what we need to do

---

## normalize shadcn skills. so that any ai agents can pick it up and use it if necessary

figure out a way to convert frontend shadcn skills to normlize. meaning any agents or ai will be able to pick it up and analyze it. because, when we install this skills, we chose windsurf profile. and we dont use windsurf ai agents plus we can use any kinds of ai agents. so we want to make sure, the skills are picked up, when needed. never ignored when the agents need to mess around with shadcn ui components

---

## production lazy loading fixing

currently in render free tier, we are facing cold starts. is there any way fix this issue? like tanstack cache or anyhow? when we hit the credentials listings, i see loading skeletons for a long time... so, i was wondering, can we do some work around. like in production, all of our credentials will be highly static. unless we want to update something or delete any. you know, credentials are supposed to be static. since, there is a cold start issue, i was thinking, with the stacks we are using, can we fix this issue anyhow. i want you to detials research about this issue based on our stacks & setup

---

## swap imgkit pkg with bun.image api[*]

we initially had bun to process our images at create backend endpoint. then we saw that, render platform does not support latest bun. so, img processing does not works too. 
and now that, we have docker with latest bun version. i think render will be able to use our docker bun version to process the images
so, i want you to swap out imgkit usage in backend. and search bun docs for bun image api usage. and implement the bun image api
and remove imgkit and its gnu entry

---

- [x] 1. rewrite bun.image processing with [imgkit](https://github.com/nexus-aissam/imgkit)

- [x] 2. create a logger, production terminal log wont be clutter. even if we have log on the endpoint[6]

- [] 3. use ai to finalize `backend`. tell it create a docs, for what it did

- [] 4. use ai to finalize `frontend`. tell it to create a docs, for what it did

- [] 5. destroy and re build backend and frontend
      - [] 5.1. backend project name should `credets-backend`
	  - [] 5.2. frontend project name should be `credets`

- [x] 6. make sure by ai. frontend log does not appear in browser console

- [] 7. have a trigger point so that, render auto build

- [] 8. have a preview instance. research properly - what we need to do to create a preview environment
