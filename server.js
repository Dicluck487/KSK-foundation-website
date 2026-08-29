const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const supabase = require('./config/supabase');
const { getPublishedPublications } = require('./controllers/publicationController');

const app = express();
const PORT = process.env.PORT || 3000;


// =========================================================
// View engine setup
// =========================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// =========================================================
// Middleware
// =========================================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ksk-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(expressLayouts);
app.set('layout', 'partials/layout');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


// =========================================================
// Global view variables
// =========================================================

app.use((req, res, next) => {
  res.locals.currentAdmin = req.session?.user || null;
  next();
});


// Publications available to every page (nav mega-dropdown reads this,
// showing the 3 most recently uploaded). Sorted by created_at only.
app.use(async (req, res, next) => {

  // Current page path
  res.locals.currentPath = req.path;

  // Default value so the header never crashes
  res.locals.publishedPublications = [];

  try {

    res.locals.publishedPublications = await getPublishedPublications();

  } catch (error) {

    console.error(
      'Unexpected publication loading error:',
      error
    );

  }

  next();

});


// =========================================================
// Routes
// =========================================================

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const heroRouter = require('./routes/hero');
const alumniRouter = require('./routes/alumni');

// ---------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------

// ⚠️ Check routes/index.js first — if a '/publications' route already
// exists there, remove this block instead of running both.

// Full publications page — the most recently uploaded published
// item becomes the "Current Issue", everything else (still in
// created_at order, newest first) fills the archive grid below.
app.get('/publications', async (req, res) => {
    try {

        const decorated = await getPublishedPublications();

        const currentPublication = decorated[0] || null;
        const publications = decorated.slice(1);

        res.render('publications', {
            currentPublication,
            publications,
            publishedPublications: res.locals.publishedPublications
        });

    } catch (err) {
        console.error('Publications page error:', err);
        res.status(500).send('Something went wrong on our end. Please try again later.');
    }
});


app.get('/publications/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: publication, error } = await supabase
            .from('publications')
            .select('*')
            .eq('id', id)
            .eq('status', 'published')
            .single();

        if (error || !publication) {
            console.error('Publication lookup error:', error);
            return res.status(404).render('404');
        }

        const decorated = await getPublishedPublications();
        const currentPublication = decorated.find((p) => p.id === publication.id) || {
            ...publication,
            coverUrl: null,
            documentUrl: null
        };

        res.render('publications', {
            currentPublication,
            publications: [],
            publishedPublications: res.locals.publishedPublications
        });

    } catch (err) {
        console.error('Publication page error:', err);
        res.status(500).send('Something went wrong on our end. Please try again later.');
    }
});



// Authentication routes MUST be public.
app.use('/', indexRouter);
app.use('/', authRouter);

app.use('/admin', adminRouter);
app.use('/admin', heroRouter);
app.use('/admin', alumniRouter);


// =========================================================
// 404 handler
// =========================================================

app.use((req, res) => {

  res.status(404).render('404', {

    title: 'Page Not Found',

    description:
      'The page you are looking for could not be found.'

  });

});


// =========================================================
// Error handler
// =========================================================

app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  console.error('MESSAGE:', err?.message);
  res.status(500).send('Something went wrong on our end. Please try again later.');
});


app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError || err.message.includes('Only')) {
    return res.status(400).send(err.message);
  }
  next(err);
});



// =========================================================
// Start server
// =========================================================

app.listen(PORT, () => {

  console.log(
    `KSK Foundation website running at http://localhost:${PORT}`
  );

});