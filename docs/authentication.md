# this is where we will layout our auth system information details

## Authentication

Since i will be the only one user, we will build a simple auth system.
our `signin` page will have

- username,
- email,
- passowrd,
- special-password [read below](## spacial-password)

when all the credentials verified, we will create a session and attach the 
sessionId to the user.
then on each request, this sessionId which was set on cookies, will be auto attached.
then on the server, we get the sessionId and verify if the sessionId exist
and it is pure.
then proceed with user request!
> we wont set `Max-Age` or `Expires` attribute on the session cookies.


### generate the special-password-encrypt-key

```bash
openssl rand -hex 32
# then on the .env
ENC_KEY=VALUE
```

store this in env and use this key to decrypt the special-password static part.


## Sign up Form

1. name
2. username
3. email
4. password
5. special-password (which will be used for the `special-password` static part)



## special-password

our special-password contains 2 part. static and dynamic part.
FOR NOW, we will raw store it in db and check if they are valid
@@ ! SOON, we will add encrypt decrypt system.
@@ ! it seems like enc and dec are too complex. LOL
then dynamic part will be like todays full date -- "2026-04-29"

### special-password-encryption

we have created a utilz function at `backend/utls/encrypt.ts` to encrypt any text.

```ts
const payload = "data to encrypt"
const sealedValue = await encrypt(payload);
```

then we can store this encrypted data on db.


### special-password-decryption

we also have a decryption utilz at `backend/utils/decrypt.ts`

```ts
 const fetchedUser =
 await sql`SELECT id, name, username, email, password, special_password 
 FROM users WHERE username='nishat004'`;

 const decryptSpecialKey = await decrypt(fetchedUser[0].special_password);
```

so, first fetch the encrypted data from the db.
then run the `decrypt()`  to decrypt it


### special-password-dynamic-date-part-matching

now i am going to show you how to match the full special password logic!
first we fetch the encrypted data from database and then decrypt it with our
`decrypt()` util function. now we have the special password static part!

in the special password verify logic, there are couple of things to do.
after we make sure, all the username, email, password are valid then
we will proceed to special password verfication

### 1. extract the input date and parse it

we strictly need to follow this date format which we will recive from the user.
otherwise system will break! *dd/MM/yyyy* *(03/05/2026)* or *(3/5/2026)*

```ts
import { parseLocalDate } from "@backend/utils/parseLocalDate";

const inputSpecialPassword = "nishat islam 004. 3/5/2026";
const [_, inputDate] = inputSpecialPassword.split(". ");
// verify date and early return on error
const parsedLocalDate = parseLocalDate(inputDate); 
```

### 2. then parse the server date

```ts
const serverDate = format(new Date(), "yyyy-MM-dd");
```

### 3. check if local and server date match

```ts
const dateCheckPassed = parsedLocalDate === serverDate;
```

### 4. now decrypt the special key from above section

### 5. now construct both server and local special password

```ts
const serverFullSpecialPassword = `${decodedSpecialPassword} ${serverDate}`;
const localFullSpecialPassword = `${inputSpecialPassword.split(".")[0]}. ${parsedLocalDate}`;
```

here `inputSpecialPassword` is the full special-password from the user.
then we append our parsed date to make sure, it looks same and then we check

### 6. match both password

```ts
const isFullPasswordMatch = serverFullSpecialPassword ===
`${inputSpecialPassword.split(".")[0]}. ${parsedLocalDate}`;
```

## for now this is how we will implement special-password check
