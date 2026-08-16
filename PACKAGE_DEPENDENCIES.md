# Dependencies to add to your existing `package.json`

Run this inside your existing project root (where your current `package.json` lives):

```bash
npm install @supabase/supabase-js bcryptjs express-session multer dotenv
```

You likely already have `express` and `ejs` installed. Nothing else is required —
CSV export is hand-rolled (no extra package) to keep the addon lightweight.

| Package | Why |
|---|---|
| `@supabase/supabase-js` | Talks to your Postgres database + file storage |
| `bcryptjs` | Hashes admin passwords (pure JS, no native build step — safer on Windows/Codespaces) |
| `express-session` | Keeps admins logged in |
| `multer` | Parses gallery photo / publication file uploads |
| `dotenv` | Loads `SUPABASE_URL` / keys from `.env` |
