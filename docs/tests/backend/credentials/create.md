# Unit Test Analysis — the Credentials Create Endpoint

This doc analyzes the whole credentials create flow and shows you what
to unit test at every layer. It does not contain finished test code —
you will write that yourself. What you get here is the thinking model:
what the input is, what the output should be, which dependencies to
mock, and which bun test APIs fit each case.

Read this doc with the source files open, in this order:

- apps/backend/http/credentials/create.ts
- apps/backend/validation/credential/validator.ts
- packages/shared-schema/src/credentials/create.ts
- apps/backend/services/credentials/create.ts
- apps/backend/repository/credentials/create.ts
- apps/backend/cipher/encrypt.ts and cipher/key.ts
- apps/backend/types/formatZodError.ts
- apps/backend/utils/withTimeout.ts
- apps/backend/utils/response.ts

## 1. The Full Request Flow

A create request travels through five layers:

1. HTTP controller — size guard, calls the validator, maps results to
   responses.
2. Validator — reads FormData, verifies CSRF, validates against a Zod
   schema (or the draft schema when is_draft is true).
3. Shared schema — pure Zod schemas that define valid input.
4. Service — orchestrates image processing, S3 uploads, encryption, and
   the repository call, all inside a 30-second timeout.
5. Repository — walks the type hierarchy, inserts the credential and its
   images in a transaction.

Each layer has a different test recipe. Layers 2 and 3 are mostly pure;
layers 4 and 5 are where mocking matters.

## 2. The Test Boundaries

Unit tests never touch a real database, S3, or CSRF secret. Draw these
boundaries:

- Shared schema — pure Zod. Test with plain objects.
- Validator — mock CSRF verification; use a real FormData object.
- Controller — mock the validator and the service module.
- Service — mock processImage, uploadToS3, encrypt, and the repo.
- Repository — mock the sql client (see the gotcha in section 7).
- Cipher — needs a real ENC_KEY env var; no mocks needed.
- Utils and error classes — pure; no mocks.

## 3. Tools You Will Use

Every case below maps to a bun test API:

- `test(name, fn)` / `describe(name, fn)` — organize cases.
- `expect(value).toBe/toEqual/toStrictEqual/toThrow/toHaveProperty` —
  assert results.
- `expect(fn).rejects.toThrow(...)` — assert errors from async code.
- `mock(fn)` — a mock function you can assert on.
- `spyOn(module, "name")` — spy on a real export.
- `mock.module("specifier", factory)` — replace a whole module (for
  example `@backend/utils/storage` or `@db/connection`).
- `beforeAll/afterEach` — set env vars, reset mocks.

Two helpers you will need constantly:

```ts
// A minimal BunRequest stub for validator and controller tests.
const req = {
  url: "/credentials",
  headers: { get: () => null },
  formData: () => Promise.resolve(new FormData()),
} as unknown as BunRequest;

// A real File in Bun — for thumbnail and image validation tests.
const img = new File([new Uint8Array([1, 2, 3])], "a.webp", {
  type: "image/webp",
});
```

## 4. Case Matrix by Layer

Each layer below lists the cases to test, the input to build, and the
output to assert. Work through them in order — each one builds on the
previous.

### 4.1 Shared Schema — Pure Zod

Input: plain objects. Output: `safeParse` result — check `.success` and
`.data`.

- Valid full payload — all required fields — passes; `is_draft` and
  `is_favourite` default to false.
- title: empty, 3 chars (min 4), 121 chars (max 120) — each fails with
  its message; 4 chars passes.
- type: empty string fails (min 1).
- types: empty array fails (min 1); a valid entry passes; an entry
  missing `value` or `label` fails.
- short_description and long_description: omitted or empty string pass;
  4 chars fail (min 5).
- data blocks — the discriminated union:
    - valid single_label, key_value, information blocks pass.
    - an unknown `type` value fails.
    - key_value with empty key or value fails.
    - data not an array fails.
- thumbnail: null passes; a file with the wrong mime fails; a file over
  3 MB fails.
