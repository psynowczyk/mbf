var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

var app = express();

mongoose.connect('mongodb://localhost/mbf');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(busboy({
	limits: {
		fileSize: 5 * 1024 * 1024
	}
}));

app.use(session({
	secret: 'asdsadasd',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

require('./routes/routes.js')(app, passport);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use('local-signup', new LocalStrategy({
		usernameField : 'login',
		passwordField : 'password',
		passReqToCallback : true
	},
	function (req, login, password, done) {
		process.nextTick(function () {
			User.findOne({'local.login': login}, function (err, user) {
				if (err) return done(err);
				if (user) return done(null, false, {message: 'That login is already taken.'});
				else {
					User.findOne({'local.username': req.body.username}, function (err, user) {
						if (err) return done(err);
						if (user) return done(null, false, {message: 'That username is already taken.'});
						else {
							if (req.body.repassword != password) return done(null, false, {message: 'Passwords must match.'});
							else {
								var newUser = new User();
								newUser._id = new mongoose.Types.ObjectId;
								newUser.local.login = login;
								newUser.local.username = req.body.username;
								newUser.local.password = newUser.generateHash(password);
								newUser.save(function(err) {
									if (err) throw err;
									return done(null, newUser);
								});
							}
						}
					});
				}
			});
		});
	}
));

passport.use('local-login', new LocalStrategy({
		usernameField: 'login',
		passwordField: 'password',
		passReqToCallback : true
	},
	function (req, login, password, done) {
		User.findOne({'local.login': login}, function (err, user) {
			if (err) return done(err);
			if (!user) return done(null, false);
			if (!user.validPassword(password)) return done(null, false);
			return done(null, user);
		});
	}
));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	 var err = new Error('Not Found');
	 err.status = 404;
	 next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	 app.use(function (err, req, res, next) {
		  res.status(err.status || 500);
		  res.render('error', {
				message: err.message,
				error: err
		  });
	 });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	 res.status(err.status || 500);
	 res.render('error', {
		  message: err.message,
		  error: {}
	 });
});


module.exports = app;
