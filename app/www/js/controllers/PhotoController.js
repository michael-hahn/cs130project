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
  $scope.userEmail = $stateParams.userEmail;
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

  } else {
    $state.go("login");
  }

  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
    $scope.photoContent = $scope.photosArr[$scope.currIndex];
    $ionicSlideBoxDelegate.update();
  }

  $scope.close = function() {
    $ionicHistory.goBack();
  }

  $scope.addUser = function() {
    alert("TODO ADD");
  }

  $scope.like = function(images, im) {

    if (im.likedBy !== undefined) {

      if (fbAuth.uid === im.user) {
        if (im.likedBy[fbAuth.uid] === 0) {
          im.numLikes++;
          im.likedBy[fbAuth.uid] = 1;
          images.$save(im);
        }
      } else if (im.likedBy[fbAuth.uid] === undefined) {
        
        if (im.numLikes !== undefined)
          im.numLikes++;

        im.likedBy[fbAuth.uid] = 1;
        images.$save(im)
      }
    } else {
      eventReference.child()
    }
  }

  $scope.isLiked = function(im) {
    if (im.likedBy !== undefined) {

      if (im.likedBy[fbAuth.uid] === 1 ) {
        return true;
      } 
    }
    return false;
  }

  $scope.getLikeIcon = function(im) {
    if (im.likedBy !== undefined) {

      if (im.likedBy[fbAuth.uid] === 1 ) {
        return "button button-icon icon ion-thumbsup";
      } 
      else
        return "button button-clear icon ion-thumbsup";
    }
    return false;
  }

  $scope.addUser2Event = function(photoData, index) {
    $state.go('addUser', {
      'eventUID' :  $scope.eventID, });
  }


})