'use strict';
/**
 * @ngdoc function
 * @name starter.controller:viewUserListController
 * @description
 * viewUserList controller of the app.
 *
**/
angular.module('starter')

.controller('viewUserListController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $state, firebaseObject, $timeout) {
  
  $scope.eventID = $stateParams.eventID;
  $scope.users = $stateParams.allUsersData;

  var fbAuth = firebaseObject.getAuth();
  $scope.usersData = [];

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

  /**
   * @ngdoc function
   * @name isHost
   * @methodOf starter.controller:viewUserListController
   * @description
   * Check if the current user is the host.
   */
  $scope.isHost = function() {
    return (fbAuth.uid === $scope.host.uid);
  }

  /**
   * @ngdoc function
   * @name viewProfile
   * @methodOf starter.controller:viewUserListController
   * @description
   * View the profile of a user.
   *
   * @param {string} user ID of user 
   */
  $scope.viewProfile = function(user) {
    $state.go("viewProfile", {'user' : user});
  }

  /**
   * @ngdoc function
   * @name goBack
   * @methodOf starter.controller:viewUserListController
   * @description
   * Returns to the eventMenu Page.
   */
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  /**
   * @ngdoc function
   * @name getFriendProfilePicture
   * @methodOf starter.controller:viewUserListController
   * @description
   * Get the profile picture of a friend. Return a generic profile picture if the friend does not have one.
   *
   * @param {string} profilePic profile picture of friend.
   */ 
  $scope.getProfilePicture = function(profilePic) {
    if (profilePic === "") {
      return "./img/blank-profile.png";
    } else {
      return profilePic;
    }
  }

  /**
   * @ngdoc function
   * @name inviteFriends
   * @methodOf starter.controller:viewUserListController
   * @description
   * Go to the invite friends page.
   */ 
  $scope.inviteFriends = function(selected) {
    $state.go("inviteFriends", {'eventID': $scope.eventID});
  }

  /**
   * @ngdoc function
   * @name inviteByEmail
   * @methodOf starter.controller:viewUserListController
   * @description
   * Go to the invite user by email page.
   */ 
  $scope.inviteByEmail = function(selected) {
    $state.go("inviteByEmail", {'eventID': $scope.eventID});
  }
})