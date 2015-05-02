'use strict';

/**
 * @ngdoc function
 * @name starter.controller:RegisterUserDetailsController
 * @description
 * Register controller of the app.
 *
**/
angular.module('starter')

.controller('RegisterUserDetailsController', function( $scope, $cordovaCamera, $ionicModal, $firebaseAuth, $state, $timeout, firebaseObject) {
    
    console.log("in details ctrl");
    $scope.profilePic = ""; 

    $ionicModal.fromTemplateUrl('templates/registerHTML/registerChooseProfilePic.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalChooseProfilePic = modal;
    });

    var fbAuth = firebaseObject.getAuth();

    console.log("id = " + fbAuth.uid);
    if(fbAuth) {
      var userReference = firebaseObject.child("users/" + fbAuth.uid);
    }
    else {
      $state.go("login");
    }

    $scope.chooseProfilePicture = function(type) {
      //from camera
      var options1 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };
      //from photo library
      var options2 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      if (type === 0) {
        var options = options1;
      } else {
        var options = options2;
      }

      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.profilePic = "data:image/jpeg;base64," +imageData;
      });

      $timeout(function() {},0);
      //$scope.$apply();//updates the view
    }

    $scope.submit = function(name) {
      if (name) {
        userReference.update({
          displayName : name,
          profilePicture : $scope.profilePic
        }, function(error) {
          if(error === null) {
            $state.go("app.images");
          } else {
            alert(error);
          }
        });
      } else {
        alert("A name is required.");
      }

    };

  })