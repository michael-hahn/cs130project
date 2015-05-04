'use strict';
/**
 * @ngdoc function
 * @name starter.controller:PhotoController
 * @description
 * Photo controller of the app.
 *
**/
angular.module('starter')

.controller('PhotoController', function($scope, $stateParams, $state, $firebaseArray, $ionicSlideBoxDelegate, $timeout, firebaseObject, $ionicModal, $ionicHistory) {
  
  var index = $stateParams.imageIndex;

  $scope.currIndex = $stateParams.imageIndex;
  $scope.photoContent = $stateParams.imageData;
  var fbAuth = firebaseObject.getAuth();
  $scope.activePhoto = $scope.currIndex;
  //$scope.photosArr = [];
  $scope.photosArr = $stateParams.imagesArr;
  $timeout(function(){
    $ionicSlideBoxDelegate.update();
  }, 0);

  //Modal for Display Name
  $ionicModal.fromTemplateUrl('templates/viewProfile.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalviewProfile = modal;
  });

  if(fbAuth){

    var eventReference = firebaseObject.child("Events/" + $stateParams.eventUID);

    //var userReference = firebaseObject.child("users/" + $stateParams.imageData.user);
/*
    userReference.on("value", function(snapshot) {;
          $scope.userData = snapshot.val();

          $timeout(function() {
            $ionicSlideBoxDelegate.update();
          }, 50);

      }, function(error) {
          console.log("Read failed: " + error);
      });
*/
    //var syncArray = $firebaseArray(eventReference.child("images"));
    
    //$scope.photosArr = syncArray;

  } else {
    $state.go("login");
  }

  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
    $scope.photoContent = $scope.photosArr[$scope.currIndex];
    $ionicSlideBoxDelegate.update();
  }

  $scope.close = function() {
    //$state.go("app.eventsPage");
    $ionicHistory.goBack();
  }

  $scope.addUser = function() {
    alert("TODO ADD");
  }

})