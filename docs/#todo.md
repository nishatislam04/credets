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

i want you to create me simple and convenient logger so that, our production terminal log does not clutter with logs. so, the source code may have the log func. and in dev, the log will be shown in the local terminal. but in production, that log wont be print.
meanwhile you are at it, we are using kitty terminal. so, i want you to pretty look the terminal output. the value should be first param and message is optional and later param. if we can add file name and which line the log was print from was shown. that would be much more convenient.
use bunjs api to achive that, if you need to. or third party tools
make the value looks colorful and formatted so that we can easily read it and understand the value and the source code too

---

1. rewrite bun.image processing with [imgkit](https://github.com/nexus-aissam/imgkit)
2. create a logger, production terminal log wont be clutter. even if we have log on the endpoint[6]
3. use ai to finalize backend. tell it create a docs, for what he did
4. use ai to finalize frontend. tell it to create a docs, for what he did
5. destroy and re build backend and frontend
	5.1. backend project name should `credets-backend`
	5.2. frontend project name should be `credets`
6. make sure by ai. frontend log does not appear in browser console
7. have a trigger point so that, render auto build
8. have a preview instance. research properly - what we need to do to create a preview environment
