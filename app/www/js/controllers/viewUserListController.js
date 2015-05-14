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

  //Modal for Display Name
  $ionicModal.fromTemplateUrl('templates/viewProfile.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalviewProfile = modal;
  });

  var fbAuth = firebaseObject.getAuth();
  $scope.users = $stateParams.allUsersData;
  $scope.usersData = [];

  if(fbAuth) {
    console.log($scope.users);

    var idKeys = Object.keys($scope.users);

    for(var u of idKeys) {
      if($scope.users[u].role === "host") {
        $scope.host = $scope.users[u];
      } else {
        $scope.usersData.push($scope.users[u]);
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