const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');

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
// Body parsing
// =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


// =========================================================
// Static files
// =========================================================

app.use(express.static(path.join(__dirname, 'public')));


// =========================================================
// Session
// IMPORTANT: Must come BEFORE routes
// =========================================================

app.use(session({
    secret: process.env.SESSION_SECRET || 'ksk-foundation-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));


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

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');


// Public website
app.use('/', indexRouter);


// Authentication
app.use('/auth', authRouter);


// Admin
app.use('/admin', adminRouter);


// =========================================================
// 404 handler
// IMPORTANT: Must come AFTER routes
// =========================================================

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        description: 'The page you are looking for could not be found.'
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