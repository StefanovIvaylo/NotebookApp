var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var index = require('./routes/index');

//Authentication Packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');

var app = express();

require('dotenv').config();
var connection = require('./db');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressValidator());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'akjsfaslkasiokasqi',
    resave: false,
    store: sessionStore,
    saveUninitialized: false
    // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);


passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log(username);
        console.log(password);

        const db = require('./db');

        var sql = 'SELECT ID, password FROM registration ' +
            'WHERE username = ?';

        db.query(sql,[username], function(err, results, fields){
                if(err){
                    return done(err)
                }
                if(results.length === 0){
                    return done(null, false)
                }else {

                    const hash = results[0].password.toString();

                    bcrypt.compare(password, hash, function (err, response) {
                        if (response === true) {
                            return done(null, {user_id: results[0].ID})
                        } else {
                            return done(null, false)
                        }
                    });
                }
            });
    }
));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
