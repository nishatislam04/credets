# our workflow


1. update-form gallery img preview showing "no data" inside of img card. instead of image preview. note that, our image process updated. for local, we use minio and for production, we use supabase storage.
2. update submit btn locked strategy... like we update non required field and leave unchange of important field...then submit is locked. fix this tanstack form issue. to unlock i need to change a bit of any important field
4. remove da thumbnial with cross btn should clear out file input file name from create form
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

6. update the description text visuality for our gooeytoast
7. in update form, if thumbnail exist... hint it or preview it in thumbnail file input
8. when scrolling in listings, make sure each list appear more faster (for animation)
9. update our custom log function to logger and update its usage
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
