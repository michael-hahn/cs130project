'use strict';
/**
 * @ngdoc function
 * @name starter.controller:AddUserController
 * @description
 * Add user to event controller of the app.
 *
**/
angular.module('starter')

.controller('inviteByEmailController', function($scope, $stateParams, $state, $firebaseArray, $ionicSlideBoxDelegate, $timeout, firebaseObject, $ionicModal, $ionicHistory) {
  $scope.eventID = $stateParams.eventID;


  var fbAuth = firebaseObject.getAuth();
  var userID = fbAuth.userID;

  if(fbAuth){
    var userDataReference = firebaseObject.child("user_data");
    var userEventReference = firebaseObject.child("user_events");

  } else {
    $state.go("login");
  }

  $scope.addUser = function(userEmail) {

    if (userEmail===undefined) {
      alert("Please enter a valid email");
      return;
    }
    var user2AddID = null;
    userDataReference.on("value", function(usersObj) {
      console.log(usersObj.val())
      var users = usersObj.val();
      for (var user in users) {
        var email = users[user].email;

        if (email === userEmail) {
          user2AddID = user;
          break;
        }
      }

      if (user2AddID === null)
        alert("Incorrect email");
      else {
        //make sure friend isn't already in event
        userEventReference.child(user2AddID).child($scope.eventID).transaction(function(role) {
          console.log(role);
        if(role === null) {
          alert("Invite has been sent.");
          $ionicHistory.goBack();
          return "pending";
        }
        else {
          alert("Request has already been sent to this user. Awaiting user reponse.");
        } 
      });
    }
  })
}


  $scope.goBack = function() {
    $ionicHistory.goBack();
  }


})