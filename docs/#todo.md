0. add an "draft me" button in create page form
   so, we are implementing this feature because we maybe in the middle of creating an item.
   and we decided to stop this creation operation. but we dont want to loose all of our manual input data
   so, when we click this item, the unfinished content will be send to backend and it will be marked as draft
   later, when we want to.. we can load this draft item up, but that feature for next time
   so right now, we will only implement this draft feat from form create page
   so another thing here is, right now, our form is least title, and types are mendatory.
   but we decided to create the title only and draft it. so, normally we would get validation err from zod
   but since the draft btn was enabled, we wont see any validation err and the data will be stored in db
   and we will show an confirmation toast in ui, with draft operation success

1. we will show an delete btn in single view page at sidebar but as a last item
   when we click, it will show a shadcn confirmation dialog.
   with confirming, we will delete the item
2. we will implement soft delete feature now
   when delete, it will mark as deleted in db and it wont be listed in listings page anymore
   and there will be no cron job to periodic check to delete
   for now only implement this soft delete feature. later we will create a dedicated trash page
   uh.. most importantly, update the delete dialog with saying, this item can be found in trash and then either persmanently delete it or retrive it
3. [trash page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent. we will now implement the trash page. so, create a frontend route for trash page
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
4. [draft page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent. in draft page, we will have a header with content
   and then actions block ui to hold actions btn. like
   a search input bar like listings page [only ui]
   a refresh btn
   a checkbox with "select all"
   delete all btn. with confirmation dialog
   now for each item card, we will show only title and type(if exist!)
   and a "load it up" btn in the right side
   clicking this btn would fire up the edit page. so that we can modify and update the item
5. [favorite page] follow my existing route creation, component structuring etc strategy. so that, the codebase try to be consistent. here we will show all the favorite items in a dedicated page
   create a content header and then an action ui block. which will hold
   a search input bar like listings page [only ui]
   refresh btn
   select all
   delete all with confirmation dialog
   and then the card item would just show the title, short description and type only
   and clicking this item would fire up our single view page with selected item
6. update our listing page action ui block with separator. so, i want it like this...
   i actually just want to show the ui segment as an separator in our listings page action block ui
   so, like, the search bar and its below items (fellow buttons) is one column and create btn is 2nd column
   and we will show an very thin separator in the middle of the column
   and then another separator in the between of search input and action buttons
   these separator should be full width or full height. like from the start to end
