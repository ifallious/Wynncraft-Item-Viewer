## Env vars

Set this on Vercel or locally if the upstream API requires a key:

- `ITEMS_API_KEY`: server-side key used only by `api/items.ts` when it fetches upstream item data

## API behavior

- `/api/items` now fetches Wynncraft items on the Vercel server, not from the browser
- the endpoint accepts the new Wynncraft array payload format and normalizes older object payloads for compatibility
- responses are cached in-memory in the function and marked cacheable for Vercel's CDN
- if `ITEMS_API_KEY` is set, it is attached to the upstream request on the server and is not exposed to the browser
