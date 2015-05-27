var User = require('../models/user');
var fs = require('fs');

module.exports = function (app, passport) {
	
	app.get('*', function (req, res, next) {
		
		res.locals.loggedIn = (req.user) ? true : false;
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
	app.post('/editprofile_pi', isLoggedIn, function (req, res) {
		var fstream;
		var allowedext = ['jpg', 'jpeg', 'png', 'gif'];
		function clearpath (id, callback) {
			fs.unlink('public/images/avatars/'+ id +'.'+ allowedext[0], function() {
				fs.unlink('public/images/avatars/'+ id +'.'+ allowedext[1], function() {
					fs.unlink('public/images/avatars/'+ id +'.'+ allowedext[2], function() {
						fs.unlink('public/images/avatars/'+ id +'.'+ allowedext[3], function() {
							callback();
						});
					});
				});
			});
		}
		function generatename (filename) {
			var ext = filename.split('.');
			ext = ext[ext.length - 1];
			if (allowedext.indexOf(ext) != -1) return req.user.id + '.' + ext;
			else return false;
		}
		req.pipe(req.busboy);
		req.busboy.on('field', function (key, value) {
			if(key == 'username') {
				User.update({'_id': req.user._id}, 
					{$set: { 'local.username': value }},
					function (err) {
						if (err) console.log(err);
					}
				);
			}
		});
		req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			console.log(mimetype);
			var newfilename = generatename(filename);
			if (newfilename != false) {
				clearpath(req.user._id, function () {
					fstream = fs.createWriteStream('public/images/avatars/'+ newfilename);
					file.pipe(fstream);
					fstream.on('close', function () {    
	               User.update({ '_id': req.user._id },
							{$set: { 'local.avatar': newfilename }}, function (err) {
								if (err) console.log(err);
							}
						);
	            });
				});
			}
			else res.end();
		});
		req.busboy.on('finish', function () {
			res.redirect('/editprofile');
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
		res.redirect('/');
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
