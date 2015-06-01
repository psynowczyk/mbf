angular.module('mbfappserv', []).factory('justService', function() {

	var compare_string = function (str1, str2) {
		return str1 == str2;
	};

	return {
		compare_string: compare_string
	};

});

var mbfapp = angular.module('mbfapp', ['mbfappserv']);

mbfapp.controller('SiteMenuController', ['$scope', function($scope) {
	$scope.menuelem = {
		1: {name: 'News', url: '/'},
		2: {name: 'Forum', url: 'forum'},
		3: {name: 'Gallery', url: 'gallery'}
	};
	$scope.usermenu = {
		1: {name: 'edit profile', url: '/editprofile'},
		2: {name: 'log out', url: '/logout'}
	};
}]);

mbfapp.controller('EditProfileController', ['$scope', 'justService', function($scope, justService) {

	$scope.errors = {};
	$scope.eo = '';

	function checkFormErrorsDisplay() {
		if (
			!$scope.errors.hasOwnProperty('login') &&
			!$scope.errors.hasOwnProperty('password') &&
			!$scope.errors.hasOwnProperty('repassword') &&
			!$scope.errors.hasOwnProperty('username') &&
			!$scope.errors.hasOwnProperty('avatar')
		) {
			$('ul.form_errors[data-id="editprofile"]').fadeOut(200);
			$scope.eo = '';
		}
		else {
			$scope.eo = 'There are some errors!';
			$('ul.form_errors[data-id="editprofile"]').fadeIn(200);
		}
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
			if ($scope.user.repassword.length > 0 && !justService.compare_string($scope.user.password, $scope.user.repassword)) {
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

mbfapp.directive('customdirective', function() {
	return {
		template: '{{eo}}'
	};
});
