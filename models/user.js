var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	local: {
		'username': String,
		'login': String,
		'password': String,
		'usertype': {type: String, default: 'user'},
		'acstatus': {type: String, default: 'useable'},
		'registerdate': {type: Date, default: Date.now()},
		'avatar': {type: String, default: ''}
	}
});

// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);