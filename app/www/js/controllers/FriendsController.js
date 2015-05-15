'use strict';

/**
 * @ngdoc function
 * @name starter.controller:FriendsPageController
 * @description
 * Friends page controller of the app.
 *
**/
angular.module('starter')

.controller('FriendsController', function($scope, $stateParams, $firebaseArray, $state, firebaseObject, $timeout) {

  $scope.friends = [];
  $scope.friendData = {};
  $scope.firstEntry;
  var fbAuth = firebaseObject.getAuth();

  if(fbAuth) {

    var userFriendsReference = firebaseObject.child("user_friends");

    var userDataReference = firebaseObject.child("user_data");

    var friendsIDArr = [];
    var friendUIDs = {};
    var friendData = {};

    userFriendsReference.child(fbAuth.uid).on("child_added", function(friend) {
      var id = friend.key();
      $scope.firstEntry = true;
      userDataReference.child(id).on("value", function(info) {
        var f = info.val();
        //console.log($scope.firstEntry);
        if ($scope.firstEntry === true) { //only get child_added version of status once
          f.status = friend.val();
        } else {
          f.status = $scope.friendData[friend.key()].status;
        }
        f.uid = id;
        if($scope.friends === [] || friendUIDs[f.uid] !== 1) {
          friendsIDArr.push(id);
        } 
        friendData[id] = f;
        friendUIDs[id] = 1;
        $timeout(function(){},0);
      });
    }, function(error) {
      console.log(error);
    });

    userFriendsReference.child(fbAuth.uid).on("child_changed", function(friend) {
      console.log("changed");
      $scope.firstEntry = false; //no longer looking at child_added data
      $scope.friendData[friend.key()].status = friend.val();
      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    userFriendsReference.child(fbAuth.uid).on("child_removed", function(friend) {
      delete $scope.friendData[friend.key()]; //object now undefined
      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    $scope.friendsIDArr = friendsIDArr;
    $scope.friendData = friendData;

  } else {
    $state.go("login");
  }

  $scope.viewProfile = function(friend) {
    $state.go("viewProfile", {'user' : friend});
  }

  $scope.add = function(friend) {
    $scope.friendIndex = $scope.friends.indexOf(friend);
    
    userFriendsReference.child(fbAuth.uid).child(friend.uid).transaction(function(status) {
      return "friend";
    });
    userFriendsReference.child(friend.uid).child(fbAuth.uid).transaction(function(status) {
      return "friend";
    });
  }

  $scope.delete = function(friend) {
    //log msg when delete finished sync
    var onDelete = function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Friend deleted");
      }
    }

    userFriendsReference.child(fbAuth.uid).child(friend.uid).remove(onDelete);
    userFriendsReference.child(friend.uid).child(fbAuth.uid).remove(onDelete);
  }

  $scope.getFriendProfilePicture = function(profilePic) {
    if (profilePic === "") {
      return "./img/blank-profile.png";
    } else {
      return profilePic;
    }
  }

  $scope.getStatusIcon = function(status) {
    if (status === "friend") {
      return "icon ion-android-happy";
    } else if (status === "pending") {
      return "icon ion-load-a";
    } else if (status === "waiting") {
      return "icon ion-load-b";
    }
  }
});