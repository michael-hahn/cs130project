'use strict';

/**
 * @ngdoc function
 * @name starter.controller:ProfileController
 * @description
 * Profile controller of the app.
 *
**/
angular.module('starter')

.controller('SettingsController', ['$scope', '$state', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$timeout', 'firebaseObject', '$ionicHistory', function($scope, $state, $ionicModal, $ionicLoading, $cordovaCamera, $timeout, firebaseObject, $ionicHistory) {

    var fbAuth = firebaseObject.getAuth();
    $scope.userData = null;

    if(fbAuth) {
      $scope.uid = fbAuth.uid;
      var userReference = firebaseObject.child("user_data/" + fbAuth.uid);
      userReference.on("value", function(snapshot) {
        //using timeout to schedule the changes to the scope in a future call stack. timeout period of 0ms makes it occur as soon as possible and $timeout will ensure code be called in single $apply block
        $scope.userData = snapshot.val();
        $timeout(function() {}, 0);
      }, function(error) {
          console.log("Read failed: " + error);
      });
    }
    else {
      $state.go("login");
    }

    //Modal for Display Name
    $ionicModal.fromTemplateUrl('templates/settingsHTML/changeDisplayName.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalDisplayName = modal;
    });
    
    //Modal for Email
    $ionicModal.fromTemplateUrl('templates/settingsHTML/changeEmail.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalEmail = modal;
    });

    //Modal for Password
    $ionicModal.fromTemplateUrl('templates/settingsHTML/changePassword.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalPassword = modal;
    });
//Modal for PhotoZoom
	$ionicModal.fromTemplateUrl('templates/settingsHTML/PhotoZoom.html', {
		scope: $scope
	}).then(function (modal) {
		$scope.modalPhotoZoom = modal;
	});
    $scope.logout = function() {
      if(confirm("Logout?")){
        firebaseObject.unauth();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $state.go("login");
      }
    }

    $scope.changeDisplayName = function(newName) {
      if (newName) {
        userReference.update({
          displayName: newName
        }, function(error) {
          if (error) {
            alert("Error: " + error);
          } else {
            $scope.modalDisplayName.hide();
            alert("Changed display name to " + newName);
          }
        });
      } else {
        alert("Please choose new Display Name.");
      }
      
    }

    $scope.changeEmail = function(newEm, pw) {
      if (newEm && pw) {
        userReference.changeEmail({
          oldEmail : $scope.userData.email,
          newEmail : newEm,
          password : pw
        }, function(error) {
          if (error === null) {
            $scope.modalEmail.hide();
            userReference.update({
              email : newEm
            });
            alert("Email changed to " + newEm);
          } else {
            alert(error);
          }
        })
      } else {
        alert("Please fill out all details.");
      }
    }

    $scope.changeProfilePicture = function(opt) {
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

      if (opt === 0) {
        var options = options1;
      } else{
        var options = options2;
      } 

      $cordovaCamera.getPicture(options).then(function(imageData) {
        userReference.update({
          profilePicture : "data:image/jpeg;base64," +imageData
        }, function(error) {
          if ( error === null ) {
            $scope.modalProfilePicture.hide();
            alert("Profile picture changed!");
          } else {
            alert(error);
          }
        });
      });

      $scope.$apply();//updates the view
    }

    $scope.removeProfilePicture = function() {
      if(confirm("Remove profile picture?")){
      userReference.update({
          profilePicture : ''
        }, function(error) {
          if ( error === null ) {
            alert("Profile picture changed!");
          } else {
            alert(error);
          }
        });
      }
    }

    $scope.changePassword = function(oldPw, newPw, confirmPw) {
      if ( oldPw && newPw && confirmPw ) {
        userReference.changePassword({
          email : $scope.userData.email,
          oldPassword : oldPw,
          newPassword : newPw
        }, function(error) {
          if (error === null){
            $scope.modalPassword.hide();
            alert("Password successfully changed!");
          } else {
            alert(error);
          }
        });
      } else {
        alert("Please fill in all details.");
      }
    }
}])
