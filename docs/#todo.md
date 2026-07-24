0. form "types" input is not showing err from server. fix it for both create and update form
   we are getting an error msg something like "Invalid input: expected array, received undefined"
1. in singel view page, create a section ui visual block naming "actions"
   inside that block, we will add multiple items later. but for now, only 2 items
   first one is: draft switch button
   second one is: favourite switch button
   update our db schema based on that and
   update forntend and backend and related places to make sure this feature works
   when an item is favourite, in listings page,
   we will show a filled star icon in the right side of credential card like top-right
2. in the listings page, after the top header. we will create a ui visual block.
   this block would contains several actions like button and stuffs which would control the listings.
   right now, we are just creating the ui. so that later we will add feature and functionality
   but for now add a switch button with "enable local cache" (only ui)
   a big search bar with placeholder text but no submit button (only ui)
   we have the +create btn at top-header. remove that from there and move it here in this actions section
3. our rte loading spinner in forms. make it looks beautiful loading spinner contrast to its parent container.
   so it should be shown in middle of x and y axis and a big but subtle
4. when an credential item is not found from server fetching. the ui should show not-found error ui.
   but its currently showing "failed to fetch credential error" with error ui page.
   create a beautiful not found err ui, if it does not exist already
5. in small view port, in create, update form page, only show back btn and remove the text.
   and in also increase the icon size a bit. since the text will be removed in small view port
6. create page, data block item fully messed up. it used to work perfectly. now broken fully.
   its quite unpredictable ui bug. but i am sure, this err only appear after i delete a block and that block had content
   so, when i refresh the page and delete an empty block and create multiple block. nothing happen as expected
   i wrote something on any block and then click any block btn to create a new block. i see multiple block has been created. but i dont understand why
   and if i refresh the page, write something on first block, then click any block to create a new block then i see that, the content i wrote on the first block has disappeared and then a very empty block create which have no inputs like no singel or key-value or textarea (any amount of this empty block may be created, on this reproducing issue)and then a new block was created which was pressed first to create a new block
   so why this weird behavior happening on our data block component. figure it out. and solve it
7. in backend index.ts file, we have hardcoded development: true. which may cause issue in production.
   so fix that. i.e make it dynamic based on environment
