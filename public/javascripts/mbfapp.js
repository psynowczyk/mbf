var mbfapp = angular.module('mbfapp', []);

mbfapp.controller('SiteMenuController', ['$scope', function($scope) {
	$scope.menuelem = {
		1: {name: 'News', url: '/'},
		2: {name: 'Forum', url: 'forum'},
		3: {name: 'Gallery', url: 'gallery'}
	};
}]);

mbfapp.controller('EditProfileController', ['$scope', function($scope) {
	// delete myJSONObject.regex;
	$scope.errors = {};
	/*
	$scope.errors = {
		login: '',
		password: '',
		repassword: '',
		username: ''
	};
*/
	function checkFormErrorsDisplay() {
		if (
			!$scope.errors.hasOwnProperty('login') &&
			!$scope.errors.hasOwnProperty('password') &&
			!$scope.errors.hasOwnProperty('repassword') &&
			!$scope.errors.hasOwnProperty('username') &&
			!$scope.errors.hasOwnProperty('avatar')
		) $('ul.form_errors[data-id="editprofile"]').fadeOut(200);
		else $('ul.form_errors[data-id="editprofile"]').fadeIn(200);
	}

	$scope.validate_login = function() {
		if ($scope.user.login.length > 0 && $scope.user.login.length < 3) {
			$scope.errors.login = 'Login must contain at least 3 characters!';
		}
		else delete $scope.errors.login;
		checkFormErrorsDisplay();
	};

	$scope.validate_password = function() {
		if ($scope.user.password.length > 0 && $scope.user.password.length < 3) {
			$scope.errors.password = 'Password must contain at least 3 characters!';
		}
		else {
			delete $scope.errors.password;
			if ($scope.user.repassword.length > 0 && $scope.user.repassword != $scope.user.password) {
				$scope.errors.repassword = 'Passwords must match!';
			}
			else delete $scope.errors.repassword;
		}
		checkFormErrorsDisplay();
	};

	$scope.validate_username = function() {
		if ($scope.user.username.length > 0 && $scope.user.username.length < 3) {
			$scope.errors.username = 'Username must contain at least 3 characters!';
		}
		else delete $scope.errors.username;
		checkFormErrorsDisplay();
	};

}]);
