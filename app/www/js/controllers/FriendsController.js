'use strict';

/**
 * @ngdoc function
 * @name starter.controller:FriendsPageController
 * @description
 * Friends page controller of the app.
 *
**/
angular.module('starter')

.controller('FriendsController', function($scope, $stateParams, $firebaseArray, $state, firebaseObject, $timeout, $ionicHistory, Scopes) {
  $scope.friendData = {};
  $scope.friendsObjs = {ids: [], show: false};
  $scope.pendAndWaitObjs = {ids: [], show: false};
  $timeout(function(){},0);
  
  Scopes.store('FriendsController', $scope); //saving to service
  
  var fbAuth = firebaseObject.getAuth();
  if(fbAuth) {
    var userFriendsReference = firebaseObject.child("user_friends");

    var userDataReference = firebaseObject.child("user_data");

    var friendsIDArr = [];
    var pendingAndWaitingIDArr = [];
    var friendData = {};

    userFriendsReference.child(fbAuth.uid).on("child_added", function(friend) {
      var id = friend.key();
  
      userDataReference.child(id).on("value", function(info) {
        var f = info.val();
        f.status = friend.val();
        f.uid = id;

        if (f.status === "friend") {
          friendsIDArr.push(id);
        } else if (f.status === "pending" || f.status === "waiting") {
          pendingAndWaitingIDArr.push(id);
        }
        $timeout(function(){},0);

        friendData[id] = f;
        $timeout(function(){},0);
      });
    }, function(error) {
      console.log(error);
    });

    //only changes from "pending" to "friend"
    userFriendsReference.child(fbAuth.uid).on("child_changed", function(friend) {
      console.log("changed");
      var status = friend.val();

      //remove id from pendingIDs and put in friendsID
      var i = $scope.pendAndWaitObjs.ids.indexOf(friend.key());
      if (i > -1) {
        $scope.pendAndWaitObjs.ids.splice(i,1);
        $scope.friendsObjs.ids.push(friend.key());
        $timeout(function() {}, 0);
      }

      $scope.friendData[friend.key()].status = status;

      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    userFriendsReference.child(fbAuth.uid).on("child_removed", function(friend) {
      var id = friend.key();
      delete $scope.friendData[id]; //object now undefined
      var i = $scope.pendAndWaitObjs.ids.indexOf(id);
      var j = $scope.friendsObjs.ids.indexOf(id);
      
      if (i > -1) {
        $scope.pendAndWaitObjs.ids.splice(i,1);
      }

      if (j > -1) {
        $scope.friendsObjs.ids.splice(i,1);
      }

      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    $scope.friendsObjs.ids = friendsIDArr;
    $scope.pendAndWaitObjs.ids = pendingAndWaitingIDArr;
    $scope.friendData = friendData;

  } else {
    $state.go("login");
  }

  $scope.viewProfile = function(friend) {
    $state.go("viewProfile", {'user' : friend});
  }

  $scope.add = function(friend) { 
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
    }
  }

  $scope.toggleGroup = function(group) {
    group.show = !group.show;
  }

  $scope.isGroupShown = function(group) {
    return group.show;
  }
});