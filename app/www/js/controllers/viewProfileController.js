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
				console.log(status.val());
				if(status.val() === null) {
					console.log("0");
					$scope.status = 0;
				} else {
					console.log("1");
					$scope.status = 1;
				}
			});
    	} else {
    		console.log("11");
    		$scope.status = 1;
    	}

    	console.log($scope.status);
	} else {
	$state.go("login");
	}
  
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

	$scope.getAddIcon = function() {
		if ($scope.status === 1) { //already added
	        return "button button-clear button-icon icon ion-person-add";
		} else if ($scope.status === 0 ) { //not added
	        return "button button-icon icon ion-person-add energized";
		}
	}

	$scope.goBack = function() {
		$ionicHistory.goBack();
	}
});