'use strict';
/**
 * @ngdoc function
 * @name starter.controller:ImagesController
 * @description
 * Images controller of the app.
 *
**/
angular.module('starter')

.controller('ImagesController', function( $scope, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject) {
  //$ionicHistory.clearHistory();
 
  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  if(fbAuth) {
     
    var userReference = firebaseObject.child("users/" + fbAuth.uid);

    userReference.on("value", function(snapshot) {
          //console.log(snapshot.val());
          $scope.userData = snapshot.val();
      }, function(error) {
          console.log("Read failed: " + error);
      });

    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.images = syncArray;
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
      'imageIndex' : index
       });
  }

})