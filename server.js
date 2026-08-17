const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// View engine setup
// =========================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'partials/layout');


// =========================================================
// Middleware
// =========================================================

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


// =========================================================
// Make current path available to all views
// =========================================================

app.use((req, res, next) => {

  res.locals.currentPath = req.path;

  next();

});


// =========================================================
// Routes
// =========================================================

// =========================================================
// Routes
// =========================================================

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);

// Public authentication routes
app.use('/auth', authRouter);

// Protected admin dashboard
app.use('/admin', adminRouter);


app.use('/', indexRouter);


// =========================================================
// 404 handler
// IMPORTANT: This must come AFTER your routes
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