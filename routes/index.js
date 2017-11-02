var express = require('express');
var router = express.Router();

var expressValidator = require('express-validator');
var passport = require('passport');

var bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET pages. */
router.get('/', authenticationMiddleware(), function(req, res, next) {

    const user = req.session.passport.user.user_id;

    const db = require('../db');

    var sql_fetch = 'SELECT ID, title, content FROM team30db.notes ' +
        'WHERE username = ?';

    db.query(sql_fetch,[user], function(error, results, fields){
        console.log(JSON.stringify(results));
        res.render('home', { data: results, homeActive: "active" });
    })
});

router.post('/delete', function(req, res, next) {

    const id = req.body.id;

    const db = require('../db');

    var sql_delete = 'DELETE FROM team30db.notes ' +
        'WHERE ID = ?;';

    db.query(sql_delete,[id], function(error, results, fields){
        res.redirect('back');
    })
});

router.post('/upload', function(req, res, next) {

    const title = req.body.title;
    const content = req.body.content;
    const user = req.session.passport.user.user_id;

    const db = require('../db');

    var sql_insert = 'INSERT INTO notes (username, title, content)' +
        'VALUES (?, ?, ?)';

    db.query(sql_insert,[user, title, content], function(error, results, fields){
        res.redirect('back');
    })
});

router.get('/profile', authenticationMiddleware(), function(req, res, next) {

    const user = req.session.passport.user.user_id;

    const db = require('../db');

    var sql_fetch = 'SELECT username FROM team30db.registration ' +
        'WHERE ID = ?';

    db.query(sql_fetch,[user], function(error, results, fields){
        console.log(JSON.stringify(results));
        res.render('profile', {name: results[0].username, profileActive: "active" });
    })
});

router.get('/login', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local' ,{
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {

    req.checkBody('username', 'Username field ' +
        'cannot be empty').notEmpty();
    req.checkBody('password', 'Password field ' +
        'cannot be empty').notEmpty();
    req.checkBody('password-repeat', 'Password fields ' +
        'must match').equals(req.body.password);

    const errors = req.validationErrors();

    if(errors){
        res.render('register', {title: 'Registration Error',
            errors: errors})
    }else{
        const uname = req.body.username;
        const pass = req.body.password;

        const db = require('../db');

        var sql = 'INSERT INTO registration (username, password)' +
            'VALUES (?, ?)';

        bcrypt.hash(pass, saltRounds, function(err, hash) {
            // Store hash in your password DB.

            db.query(sql,[uname,hash], function(error, results, fields){
                if(error) throw error;

                db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
                    if(error) throw error;

                    const user_id = results[0];
                    console.log(user_id);

                    req.login(user_id, function(err){
                        res.redirect('/');
                    });

                    res.render('register', { title: 'Registration complete' });
                });

            });
        });
    }

});


passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

function authenticationMiddleware () {
    return function(req, res, next) {
        console.log("req.session.passport.user: " + JSON.stringify(req.session.passport));

        if (req.isAuthenticated()) return next();
        res.redirect('/login')
    }
}

module.exports = router;