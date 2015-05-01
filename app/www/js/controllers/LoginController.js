'use strict';

/**
 * @ngdoc function
 * @name starter.controller:LoginController
 * @description
 * Login controller of the app.
 *
**/
angular.module('starter')

.controller('LoginController', ['$scope', '$state', '$firebaseAuth', '$ionicModal', '$ionicLoading', 'firebaseObject', function($scope, $state, $firebaseAuth, $ionicModal, $ionicLoading, firebaseObject) {  
  
  var fbAuth = $firebaseAuth(firebaseObject); 

  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalRegister = modal;
  });

  $ionicModal.fromTemplateUrl('templates/loginExtra/recoverPassword.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalRecoverPassword = modal;
  });

  $scope.register = function(em, pw, confirmPw) {
    console.log("Create User Function called");
    if (em && pw && confirmPw) {


      if (pw !== confirmPw) {
        alert("Password and Confirm password must match.");
      } else {
        $ionicLoading.show({
          template: 'Registering...'
        });
        fbAuth.$createUser({
          email: em, 
          password: pw
        }).then(function(userData) {
          /* do something here */
          //add to firebase at 'users' endpoint
          firebaseObject.child("users").child(userData.uid).set({
            email: em
          });
          //login after registering
          return fbAuth.$authWithPassword({
            email: em,
            password: pw
          });
        }).then(function(authData) {
          $ionicLoading.hide();
          $scope.modalRegister.hide();
          $state.go("registerUserDetails");
        }).catch(function(error){
          alert("Error: " + em + " already taken.");
          console.log("ERROR REGISTER: " + error);
          $ionicLoading.hide();
        });
      }
    } else {
      alert("Please fill out all details.");
    }
  }

  $scope.login = function(username, password) {
    if (username && password) {

      $ionicLoading.show({
        template: 'Logging in...'
      });

      fbAuth.$authWithPassword({
        email: username,
        password: password
      }).then(function(authData) {
        $ionicLoading.hide();
        $state.go("app.images");
      }).catch(function(error) {
        alert("email or password is invalid"); 
        console.error("ERROR LOGIN: " + error);
        $ionicLoading.hide();
      });
    } else {
      alert("Please fill out all details.");
    }
  }

  $scope.recoverPassword = function(userEmail) {
    if (userEmail) {

      $ionicLoading.show({
          template: 'Sending password reset email...'
        });

      firebaseObject.resetPassword({
        email: userEmail
      }, function(error) {
        if (error === null) {
          $ionicLoading.hide();
          $scope.modalRecoverPassword.hide();
          alert("Password reset email has been sent to " + userEmail + ".");
        } else {
          $ionicLoading.hide();
          alert("Error sending reset password email :" + error);
        }
      })
    } else {
      alert("Please give your email.");
    }
  }

}])