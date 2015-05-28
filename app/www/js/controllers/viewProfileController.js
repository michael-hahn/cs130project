'use strict';

/**
 * @ngdoc function
 * @name starter.controller:viewProfileController
 * @description
 * View profile controller of the app.
 *
**/
angular.module('starter')

.controller('viewProfileController', function($scope, $stateParams, $firebaseArray, $state, firebaseObject, $timeout, $ionicHistory) {

	var fbAuth = firebaseObject.getAuth();
	$scope.person = $stateParams.user;

	if(fbAuth) {
    	var userFriendsReference = firebaseObject.child("user_friends");

    	if(fbAuth.uid !== $scope.person.uid) {
			userFriendsReference.child(fbAuth.uid).child($scope.person.uid).on("value", function(status) {
				if(status.val() === null) {
					$scope.status = 0;
				} else {
					$scope.status = 1;
				}
			});
    	} else {
    		$scope.status = 1;
    	}
	} else {
	$state.go("login");
	}
  
  	/**
   * @ngdoc function
   * @name addUser
   * @methodOf starter.controller:viewProfileController
   * @description
   * Request user as a friend.
   */
	$scope.addUser = function() {
    	if ($scope.person.uid !== fbAuth.uid) {
    	//adds to their list
		userFriendsReference.child($scope.person.uid).child(fbAuth.uid).transaction(function(status) {
			if(status === null) {
			  return "pending";
			} else {
			  alert("Already added!");
			}
		});

		//adds to my (logged in user's) list
		userFriendsReference.child(fbAuth.uid).child($scope.person.uid).transaction(function(status) {
			if(status === null) {
			  return "waiting";
			}
		});
		
    	} else {
      		alert("You can't add yourself...");
    	}
  	}

  	/**
   * @ngdoc function
   * @name getAddIcon
   * @methodOf starter.controller:viewProfileController
   * @description
   * Get an icon denoting whether or not the user has been requested as a friend already.
   */
	$scope.getAddIcon = function() {
		if ($scope.status === 1) { //already added
	        return "button button-clear button-icon icon ion-person-add";
		} else if ($scope.status === 0 ) { //not added
	        return "button button-icon icon ion-person-add energized";
		}
	}

	 /**
   * @ngdoc function
   * @name goBack
   * @methodOf starter.controller:viewProfileController
   * @description
   * Returns to the eventMenu Page
   */
	$scope.goBack = function() {
		$ionicHistory.goBack();
	}
});