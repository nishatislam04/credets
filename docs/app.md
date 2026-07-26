# This Is Our App Story. Stacks & Requirements Etc

we will practise a monorepo application here plus create a website for
myself for storing all my credentials. here we will also practise web
security best practises since this website will hold our important credentials

## Stacks

1. Backend - Bun
   2. Frontend - Tanstack Router
2. UI Library - ShadcnUI
3. Databases - Postgresql
4. DevOps - Podman (Docker alternative)
5. Email - Resend
6. Validation - Zod
7. Backend hosting platform - Render
8. Fontend hosting platform - Render
9. Authentication - Not sure yet. should i slap a lib or do it manually
10. File Upload - s3 (supabase)
11. Cache - IndexedDB

## Requirements

[] create a web application where we can securely store our crednentials.
[] create new credential, update existing credentials, delete unnecessary!
[] full auth and authorization for each routes
[] add media uploading support
[] bulk export credentials with email
[] make the credentials input very flexible. as they dont follow a strict structure
[] local cache(IndexedDB) to fix server cold start

## Feats

1. credentials listings
2. create new credential
3. update existing credential
4. delete old credential
5. manage types
6. searching, sorting, filtering, pagination
7. bulk export support with email
8. password lock
9. credential encryption
