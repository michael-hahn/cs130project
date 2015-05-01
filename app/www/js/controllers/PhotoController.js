'use strict';
/**
 * @ngdoc function
 * @name starter.controller:PhotoController
 * @description
 * Photo controller of the app.
 *
**/
angular.module('starter')

.controller('PhotoController', function($scope, $stateParams, $state, $firebaseArray, $ionicSlideBoxDelegate, $timeout, firebaseObject) {
  
  var index = $stateParams.imageIndex;

  $scope.currIndex = $stateParams.imageIndex;
  $scope.photoContent = $stateParams.imageData;

  var fbAuth = firebaseObject.getAuth();
  
  $scope.activePhoto = $scope.currIndex;
  $scope.photosArr = [];

  if(fbAuth){

    var userReference = firebaseObject.child("users/" + $stateParams.imageData.user);

    userReference.on("value", function(snapshot) {;
          $scope.userData = snapshot.val();

          $timeout(function() {
            $ionicSlideBoxDelegate.update();
          }, 50);

      }, function(error) {
          console.log("Read failed: " + error);
      });

    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.photosArr = syncArray;

  } else {
    $state.go("login");
  }

  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
  }

  $scope.close = function() {
    $state.go("app.images");
  }

})