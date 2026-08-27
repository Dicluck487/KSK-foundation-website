const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const supabase = require('./config/supabase');

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


app.use(async (req, res, next) => {

  // Current page path
  res.locals.currentPath = req.path;

  // Default value so the header never crashes
  res.locals.publishedPublications = [];

  try {

    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false });

    if (error) {

      console.error(
        'Error loading published publications:',
        error.message
      );

    } else {

      res.locals.publishedPublications = data || [];

    }

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

app.use('/', indexRouter);

// Authentication routes MUST be public.
app.use('/', authRouter);


// ---------------------------------------------------------
// PROTECTED ADMIN ROUTES
// ---------------------------------------------------------

app.use('/admin', adminRouter);

// Hero administration routes.
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

  console.error(err.stack);

  res.status(500).send(
    'Something went wrong on our end. Please try again later.'
  );

});


// =========================================================
// Start server
// =========================================================

app.listen(PORT, () => {

  console.log(
    `KSK Foundation website running at http://localhost:${PORT}`
  );

});