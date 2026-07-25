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
update my backend with this requirements. because we will be badly need this soon. as i will introduce logging services etc. but! if this logjson approach replace my logalways approach... when i am in development, i will probably see simple colorless js object, right? but its nice to see the old colorful log output in dev server. but in other log service, this logging approach is not acceptable. looks like we need to do something quite intelligents here in this scenario
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

11. theres this weird behavior on sidebar i have noticed. like for example: in single view page, in big viewport,
    i have collapsed the sidebar. then i press the back button to go to credentials listings page. and bam! the sidebar is open again. the sidebar state actually does not persist. we need to fix that. search shadcn docs to fix it. they might be have a guide on this issue

12. from favorite route, if we press back btn we should be navigate back to favorite listings page. but we are back to credentials listings page

13. add night mode toggle btn in sidebar top header with right beside the title text

14. there is some cache issues. from credential listings - single page view, if i draft any item and then i press back button i see that as expectedly the item disappear from the credential listings. but then i select the draft item from navbar and draft listings is open. but i dont see the new draft item. when i press the refresh button. then i see the new item. which is not how it should be working. when we draft it and go to draft page afterwards, we should be able to see the item in draft listings there automatically without refreshing

15. there is some cache issues. from credential listings - single page view, if i fav any item and then i press back button i see that as expectedly the item is favorite from the credential listings. but then i select the fav item from navbar and fav listings is open. but i dont see the new fav item. when i press the refresh button. then i see the new item. which is not how it should be working. when we fav it and go to fav page afterwards, we should be able to see the item in fav listings there automatically without refreshing

16. there is some cache issues. from credential listings - single page view, if i trash any item and then i press back button i see that as expectedly the item disappear from the credential listings. but then i select the trash item from navbar and trash listings is open. but i dont see the new trash item. when i press the refresh button. then i see the new item. which is not how it should be working. when we trash it and go to trash page afterwards, we should be able to see the item in trash listings there automatically without refreshing

17. [types listings page] since our types is actually parent child relationship. i think, in our dedicated type listing page, we should not allow create type, delete type. because create-type can be done from credential create form. and delete will cause relationship issues in trees. so, in our type listings page, we will only do the listings and update operation.
    now i am actually wondering, how we should do the listings feature on this dedicated listings page...
    should we just simply and single handedly list each item independently even if it has child or if it is the child
    or should we render the whole tree based on all the existing types for each credential. so like, for each credential, we will show the title and the types trees in the listings page in the single card.
    or do we do something else. since, our goal here is to only listings all the types and update any existing types label only if needed. and this is for the type listing ui part. update backend and frontend based on this logic
    now the whole type listings page, similarly like favourite, trash page. we will have a heading and then a action block with refresh, select all checkbox only
    then the listings card. the card should show credential title it belongs to and then nicely show hierachical order way the parent child types in a nice big way. with icons and stuffs
    and clicking on any of this card, would simply render a shadcn big wide dialog. where each type label can be editable and updateble.
    here is another case, in independently, some singular type may exist twice or multiple times in types table.
    so, from a specific credential, if we update that specific type. it should only update that type only. not the other. we need to make sure that

18. the global search bar width issue in bigger viewport.
