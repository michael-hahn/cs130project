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
  $scope.eventActive = $stateParams.eventActive;
  $scope.userEmail = $stateParams.userEmail;

  $timeout(function() {}, 0);

  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  if(fbAuth) {
    var usersReference = firebaseObject.child("users");
    var eventReference = firebaseObject.child("Events/" + $scope.eventID);

    if( $scope.userEmail == null ) {
      usersReference.child(fbAuth.uid).once("value", function(userInfo) {
        $scope.userEmail = userInfo.val()["email"];
      })
    }

    var syncArray = $firebaseArray(eventReference.child("images"));
    $scope.images = syncArray;

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
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingTpe: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {

      var timestamp = new Date().getTime();
      var date = new Date(timestamp);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      var formattedTime = hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
      
      syncArray.$add({
        image: "data:image/jpeg;base64," + imageData,
        user: fbAuth.uid,
        time: formattedTime
      }).then(function() {
        alert("Image has been uploaded!");
      });
    }, function(error) {
      console.error("ERROR UPLOAD: " + error);
    });
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
    if( $scope.userEmail == null ) {
      return false;
    }
    else {
      return ($scope.userEmail == $scope.eventHost);
    }
  }

  $scope.endEvent = function() {
    eventReference.child("Active").set(0);
    alert("You have ended this event.");
  }

})