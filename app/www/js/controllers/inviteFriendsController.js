'use strict';
/**
 * @ngdoc function
 * @name starter.controller:inviteFriendsController
 * @description
 * Invite friends controller of the app.
 *
**/
angular.module('starter')

.controller('inviteFriendsController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject, $timeout) {
  
  $scope.eventID = $stateParams.eventID;

  var fbAuth = firebaseObject.getAuth();
  $scope.usersData = [];

  $scope.invitedIDs = {ids:[]};

  if(fbAuth) {
    var userFriendsReference = firebaseObject.child("user_friends");
    var userDataReference = firebaseObject.child("user_data");
    var userEventReference = firebaseObject.child("user_events");
      
    getFriends();
  }
  else {
      $state.go("login");
  }

  //for invite friends
  function getFriends() {
    var friendsIDArr = [];
    var friendData = {};

    userFriendsReference.child(fbAuth.uid).on("child_added", function(friend) {
      var id = friend.key();
  
      userDataReference.child(id).on("value", function(info) {
        var f = info.val();
        f.status = friend.val();
        f.uid = id;

        var eventRole;
        
        //make sure friend isn't already in event
        userEventReference.child(id).child($scope.eventID).on("value", function(eventRole) {
          
          eventRole = eventRole.val();

          if (f.status === "friend" && eventRole === null) {
            friendsIDArr.push(id);
          }
          friendData[id] = f;
          $timeout(function(){},0);
        });

      });
    }, function(error) {
      console.log(error);
    });

    $scope.myFriendIDs = friendsIDArr;
    $scope.friendData = friendData;
  }

  /**
   * @ngdoc function
   * @name goBack
   * @methodOf starter.controller:inviteFriendsController
   * @description
   * Returns to the eventMenu Page
   */
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  /**
   * @ngdoc function
   * @name inviteFriends
   * @methodOf starter.controller:inviteFriendsController
   * @description
   * Send friend request to user
   *
   * @param {string[]} selected array of user IDs to be added as friends
   */ 
  $scope.inviteFriends = function(selected) {
    for (var i = 0; i < selected.length; i++) {
      userEventReference.child(selected[i]).child($scope.eventID).transaction(function(role) {
        if(role === null) {
          return "pending";
        }
      });
    }
    $timeout(function(){
      alert("Friends have been invited");
    },0);
    $ionicHistory.goBack();
  }

  /**
   * @ngdoc function
   * @name getFriendProfilePicture
   * @methodOf starter.controller:inviteFriendsController
   * @description
   * Get the profile picture of a friend. Return a generic profile picture if the friend does not have one.
   *
   * @param {string} profilePic profile picture of friend
   */ 
  $scope.getFriendProfilePicture = function(profilePic) {
    if (profilePic === "") {
      return "./img/blank-profile.png";
    } else {
      return profilePic;
    }
  }

  /**
   * @ngdoc function
   * @name checkAll
   * @methodOf starter.controller:inviteFriendsController
   * @description
   * Select all friends of the user.
   */ 
  $scope.checkAll = function() {
    $scope.invitedIDs.ids = angular.copy($scope.myFriendIDs);
  }

  /**
   * @ngdoc function
   * @name checkAll
   * @methodOf starter.controller:inviteFriendsController
   * @description
   * Deselect all friends of the user.
   */ 
  $scope.uncheckAll = function() {
    $scope.invitedIDs.ids = [];
  }
})