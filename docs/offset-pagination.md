# the pagination guide. because pagination seems so complex to setup


## the procedure

### 1. construct the url because the pagination data is baked into url as query-params

```ts
const url = new URL(req.url) // `req` var is from the server request
```

### 2. extract the pagination data out of the url

```ts
const rawPage = parseInt(url.searchParams.get("page") || "1");
const rawLimit = parseInt(url.searchParams.get("limit") || "10");
````

above `url` var is from the first-step!

### 3. fix the `NaN` issue

```ts
const page = Number.isNaN(rawPage) ? 1 : rawPage;
const limit = Number.isNaN(rawLimit) ? 10 : rawLimit;
```

in `step-2` when the input is string or not number, it output as `NaN`.
here in step-3, we are fixing that!

### 4. some additonal calculation from above url extraction

```ts
const validPage = Math.max(1, page);
const validLimit = Math.min(10, Math.max(10, limit));
const offset = (validPage - 1) * validLimit;
```

so now `page` value can not be less than 1 and
`limit` wont be less than 10 and grater than 10!
and i dont understand the `offset` logic! i think, i dont even want to! lol

### 5. get the total count of resources

```ts
const totalCountResult = await sql`SELECT COUNT(*) AS count FROM crdentials`;
const totalItems = parseInt(totalCountResult[0].count);
```

### 6. fetch actual resources now

```ts
const credentials = await sql`SELECT id, images, created_at
 FROM credentials ORDER BY created_at DESC LIMIT ${validLimit}
 OFFSET ${offset}`;
```

### 7. (optional) map over the resource to format it! if needed

```ts
const dateOptions = {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
};

const parsedCredentials = credentials.map(credential=> ({
 id: credential.id,
 images: credential.image ? JSON.parse(credential.images):null,
 created_at: credential.created_at.toLocaleDateString("en-BD", dateOptions)
}))
```

### 8. then some additional calculation just for the pagination

```ts
const totalPages = Math.ceil(totalItems / validLimit); // `totalItems` is from `step-5`
const hasNextPage = validPage < totalPages;
const hasPreviousPage = validPage > 1;
```

these calculation can be done after count query!

### 9. final. THE RESPONSE

```ts
const response = {
 success: true,
 data: parsedCredentials,
 pagination: {
    currentPage: validPage,
    per_page: validLimit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next_page: hasNextPage,
    has_previous_page: hasPreviousPage,
    
    links: {
        first: `${url.origin}${url.pathname}?page=1&limit=${validLimit}`,

        previous: hasPreviousPage ? `${url.origin}${url.pathname}?page=${validPage-1}&limit=${validLimit}`
        : null,

        next: hasNextPage ? `${url.origin}${url.pathname}?page=${validPage + 1}&limit=${validLimit}`
        : null,

        last: `${url.origin}${url.pathname}?page=${totalPages}&limit=${validLimit}`
    }
 }
}

return new Response(JSON.stringify(response), {
 status: 200,
 header: {
    "Content-Type": "application/json"
 }
})
```

## this is the pagination wrap up

i have manually written it from the credentials listings api,
did not test this docs in any other routes,
so am not sure about this docs integrity and working possibility. hehehehe
