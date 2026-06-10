# our workflow

- [x] 0. in the credentials listings page, with intersection observer, we are manually fetching more data automatically. i want you to read the whole page and understand the logics and related components. and then use tanstack query - useinfinitequery for infinite loading operation with intersection observer. now for intersection observer, i want you to use the react intersection observer pkg. i have already installed the observer pkg. i am not sure, but i think, if we have useinfinitequery hook in the credentials listings page, we probably dont need the initial usequery hook in the first place. also update the component based on this research

- [x] 1. in credential create form, when we click the x button in the img preview, the img preview gone as expected but the file input for the thumbnail img. the img file name still exist. we need to clear that

- [x] 4. update our custom logger `log` function naming to `logger` and update all the usage in the backend

- [x] 5. i dont like the visual representation of gooeytoast description text. can you update the visual with its container bg and surrounding colors? and make sure, all the gooeytoast state, never shows any timestamp. like no timestamp at all. i already saw timestamp at err toast. so, other state may also show timestamp. but i think the success state does not show timestamp already

- [x] 1. update-form gallery img preview showing "no data" inside of img card. instead of image previewing. note that, our image process updated. for local, we use minio and for production, we use supabase storage. and same case, update form, for thumbnail file input, if there are thumbnail exist already, hint it and preview it

- [] 2. update submit btn locked strategy in update form page... like we update non required field and did not modify or touch any important required field...then the submit btn is locked. fix this tanstack form issue. to unlock i need to change a bit of any important field. which is very weird

5. i sometime i get this err when try to update credential images or thumbnail.. pattern not clear.. but happened multiple times. err at db level. something with syntax

```bash
	credets-db              | 2026-06-09 06:07:59.160 UTC [2791] ERROR:  operator does not exist: uuid <> json at character 81
credets-db              | 2026-06-09 06:07:59.160 UTC [2791] HINT:  No operator matches the given name and argument types. You might need to add explicit type casts.
credets-db              | 2026-06-09 06:07:59.160 UTC [2791] STATEMENT:  
credets-db              | 						DELETE FROM credential_images
credets-db              | 						WHERE credential_id = $1 
credets-db              | 							AND id != ALL($2::JSON[] )
credets-db              | 					
credets-db              | 2026-06-09 06:08:11.125 UTC [2791] ERROR:  operator does not exist: uuid <> json at character 81
credets-db              | 2026-06-09 06:08:11.125 UTC [2791] HINT:  No operator matches the given name and argument types. You might need to add explicit type casts.
credets-db              | 2026-06-09 06:08:11.125 UTC [2791] STATEMENT:  
credets-db              | 						DELETE FROM credential_images
credets-db              | 						WHERE credential_id = $1 
credets-db              | 							AND id != ALL($2::JSON[] )
credets-db              |


  LOG   repo: db update transaction failed
  PostgresError: operator does not exist: uuid <> json
      errno: "42883",
       hint: "No operator matches the given name and argument types. You might need to add explicit type casts.",
   severity: "ERROR",
   position: "81",
       file: "parse_oper.c",
    routine: "op_error",
       code: "ERR_POSTGRES_SERVER_ERROR"
  
        at wrapPostgresError (internal:sql/postgres:171:27)
        at onRejectPostgresQuery (internal:sql/postgres:199:33)
  

  📍 apps/backend/repository/credentials/update.ts:112
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```


7. in update form, if thumbnail exist... hint it and preview it in thumbnail file input
10. we used ai to generate most of the feature. now we want to review the ai implementation manually. create a dedicated docs in docs/ to guide me, how to do it fast and systematic way
11. figure out how we can debug backend and frontend with zed editor. both end debug is possible. but i am not sure, how to set it up

## create form more tasks --frontend

- [] 1. when click on single-label, key-value, information.
auto focus on those input.

- [] 2. add information on tags about addding comma for multiple tags

- [] 3. in `DataBlock` component, add manual types for `item`, `form`

- [] 4. add proper props for submit button. like loading and etc

- [] 5. when no data block exist, show a placeholder text

- [] 6. show server validation error in frontend form


---

## hide da thumbnial when no images in single credential page

dont show thumbnial where we show images. when there is no images
when there are images, then thumbnial does not render anyway.
so, we wont render tubumbnail in da first place
