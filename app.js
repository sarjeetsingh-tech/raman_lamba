// Check if not in production environment, load environment variables from .env file
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import necessary modules and packages
const express = require('express');
const app = express();
const path = require('path');
const joi = require('joi');  // For schema validation
const catchAsync = require('./utils/catchAsyncs');
const ExpressError = require('./utils/expressError');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalSrategy = require('passport-local');
const User = require('./models/user');
const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews.js');
const users = require('./routes/users');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// Connect to MongoDB
const dburl = process.env.dbUrl || 'mongodb://127.0.0.1:27017/yelpCamp';
mongoose.set('strictQuery', true);
mongoose.connect(dburl).then(() => {
    console.log("Mongo Connection Open!!!");
}).catch(error => {
    console.log("Mongo Connection Error !!!");
    console.log("connection error", error);
});

// Set up template engine and views directory
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing and serving static files
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session and flash messages
const Secret = process.env.SECRET || 'appleandbanana';
const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret: Secret }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    secret: '189065273hga8762911',
    resave: false,
    saveUninitialized: true,
    cookie: {
        store: store,
        name: 'si',
        secret: Secret,
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

// Initialize passport and use middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware for sanitizing MongoDB queries and enhancing security
app.use(mongoSanitize());
app.use(helmet());

// Content Security Policy configuration
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: ["'self'", "blob:", "data:", "..."],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport Local Strategy configuration
passport.use(new LocalSrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for common variables in templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use('/', users);

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs');
});

// Error handling middleware
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
