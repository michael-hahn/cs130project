'use strict';
/**
 * @ngdoc function
 * @name starter.controller:viewUserListController
 * @description
 * viewUserList controller of the app.
 *
**/
angular.module('starter')

.controller('viewUserListController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject, $timeout, $ionicModal) {
  
  var fbAuth = firebaseObject.getAuth();
  $scope.users = $stateParams.allUsersData;
  $scope.usersData = [];

  if(fbAuth) {
    
    var idKeys = Object.keys($scope.users);

    for(var i in idKeys) {
      var id = idKeys[i];
      var user = $scope.users[id];
      user.uid = id;
      if($scope.users[id].role === "host") {
        $scope.host = user;
      } else {
        $scope.usersData.push(user);
      }
    }
  }
  else {
      $state.go("login");
  }

  $scope.viewProfile = function(user) {
    $state.go("viewProfile", {'user' : user});
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
})