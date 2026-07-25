# local cache system

our backend has cold-start situation. so, we will implement local cache system with indexedb with opt-in feature

## tools

1. tanstack query - i donno why i listed this. lol
2. idb-keyval (indexdb wrapper)
3. tanstack store - store password in memory
4. gcmwrap - encrypt-decrypt tool

## How it will works

### opt-in

Local-cache can be tedious. because each time cached data need to decrypted from indexedB after page refresh or browser tab closing. user may find it cumbersome to provide the master-password each time.
but backend cold-start can be annoying too. so, they can opt into local cache system, if they want to.
so, when they click the simple checkbox button to opt-in local cache, we will show an alert dialog with something like
"Data will be stored locally and encrypted. You will be prompted for a password."

### data flow

1. when try to fetch any resource, first check query memory
2. if memory data exist, load it. if memory not exist then check if they are opt-in to local cache
3. if there not opt-in, simply hit backend
4. if theyre opt-in, check is the particular cached data exist in indexdb
5. if cache data does not exist, then simply hit backend
6. if cache data exist but max-age is expired, hit backend
7. if cache data exist and max-age is not expired, check if the cache data need to be decrypted
8. if no need decryption, simply load it
9. if need decrypt, look up in the store for password
10. if password exist in store, use it to auto decrypt cache. [below failed attempt](multiple password failed attempt)
11. if password does not exist in store, prompt user
12. after success fetching operation, we will check if the user is opt into local-cache system or not
13. if theyre not opt-in, the data will be auto saved only in query (in-memory)
14. if they are opt-in, we will check fetched data-type-should-be-encrypt flags
15. if should-be-encrypt, we will check our store for password to encrypt it
16. if password exist in store, we will use it to encrypt data and store it in indexdb automatically
17. if password not exist, we will ask them to provide a new password to encrypt the data and store in indexdb
18. if should-be-not-encrypt, simply store it in indexdb (like for /credentials route) and no password needed here
19. each cached object will hold its own Max-Age value provided by backend
20. when they uncheck the opt-in btn, we will nuke password store and indexdb store

### password storing

we will never store the cache decryption key anywhere (as peresistent storage i mean)
we will store it in tanstack-store library.
so that, after providing password for one session, unless they refresh the browser or close the tab
they wont be asked to provide password again
we will check, if the memory has the password and use that to decrypt otherwise ask for password input again

### multiple password failed attempt

1. when a cached data need to be decrypt, we will first look up in store for password.
2. if password exist in store, we use it auto decrypt.
3. if auto decrypt fail in this step for the 1st time, we will simply notify the user auto decryption fail. manual password need to be provided and prompt the user
4. if user fails to provide correct password 1st time (after auto decryption) we will show err message like this
	"either password was wrong or decryption failed. please try one more time or fetch data from the backend"
5. after manual prompt fail 1st time, show prompt input again with above err message and a new btn "fetch from server"
6. and keep repeating this step from 4 to 5. after total 3 times failed attempt, we will show an alart with
	"multiple failed attempt to decrypt password. force fetching data from backend"

### what to cache

for now, we will automatically cache listings and single page view data.
later we will make it more granular

### multiple max-age

we will store max-age alongside with data in indexdb
when new cached data arrive but old data is not invalid yet, we simply nuke that specific data object and update the max-age timestamp
we can provide a `force-update` flags from the backend to make sure it nukes the indexdb

### encryption tool

we will use this tools to encrypt and decrypt data [gcmwrap](https://github.com/brc-dd/gcmwrap)

### UI

in the /credentials listings page header, we will show a simple checkbox with "local cache"
when checkbox is checked, we will show an shadcn alert like
> "Data will be stored locally and encrypted. You will be prompted for a password. This password will be later needed to decrypt local cache"
and same for opt out operation, when they unchecked checkbox, we will show alert dialog
> "all the local cache data will be nuked. and password data will be wiped out. But you can opt-in to cache anytime"

- in the listings page top header, we will show a badge saying "serving from local cache (human friendly readable data-time)" so that we can know the data we are seeing is from cache and when it was last updated
- when data is not serving from cache but directly from backend fetching, we will simply remove the badges and show nothing else in the top header
- when serving cache, we will show a btn with "update cache" if the cache is 5 min old

### opt-out

when opt out (meaning they might be opt in previously) we simply nuke the entire indexdb with an alert dialog