- images: 7 entries fails (max 6); omitted defaults to [].
- notes and tags: null or any string pass.
- The draft schema: title, type, and types are optional (defaults "");
  is_draft defaults true — an empty draft payload passes.

### 4.2 Validation Helper — parseAndValidateCredential

Input: a BunRequest stub carrying FormData. Output: a `ValidationResult`
— either `{ success: false, errorResponse }` or `{ success: true,
validatedData, images, formData }`.

- Mock CSRF first: `mock.module` the csrf verify module, or set a real
  CSRF_SECRET_KEY and use Bun.CSRF.generate.
- Missing or invalid CSRF token returns failure with type
  "csrf-expired".
- Valid CSRF + valid form data returns success with parsed
  validatedData.
- title missing entirely — validator defaults it to "" and the schema
  fails; expect a 400 form-validation response with an `errors` object.
- is_draft "true" or "1" flips to true and switches to the draft schema
  when one is provided; "false"/"0"/missing stays false.
- is_draft true but no draft schema passed — the full schema still
  applies (this is a subtle branch worth a test).
- images: entries whose keys start with `images[` and are File instances
  land in the `images` array; other entries are ignored.
- types_path: valid JSON is parsed; invalid JSON is swallowed and
  returns [].
- data field: invalid JSON is NOT caught here — `JSON.parse` throws.
  Decide whether that is acceptable, and pin the behavior with a test.
- existing_images_keep only appears in the validated data when the
  form has the field (update routes).

### 4.3 HTTP Controller — credentialCreate

Input: a BunRequest. Output: a Response. Mock
`parseAndValidateCredential` and `createCredentialService` with
`mock.module`.

- content-length header over 10 MB returns 413 before anything else.
  Note: the guard only fires when the header is present — the request
  stub must set it.
- Validator failure — the controller returns the errorResponse as-is
  and never calls the service (assert the service was not called).
- Validator success — the service is called with the mapped arguments:
  title, type, types_path parsed from JSON, is_draft/is_favourite
  defaults, nullable strings, data array, thumbnail, images.
- Service success — response is 200 with `{ id }` from the service.
- Service throws AppError — response maps to its status and type.
- Service throws anything else — response is 500 internal-error with
  details.originError.
- Invalid types_path JSON in the controller's own re-parse returns [].

### 4.4 Service Layer — createCredentialService

Input: `CreateCredentialServiceInput`. Output: the repository result.
Mock processImage, uploadToS3, encrypt, createCredentialRepo, and (if
you want determinism) crypto.randomUUID.

- No thumbnail — processImage returns null; no S3 upload; payload
  thumbnail is null.
- With thumbnail — uploadToS3 called with the thumbnail key and
  "image/webp"; payload thumbnail has url, format, width, height.
- Multiple images — each is processed and uploaded with an indexed key;
  processed-null results are filtered out before upload.
- tags " a , b ,, c " — payload tags is '["a","b","c"]'; tags null
  stays null.
- data — payload data equals `await encrypt(JSON.stringify(input.data))`.
- short_description/long_description/notes empty strings become null.
- is_draft and is_favourite default to false; version is 0.
- The repo receives the generated credential id — assert it is a UUID
  shape, not a fixed value.
- Repo result is returned unchanged; a repo error propagates.
- Advanced: the 30-second withTimeout — to exercise the timeout you need
  a dependency that never resolves; consider testing withTimeout itself
  separately (section 4.8) instead.

### 4.5 Repository Layer — createCredentialRepo

Input: the repo payload. Output: `{ id }`. This is the hardest to mock
because the sql client is a tagged-template function. See section 7 for
the mock signature.

- Happy path — sql.begin runs; the first query returns a user id;
  credential INSERT returns an id; response is `{ id }`.
- types_path walk:
    - existing type under a parent is reused (SELECT returns a row).
    - missing type is created via INSERT and becomes the new parent.
    - two entries chain: parent then child.
- Empty types_path but input.type present — fallback SELECT by value;
  if the type row is missing, BadRequestError with the type name.
- Empty types_path and no type — typesId stays null (draft case) and
  the insert still happens.
- images non-empty — credential_images INSERT runs with the credential
  id; empty — it is skipped.
