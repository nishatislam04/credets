5. [favorite page] just like our existing (previously implemented) trash route, implement this route similarly as ui level and then respect the following requirements. follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent structure. here we will show all the favorite items in a dedicated page
   create a content header and then an action ui block. which will hold
   a search input bar like listings page [only ui]
   refresh btn
   select all
   delete all with confirmation dialog
   and then the card item would just show the title, short description and type only
   and clicking this item would fire up our single view page with selected item
   and clicking back btn would navigate back us to favorite listings page

6. No Request Body Size Limits: add size validation at the start of create/update handlers
   so that our free tier services does not exhaust or oom or something like that
   the max size should be for create and update is 10mb
7. No Request Timeout: on backend, we will wrap our expensive, time consuming functionality with a `withtimeout()` util function with abort controller. for now, i think only the create, update image processing need to be wrapped up with this util function. with a 30second timeout. and handle what should happen if any operation exceed this 30s window
8. Production Logging is Not Structured:
   Your `logAlways` function works, but it outputs formatted text with ANSI colors and `Bun.inspect` — great for local development, but **unparseable by log aggregation services** (Render's built-in log viewer, Better Stack, etc.).

**Fix — add a structured JSON logger for production:**

```ts
export function logJSON(level: string, message: string, meta?: Record<string, unknown>) {
	if (process.env.NODE_ENV === "production") {
		console.log(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level,
				message,
				...meta,
			}),
		);
	}
}
```

Then in your critical operations:

```ts
logJSON("info", "credential created", { title: validatedData.data.title });
logJSON("error", "delete credential error", { error: error instanceof Error ? error.message : "unknown" });
```

Keep `logAlways` for startup banners and critical server events, but use structured JSON for data operation logging.
update my backend with this requirements. because we will badly need this
while you are at it, update the ai agent instructions so that when it write or update any endpoint,
it use proper logging-scope. by the way, the err meta object should follow common convension for consistent

9. No Security Headers: we need some Security header for our response based on our setup and stacks
   so update accordingly so that the Security header is attached with our custom response.

10. we need to wrap our homepage (/) with contents based on the existing data we are already having, the newly implemented feature, and the upcoming feature. these all 3 concepts.. lets act like theyre already implemented. and now based on this data, we are going to update our homepage. i am hurrily completing this because, we are going to add this website in our cv. so, i want to create a fast version which is least presentable
    tho later, we will calcaulate these stats data based on real db data and our usage based. but for now, lets mock these data as close to realistic as possible. so that our homepage looks finished and working state. and this homepage will act like a whole overview page for all of our resources for this app
    we wanted to show some chart. so, based on our resouces and how its manipulated, fire up some shadcn chart please. i will leave this chart idea to you.
    we will also show some cards based on our resources
    and some quick links to fast navigate to some most commonly visited routes. here we will simply hardcore guess which routes they might want to visit often so, we will load those here in this section
    we will render dark toggle theme btn here
    we wont have header, sidebar like we had in credentials route.
    this is like a dashbaord overview page for all of our resources. so that we can quickly glance and quick navigate if needed
    as i said earlier, make these mock stats close to realistic

11. we will develop 2 new route page for update form
    right now, we can update credential item from single page and from draft page
    and the update page is complex alone by itself. but now, we also dump our update form for draft in a single component page. i dont want it. keep our first update form doing its update job (like before we added draft udpate logic in a single update form page) and then introduce a new update route inside of draft route. and this update route will be dedicated draft related updating
    i know there will be lots of duplicate. but its ok. we will keep apart update page from each other and do whatever its needed in frontend, backend, zod schema etc for that

12. we will add this project in our cv. we will have only 4 bullete points to describe the most stunning and attractive feature we implemented and yet to implemented (we will act like 'yet to be implemented' features is already implemented) in this project. then below we will have a tech section defining the stacks used on this project with comma separated. you add as much as you want, i will delete unnecessary if needed
    so you generate me content based on the requirements and research and make the bullete points content simple and straightforward and plain simple
