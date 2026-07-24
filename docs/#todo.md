1. implement simple shadcn header for credentials and all of its children like the create, update form page
   but this header should not exist outside the /credentials route. only for this route and its children
   this header should contains simple layout.
   like in left side, a big C with nice font (handwritten font would be best i think) then a dot (.)
   so, its like this, "C." on this left side
   then on the right side, we will show a search bar. this search bar will act like a global searching
   the search input bar will have a dropdown button, clicking on it show some dropdown items
   item: all (default checked), credentials, types, favourite, trash (we will add more later)
   these items are clickable. we will now implement only ui part now. later when we click on this item,
   the query input will be searched with selected dropdown item. but we will implement this later
   and nothing else on header
2. implement shadcn sidebar. similarly for credentials and its child route only
   on big ui, the sidebar should always show
   but in small ui, it should render with the button collapsible functionality
   just simply render all the nav item lists straightforward like one after another with icon on left side
   make it looks simple but it should cover all the way to the end (right side) when sidebar collapse is open.
   i think shadcn default sidebar is not full width is not full in small viewport. but we want ours to be full width
   navitems are:
   home, credentials, types, draft, favorite, trash, password, profile, settings (we will add more later)
   and then on the very bottom, we will hard code login avatar with profile picture round on left (rn show a default)
   then the name on right (Minhajul Islam)
   then the email address in subtle font (nishatislam3108@gmail.com)
   and a red icon defining signout button on this avatar container
3. [trash page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent structure. we will now implement the trash page. so, create a frontend route for trash page
   the header with content and below an action buttons placeholder like listings page.
   a search input bar like listings page [only ui]
   refresh btn
   a checkbox with "select all"
   an button with permanent delete all. which will show an confirmation dialog
   now each item card in this trash page, right? i am thinking about showing
   title and type on the card item. and when this card item is clicked,
   it will show a shadcn dialog component with all the item full details
   with highlighting delete when date in human readable format
   we will show all information about selected item in shadcn dialog.
   so that we can see what we are actually deleting
   just simply show all the info in nice separate ui block in appropiate order
4. [draft page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent structure. in draft page, we will have a header with content
   and then actions block ui to hold actions btn. like
   a search input bar like listings page [only ui]
   a refresh btn
   a checkbox with "select all"
   delete all btn. with confirmation dialog
   now for each item card, we will show only title and type(if exist!)
   and a "load it up" btn in the right side
   clicking this btn would fire up the edit page. so that we can modify and update the item
5. [favorite page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent structure. here we will show all the favorite items in a dedicated page
   create a content header and then an action ui block. which will hold
   a search input bar like listings page [only ui]
   refresh btn
   select all
   delete all with confirmation dialog
   and then the card item would just show the title, short description and type only
   and clicking this item would fire up our single view page with selected item
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
it use proper logging-scope. by the way, the err meta object should follow common convension for consistent 9. No Security Headers: we need some Security header for our response based on our setup and stacks
so update accordingly so that the Security header is attached with our custom response.

9. update header: in small view, make sure our search input stays as big as it can but its related dropdown should shrink down to smaller
   like, if we choose "credential" for an example, the whole dropdown occupy a lot of space. becuase the item is too big
   but it should eclipse the word like this "cred..." this was just for an example. and it should happen also with all the other items too. but this should not happen in big viewport
   and in big view, the search input bar should be more wide
   we should always show the collapse item. so that in bigger viewport, if needed, we can collapse the sidebar if we want
   clicking on the "c." on the header should navigate us to homepage
10. first i was in credentials route, so in sidebar, the credentials nav item was highlighted as expected. then i clicked trash item from sidebar now, the sidebar shows 2 highlight item. but it should have only highlight trash item only. since we are in trash route
