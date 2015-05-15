'use strict';
/**
 * @ngdoc function
 * @name starter.controller:PhotoController
 * @description
 * Photo controller of the app.
 *
**/
angular.module('starter')

.controller('PhotoController', function($scope, $stateParams, $state, $firebaseObject, $ionicSlideBoxDelegate, $timeout, firebaseObject, $ionicModal, $ionicHistory) {
  
  $scope.currIndex = $stateParams.imageIndex;
  $scope.photoContent = $stateParams.imageData;
  var fbAuth = firebaseObject.getAuth();
  $scope.activePhoto = $scope.currIndex;
  $scope.photosArr = $stateParams.imagesArr;
  $scope.allUsersData = $stateParams.allUsersData;

  $timeout(function(){
    $ionicSlideBoxDelegate.update();
  }, 0);

  if(fbAuth){
    var eventReference = firebaseObject.child("event_data/" + $stateParams.eventUID);
    var imageLikesReference = firebaseObject.child("image_likes");

  } else {
    $state.go("login");
  }

  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
    $scope.photoContent = $scope.photosArr[$scope.currIndex];
    $scope.photoContent.userInfo = $scope.allUsersData[$scope.photoContent.user];
    $ionicSlideBoxDelegate.update();
  }

  $scope.close = function() {
    $ionicHistory.goBack();
  }

  $scope.like = function(im) {

    if (im.likedBy !== undefined) {

      if (fbAuth.uid === im.user) {
        if (im.likedBy[fbAuth.uid] === 0) {
          im.numLikes++;
          //im.likedBy[fbAuth.uid] = 1;
          imageLikesReference.child(im.id).update({
            'numLikes': im.numLikes});
          imageLikesReference.child(im.id +'/likedBy').child(fbAuth.uid).set(1);
        }
      } else if (im.likedBy[fbAuth.uid] === undefined) {
        
        if (im.numLikes !== undefined)
          im.numLikes++;

        //im.likedBy[fbAuth.uid] = 1;
        
        imageLikesReference.child(im.id).update({
            'numLikes': im.numLikes});
          imageLikesReference.child(im.id +'/likedBy').child(fbAuth.uid).set(1);
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
        return "button button-clear button-icon icon ion-thumbsup";
      } 
      else
        return "button button-icon icon ion-thumbsup balanced";
    }
    return false;
  }

  $scope.addUser2Event = function(photoData, index) {
    $state.go('addUser', {
      'eventUID' :  $scope.eventID, });
  }

  $scope.viewProfile = function(user) {
    $state.go("viewProfile", {'user' : user});
  }

})