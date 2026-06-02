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

i want you to finalize my backend for production usage.
search and research what i am missing for a production environment for my setup
and how i should fix it and what will be nice to have
i am free person. cant pay anything. so suggest me some free tools, if you think which might be better for my backend setup. you know what i have already and what is left to implment. 
so based on that, provide suggestions and reccomendations
and write those directly in md file so that i can take my sweet time to read it properly
try to cover all kinds of cases
i already hosted the backend side at render platform web service. free tier
and i am willing to use more 3rd party tools and packages if they will help my web project. tell me about them. why i might need them and how to utilize their free resources
check the .env.production.local file for env keys 
i am using neon db free tier postgesql
for now only talk about backend side. later we will talk about frontend side. now focus on backend only

---

update my single view credential page `data-block` ui component looks so that, it looks consistent with my other shadcn component. use shadcn ui component if necessary. so that, when we switch theme to dark mode. the data block does not looks weird. by the way, right now, the data block bg and text color overall looks dumb in dark mode. but it looks ok in light mode. actually keep the existing light looks for light mode. and update only dark mode to stay consistent with my page and other ui components look

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
