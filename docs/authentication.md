this is where we will layout our auth system information details

# Authentication

Since i will be the only one user, we will build a simple auth system.
our signin page will have
- username,
- email,
- passowrd,
- special-password (read below)[## spacial-password]

when all the credentials verified, we will create a session and attach the 
sessionId to the user.
then on each request, this sessionId which was set on cookies, will be auto attached.
then on the server, we get the sessionId and verify if the sessionId exist and it is pure.
then proceed with user request!
> we wont set `Max-Age` or `Expires` attribute on the session cookies.

## special-password

our special-password contains 2 part. static and dynamic part.
FOR NOW, we will raw store it in db and check if they are valid
@@ ! SOON, we will add encrypt decrypt system. 
@@ ! it seems like enc and dec are too complex. LOL
then dynamic part will be like todays full date -- "2026-04-29"

### generate the special-password-encrypt-key
```bash
openssl rand -hex 32
```

store this in env and use this key to decrypt the special-password static part.

# Sign up Form

1. name 
2. username
3. email
4. password
5. special-password (which will be used for the `special-password` static part)


## forget-password

we will seek `EMAIL` and send a link to reset the password. 
this endpoint should be short-lived. like after 5 minutes, this link wont work anymore
