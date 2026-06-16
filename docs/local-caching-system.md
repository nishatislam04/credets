# local cache system

our backend has cold-start issue. so, we will implement local cache system with indexedb with opt-in
for now, we will only show a checkbox saying if they want to opt into local cache or not in the listings page top header
when its checked we will show an shadcn alert with necessary information
and same for opt out operation, when they uncheck local cache, we will show and confirmation
we will cache automatically the listings page and single view page for now. later we will handle it more granular way to choose from options. but not now

## tools

1. tanstack query - i donno why i listed this. lol
2. idb-keyval (indexdb wrapper)
3. tanstack store - store password in memory
4. gcmwrap - encrypt-decrypt tool

## How it will works

### opt-in

Local-cache can be tedious. because each time cached data need to decrypted from indexedB after page refresh or browser tab closing. user may find it cumbersome to provide the master-password each time.

but backend cold-start can be annoying too. so, they can opt into local cache system, if they want to.

### data flow

1. when first time accessing the app, there will be no local cache saved up. so, the request need to trip to backend.
2. after success fetching operation, we will check if the user is opt into local-cache system or not
3. if they are, we will ask them to provide a new password to encrypt the data
4. then we will use the key to encrypt credentials-data and store in indexedb with tanstack query
5. the cache is saved up in indexedB and a piece of Max-Age data for that cache in local-storage
6. now, lets say, use refresh the page or close the browser tab
7. we will check if the user opt-in to local-cache and then if cache is still valid based on Max-Age
8. if it is valid, we will ask the user to provide the password to decrypt cached data
9. if the password is wrong, we will show the password incorrect and input field and after 2 (total 2 attempt) wrong attempt, we will show a button to fetch it from the backend
10. if they want to fetch it from the backend, and after success fetch, in the client, we will check, if the user is opt-into local-cache system
11. if the user is opt into local cache system, we will ask the user to provide new password to  cache it locally again

### password storing

we will never store the cache decryption key anywhere (as peresistent storage i mean)
we will store it in tanstack-store library. like in memory store
so that, after providing password for one session, unless they refresh the browser or close the tab
they wont be asked to provide password again. because the password will be store in memory
we will check, if the memory has the password and use that to decrypt otherwise ask for password input again

### what to cache

for now, we will only show, a checkbox with if the user want to opt in to cache sytem
and we will automatically cache the listings page and single view page.

later we will have it more granular control. like what they want to cache

### how to retrive cache

so for now, we will automatically cache listings page and single view page only
for now, whenever user try to fetch data from the backend, we will check couple of things step by step

1. if they are opt into local cache
2. if yes, does tanstack-query have the cached data available
3. if query has cached data available and can be used, load cache data from there and render it
4. if no, check if indexedb has cache data saved up based on route, since we will support multi page cache
5. if cached data exist in indexdb, then we check in indexdb for the cached data Max-Age
6. if data is valid and not stale, then we check in tanstack-store, if password exist
7. if password exist in store, try to auto decrypt data and render it
8. if password does not exist in store, prompt the user for password for decrypt cache data
9. if prompt password is correct, use it to decrypt cache and store password in tanstack-store and data in query cache
10. if prompt password is incorrect for 2 times, we wil show incorrect msg and also says, something might be wrong with cached data, please refetch again. show a btn to fetch data anyway
11. if they try to force fetch here, we will bust out old cache and start a fetch operation
12. then upon success fetch, we will check if they're opt in, and prompt them for new password
13. (step-6+) but when cached data in indexdb is stale, we will delete old cache data and then we will simply hit the backend for refetching brute-forcing
14. when we see that, user is opt in and no query cache and no indexdb cache. we simply hit backend to fetch data and check if theyre opt in and since no cached is saved up in indexdb, we will prompt the user for new password again for this newly fetched data
15. if user does not provide prompt password (like empty input or null), we will not simply store the data in indexdb. and simply show an toast with data not saved in cache because there was no password
16. whenever we need to bust cache, we will simply nuke the indexdb

### multiple max-age

all the query data that need to be cached, we will always provide and 1month expired date on the query data.
then in the frontend, we will check if indexdb has max-age value
and if that value is older than current time or not
if older, we will simply nuke the indexdb and store current data
if stored max-age is newer than current date, we will simply ignore the `max-age` update operation and only update the data in cache
this issue may occur, when multiple potential cached data hit backend one after another. then we will have multiple max-age to handle. so, by following above logic, we can fix this issue
we can provide a `force-update` flags from the backend to make sure it nukes the indexdb


### encryption tool

we will use this tools to encrypt and decrypt data [gcmwrap](https://github.com/brc-dd/gcmwrap)

### opt-out

when opt out (meaning they might be opt in previously) we simply nuke the entire indexdb
