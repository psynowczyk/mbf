var User = require('../models/user');
var fs = require('fs');

module.exports = function (app, passport) {
	
	app.get('*', function (req, res, next) {
		
		res.locals.loggedIn = (req.user) ? true : false;
		if (req.isAuthenticated()) res.locals.avatar = req.user.local.avatar || 'noavatar.png';
		if (req.isAuthenticated()) res.locals.username = req.user.local.username || null;
		if (req.isAuthenticated()) res.locals.usertype = req.user.local.usertype || null;
		
		/*
		res.locals.loggedIn = false;
		if (req.user) {
			res.locals.loggedIn = true;
			res.locals.username = req.user.local.username;
			res.locals.usertype = req.user.local.usertype;
		}
		*/
		next();
	});
	
	// INDEX
	app.get('/', function (req, res) {
		res.render('index', { 'title': '' });
	});

	// EDIT PROFILE
	app.get('/editprofile', isLoggedIn, function (req, res) {
		res.render('editprofile', { 'title': 'Edit profile', 'login': req.user.local.login });
	});
	// EDIT PROFILE
	app.post('/editprofile_both', isLoggedIn, function (req, res, next) {
		var fstream;
		var vp = { $set: { local: req.user.local } };

		function generatename (filename) {
			var ext = filename.split('.');
			ext = ext[ext.length - 1];
			return req.user.id + '.' + ext;
		}

		req.pipe(req.busboy);
		req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			if (!filename) return;
			var newfilename = generatename(filename);
			if (newfilename != false) {
				fs.unlink('public/images/avatars/'+ req.user.local.avatar, function() {
					fstream = fs.createWriteStream('public/images/avatars/'+ newfilename);
					file.pipe(fstream);
					fstream.on('close', function () {
						User.update({ '_id': req.user._id }, { $set: { 'local.avatar': newfilename }}, function (err) {
							if (err) console.log(err);
						});
					});
				});
			}
		});

		req.busboy.on('field', function (key, value) {
			if (value.length > 0) vp.$set.local[key] = value;
		});

		req.busboy.on('finish', function () {
			if (vp.$set.local.hasOwnProperty('password') && vp.$set.local.hasOwnProperty('repassword')) {
				if (vp.$set.local.password == vp.$set.local.repassword) {
					vp.$set.local.password = req.user.generateHash(vp.$set.local.password);
				}
				delete vp.$set.local.repassword;
			}
			User.update({ '_id': req.user._id }, vp, function (err) {
				if (err) console.log(err);
				res.end();
			});
		});
	});

	app.post('/editprofile_data', isLoggedIn, function (req, res, next) {
		var vp = { $set: { local: req.user.local } };

		if (req.body.login) vp.$set.local.login = req.body.login;
		if (req.body.username) vp.$set.local.username = req.body.username;
		if (req.body.password && req.body.repassword) {
			if (req.body.password == req.body.repassword) {
				vp.$set.local.password = req.user.generateHash(req.body.password);
			}
		}

		User.update({ '_id': req.user._id }, vp, function (err) {
			if (err) console.log(err);
			res.end();
		});
	});

	// LOGIN
	app.get('/login', isLoggedOut, function (req, res) {
		res.render('login', { 'title': 'Log in or Sign up' });
	});
	// LOGIN
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login'
	}));
	// LOGIN-SIGNUP
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/login'
	}));
	// LOGOUT
	app.get('/logout', isLoggedIn, function (req, res) {
		req.logout();
		res.redirect('/login');
	});

};


function isLoggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.local.acstatus == 'useable') return next();
	res.redirect('/login');
}
function isLoggedOut(req, res, next) {
	if (req.isAuthenticated()) res.redirect('/');
	return next();
}
function isAdmin(req, res, next) {
	if (req.isAuthenticated() && req.user.local.usertype == 'admin') return next();
	res.redirect('/');
}
function isModerator(req, res, next) {
	if (req.isAuthenticated() && req.user.local.usertype == 'moderator') return next();
	res.redirect('/');
}
function isNotBanned(req, res, next) {
	if ((req.isAuthenticated() && req.user.local.acstatus == 'useable') || !req.isAuthenticated()) return next();
	res.redirect('/accountissue');
}
function isBanned(req, res, next) {
	if (req.isAuthenticated() && req.user.local.acstatus == 'banned') return next();
	res.redirect('/');
}
