const express = require('express');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config/private.json');

// connect to the database and load models
require('./server/models').connect(config.dbUri);

const app = express();
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
app.use(cookieParser(config.jwtSecret));
// tell the app to parse body messages
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set up express session
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: true
}));
// pass the passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(user, done){
  done(null, user);
});

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
const stripeRoutes = require('./server/routes/pay');


app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/stripe', stripeRoutes);


// start the server
app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000');
});
