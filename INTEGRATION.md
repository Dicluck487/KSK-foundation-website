# Wiring the Admin CMS into your existing KSK project

This addon is self-contained in a `ksk-admin/` folder so it doesn't collide
with your existing `routes/`, `views/`, `public/` files. Follow these steps
in order — each one is safe to test before moving to the next.

## 0. Copy the folder in

Drop the whole `ksk-admin/` folder into the root of your existing project,
next to your current `routes/` and `views/` folders:

```
your-project/
├── app.js
├── routes/            ← your existing site routes (unchanged)
├── views/              ← your existing site views (unchanged)
│   └── partials/
├── public/
├── ksk-admin/          ← NEW — everything from this addon
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── views/admin/
│   ├── scripts/
│   └── db/schema.sql
```

## 1. Install dependencies

See `PACKAGE_DEPENDENCIES.md`. Run the `npm install` line in your project root.

## 2. Set up Supabase

1. Create a free project at supabase.com.
2. Go to **SQL Editor**, paste the entire contents of `ksk-admin/db/schema.sql`, run it.
3. Go to **Storage** and create 4 buckets, each set to **Public**:
   `images`, `gallery`, `publications`, `alumni`.
4. Go to **Settings → API** and copy the **Project URL** and the
   **service_role** secret key (not the `anon` key).
5. Add both to your `.env` (see `ksk-admin/.env.example`), plus a random
   `SESSION_SECRET`.

## 3. Wire it into `app.js`

Add near your other `require`s, view engine setup, and route mounts:

```js
const session = require('express-session');
const { attachAdminToLocals } = require('./ksk-admin/middleware/auth');

// --- Sessions (add once, before your routes) ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));
app.use(attachAdminToLocals); // makes `currentAdmin` available in every EJS view

// --- Serve the admin CSS ---
app.use('/css', express.static(path.join(__dirname, 'ksk-admin/public/css')));

// --- IMPORTANT: tell Express to also look inside ksk-admin/views for the "admin/..." views ---
app.set('views', [
  path.join(__dirname, 'views'),        // your existing views (unchanged)
  path.join(__dirname, 'ksk-admin/views'), // admin CMS views
]);

// --- Mount the CMS routes ---
app.use('/', require('./ksk-admin/routes/auth'));   // /admin/login, /admin/apply, and public form POSTs
app.use('/admin', require('./ksk-admin/routes/admin')); // everything behind login
```

**Note on `app.set('views', [...])`:** Express (with EJS) supports an array
of view directories and searches them in order, so `res.render('admin/login')`
finds `ksk-admin/views/admin/login.ejs` while `res.render('index')` still
finds your existing `views/index.ejs`. If your current `app.js` already sets
a single views path, just replace it with the array shown above — nothing
else about your existing routes needs to change.

## 4. Create the first Super Admin

The approval workflow needs an admin to already exist before it can approve
anyone else, so bootstrap one directly:

```bash
node ksk-admin/scripts/createSuperAdmin.js "Your Name" you@example.com "a-strong-password"
```

Then visit `/admin/login` and sign in.

## 5. Hook your existing public forms into the new endpoints

Your current files (per your explorer): `contact-us.ejs`, `apply.ejs`,
`views/partials/` (likely your footer). Update the `<form>` tags:

**`views/contact-us.ejs`** — point the form at:
```html
<form method="POST" action="/contact">
  <input name="name" required>
  <input name="email" type="email" required>
  <input name="phone">
  <input name="organization">
  <input name="subject">
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

**Partnership / "Partner With Us"** form (wherever that lives — possibly
inside `apply.ejs` or a dedicated page): point at `/partner-with-us` with
fields `name`, `organization`, `email`, `phone`, `interest_area`, `message`.

**Newsletter subscribe** — add this same small form to your homepage,
`views/partials/footer.ejs` (or wherever your footer partial is), and the
contact page. All three post to the same place, so you get one subscriber list:
```html
<form method="POST" action="/newsletter/subscribe">
  <input name="email" type="email" required placeholder="Your email">
  <button type="submit">Subscribe</button>
</form>
```

## 6. Make gallery/publications pull from the database (optional, Phase 3)

Right now your public `gallery.ejs` / `publications.ejs` most likely render
hardcoded images. When you're ready, update those routes to fetch published
records:

```js
// in whatever route currently renders your public gallery page
const { getPublishedGallery } = require('../ksk-admin/controllers/galleryController');

router.get('/gallery', async (req, res) => {
  const photos = await getPublishedGallery();
  res.render('gallery', { photos });
});
```

Then in `views/gallery.ejs`, loop over `photos` and use `photo.url` for the
`<img src>`. Same pattern applies to publications via
`getPublishedPublications()` from `publicationController.js`.

## 7. Test the flow end to end

1. `/admin/login` → log in as the Super Admin you created.
2. `/admin/apply` (open a private/incognito window) → submit a second test application.
3. Back in your Super Admin session → `/admin/applications` → approve it, note the temp password shown once.
4. Log in as that new account → confirm it only sees what its role allows (e.g. a `viewer` account can't see the "Approve" buttons).
5. Submit your real contact form → check it shows up at `/admin/contacts`.
6. Upload a gallery photo → publish it → confirm the file appears in the Supabase `gallery` bucket and the record's `status` is `published`.
7. Download a CSV from `/admin/export/contacts` to confirm exports work.

## Known things intentionally left for you to extend next

- **Page content editing** (Section 6 of the original plan — editable homepage
  hero titles etc.) — the `page_content` table exists in the schema but there's
  no controller/view for it yet. Straightforward to add once you decide exactly
  which fields on which pages should be editable.
- **Password reset / "change my password"** for approved admins — right now
  a Super Admin has to re-approve or you'd add a manual reset script.
- **Email delivery** for the newsletter itself (subscriber capture is done;
  actually sending quarterly emails needs a provider like Resend or Brevo).
- **Alumni admin CRUD screen** — the `alumni` table and CSV export exist;
  add a controller/view following the same pattern as `gallery.ejs` if you want
  admins to manage alumni testimonials through the dashboard too.