- sql throws an AppError — it is rethrown unchanged.
- sql throws anything else — it is wrapped in DatabaseError.
- DatabaseError mapping — an error with code "23505" maps to status 409
  and "Resource already exists"; an unknown code maps to 500.

### 4.6 Cipher — Encrypt and Key

Set `ENC_KEY` to a 64-character hex string in beforeAll.

- encrypt returns a string matching `iv.data` (contains exactly one
  dot) with base64 parts.
- Two calls with the same plaintext return different results (random
  IV).
- Encrypting a known plaintext and decrypting with cipher/decrypt.ts
  round-trips to the original (this is the integration-style test that
  validates the whole cipher).
- Missing ENC_KEY makes getKey throw "ENC_KEY is required".
- A wrong ENC_KEY makes decryption fail (GCM auth tag mismatch).

### 4.7 Error Classes

- BadRequestError — status 400, type "bad-request", message preserved.
- DatabaseError — build fake errors with `code` fields and assert the
  mapped status and message for at least: 23505, 23503, 08006, 53300,
  and an unknown code. Assert the pg fields are copied onto the error.
- AppError base — status and type are stored.

### 4.8 Small Utils

- formatZodError — one issue maps to one field; several issues on one
  field accumulate; a nested path like `images[0].key` becomes a
  dot-joined key.
- withTimeout — resolves with the value; rejects with the error; a slow
  promise rejects with TimeoutError after the timeout (use 10 ms).
- ResponseFactory.success and .error — response status, JSON shape
  (success flag, data/error, timestamp, path), and the CORS headers.

## 5. From Small to Complex Cases

Start small, grow steadily:

- Small — formatZodError, error classes, ResponseFactory, the cipher.
  Pure functions, no mocks, instant feedback.
- Medium — the shared schema and the validator. Introduce FormData
  construction and one module mock (CSRF).
- Long — the service. Multiple mocks, branch combinations (with and
  without thumbnail, with and without images, tags edge cases).
- Complex — the repository (tagged-template sql mock, transaction
  flows) and the controller (full mock chain, error mapping).

Each level builds on the previous one and trains a different muscle.

## 6. How to Structure Your Test Files

- One file per source file: `create.test.ts` beside `create.ts`.
- One `describe` per function, one `test` per behavior.
- Name tests as behavior, not code: "returns 400 when csrf is missing",
  not "test csrf".
- Set env vars in beforeAll, restore them in afterEach.
- Use `mock.module` at the top of the file, before the imports you want
  replaced (it must run before the module is first loaded).

## 7. Common Pitfalls

- Tagged-template sql mock — the sql client is called as
  `` client`SELECT ...` ``. A mock receives the template strings array
  as its first argument and interpolated values after it. Your mock must
  accept `(strings, ...values)` and return rows based on which SQL the
  strings contain.
- crypto.randomUUID — never assert a specific id; assert a UUID regex
  or the shape.
- Process env mutation leaks between tests — always save and restore.
- File/FormData in Bun — `new File(...)` and `new FormData()` are
  global, no imports needed.
- mock.module must be called before the module is imported — put it at
  the top of the test file, and use dynamic `await import()` inside the
  test if needed.
- Throwing inside JSON.parse (the data field) — the validator does not
  catch it; if you change that, update the test.

## 8. Your Turn — Suggested First Tests

Write these five first; they cover the purest parts and teach the API:

1. formatZodError — one field, many fields, nested path.
2. The shared schema — title boundaries and the data-block union.
3. BadRequestError and DatabaseError code mapping.
4. encrypt — format, uniqueness, missing ENC_KEY.
5. Validator — CSRF missing, valid payload, draft switch.

Once those pass, move to the service and repository mocks. Each new
layer is one more mock and one more branch — exactly the progression
that builds the skill you want.

## 9. Resources

- Bun test runner — https://bun.com/docs/test
- bun:test API reference — https://bun.com/docs/api/test
- Mocking — https://bun.com/docs/test/mocking
- Test configuration — https://bun.com/docs/test/configuration
- Zod core concepts — https://zod.dev/
