'use strict';
/**
 * @ngdoc function
 * @name starter.controller:viewUserListController
 * @description
 * viewUserList controller of the app.
 *
**/
angular.module('starter')

.controller('viewUserListController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject, $timeout, $ionicModal) {
  
  var fbAuth = firebaseObject.getAuth();
  $scope.users = $stateParams.allUsersData;
  $scope.usersData = [];

  //Modal for Invite Friends
    $ionicModal.fromTemplateUrl('templates/inviteFriends.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalInviteFriends = modal;
    });

  if(fbAuth) {
    
    var idKeys = Object.keys($scope.users);

    for(var i in idKeys) {
      var id = idKeys[i];
      var user = $scope.users[id];
      user.uid = id;
      if($scope.users[id].role === "host") {
        $scope.host = user;
      } else {
        $scope.usersData.push(user);
      }
    }
  }
  else {
      $state.go("login");
  }

  $scope.isHost = function() {
    return (fbAuth.uid === $scope.host.uid);
  }

  $scope.contentPadding = function() {
    console.log($scope.isHost());
    if($scope.isHost() === true) {
      return "has-subheader";
    } else {
      return "has-header";
    }
  }

  $scope.viewProfile = function(user) {
    $state.go("viewProfile", {'user' : user});
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  $scope.getProfilePicture = function(profilePic) {
    if (profilePic === "") {
      return "./img/blank-profile.png";
    } else {
      return profilePic;
    }
  }

  $scope.inviteFriends = function() {
  }
})