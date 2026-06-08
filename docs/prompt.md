we are going to use supabase storage to store our credentials and credentials images file

these are da necessary env
access key id 2fa5cc0bd9e7647f6723924ecaa5ccb7
secret access key e8686c70cc9592232fbd75c9879112806d1a908ba42dca455177f51c0fc78445

endpoint https://ketjsycvccqtqwnxelza.storage.supabase.co/storage/v1/s3

region ap-southeast-1

add them in .env

we will use bunjs s3 client to upload and download our images. we need to update our sql datatype and seed script too (cchek if we need to update seed script)

we just decided not to store img bin in db & for now make sure, we can upload images in supabase storage in development. so update backend accordingly and check docs for proper context. tell me if yu need anything more

later, we will add a development tools to mock da storage behaviour. but not no
