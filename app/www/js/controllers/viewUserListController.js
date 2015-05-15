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

  //Modal for User Profile
  $ionicModal.fromTemplateUrl('templates/viewProfile.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalviewProfile = modal;
  });
  
  var fbAuth = firebaseObject.getAuth();
  $scope.users = $stateParams.allUsersData;
  $scope.usersData = [];

  if(fbAuth) {

    var idKeys = Object.keys($scope.users);

    for(var i in idKeys) {
      var id = idKeys[i];
      if($scope.users[id].role === "host") {
        $scope.host = $scope.users[id];
      } else {
        $scope.usersData.push($scope.users[id]);
      }
    }
  }
  else {
      $state.go("login");
  }

  $scope.viewProfile = function(user) {
    $scope.person = user;
    $scope.modalviewProfile.show();
  }
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
})