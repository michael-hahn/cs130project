'use strict';
/**
 * @ngdoc function
 * @name starter.controller:ViewProfileController
 * @description
 * View profile controller of the app.
 *
**/
angular.module('starter')

.controller('ViewProfileController', function($scope, $stateParams, $state, $ionicSlideBoxDelegate, $timeout, firebaseObject, $ionicHistory) {
  $scope.userData = $stateParams.userInfo;

  $scope.goBack = function() {
    $state.go('viewPhoto', {
      'imageData' : $stateParams.imageData,
      'imageIndex' : $stateParams.imageIndex
       });
  }
})