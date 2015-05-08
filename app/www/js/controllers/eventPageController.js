'use strict';
/**
 * @ngdoc function
 * @name starter.controller:ImagesController
 * @description
 * Images controller of the app.
 *
**/
angular.module('starter')

.controller('eventPageController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject, $timeout, $q) {
  
  $scope.eventID = $stateParams.eventUID;
  $scope.eventHost = $stateParams.eventHost;
  $scope.eventHostEmail = $stateParams.eventHostEmail;
  $scope.eventActive = $stateParams.eventActive;
  $scope.userEmail = $stateParams.userEmail;
  $scope.numLikes = 0;

  $timeout(function() {}, 0);

  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  if(fbAuth) {
    var usersReference = firebaseObject.child("users");
    var eventReference = firebaseObject.child("Events/" + $scope.eventID);

    var syncArray = $firebaseArray(eventReference.child("images"));
    var userArray = $firebaseArray(eventReference.child("Users"));
    
    $scope.images = syncArray;
    $scope.users = userArray;
    
    //updates pictures while in event page
    syncArray.$watch(function(image) {
      eventReference.child("images/" + image.key).on("value", function(snapshot) {
        var userID = snapshot.val()["user"];
        usersReference.child(userID).once("value", 
          function(snapshot) {
            var userData = snapshot.val();
            //add user data to image info
            var index = $scope.images.$indexFor(image.key);
            $scope.images[index].displayName = userData.displayName;
            $scope.images[index].profilePicture = userData.profilePicture;
            //update firebase array with displayname and profilepic
            syncArray.$save(index);
          }, function(error) {
            console.log("Error:" + error);
        });
      }, function(error) {
        console.log("Error:" + error);
      });
    });
  
  }
  else {
    $state.go("login");
  }

  $scope.upload = function() {
    // We have to actually go check the value of Active in Firebase because it could have changed since the time they entered
    /*$q(function(resolve, reject) {
      eventReference.once("value", function(eventData) {
        if( eventData.val()['Active'] == 1 ) {
          resolve();
        }
        else {
          reject();
        }
      });
    }).then(function() {
      //Succeed*/      
      /*
    }, function() {
      //Fail
      alert("This event is no longer active");
    });
*/
  }

  $scope.viewPhoto = function(photoData, index) {
    $state.go('viewPhoto', {
      'imageData' : photoData,
      'imageIndex' : index,
      'eventUID' :  $scope.eventID,
      'imagesArr' : $scope.images,
      'userEmail' : $scope.userEmail });
  }

  $scope.goBack = function() {
    $state.go("app.eventsMenu", {userEmail : $scope.userEmail});
  }

  $scope.isHost = function() {
    return (fbAuth.uid == $scope.eventHost);
  }

  $scope.endEvent = function() {
    $scope.eventActive = 0;
    eventReference.child("Active").set(0);
    alert("You have ended this event.");
  }

  $scope.reactivateEvent = function() {
    $scope.eventActive = 1;
    eventReference.child("Active").set(1);
    alert("You have reactivated this event.");
  }

  $scope.eventInfo = function() {
    alert("event info");
  }

  $scope.eventUserList = function() {
    $state.go('viewUserList', 
      { userArr : $scope.users, 
        host : $scope.eventHost,
        hostEmail : $scope.eventHostEmail,
        eventID : $scope.eventID })
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
        return "button button-icon icon ion-android-checkbox";
      } 
      else
        return "button button-icon icon ion-android-done";
    }
    return false;
  }

  $scope.addUser2Event = function(photoData, index) {
    $state.go('addUser', {
      'eventUID' :  $scope.eventID, });
  }

})