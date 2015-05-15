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
      $scope.firstEntry = false; //no longer looking at child_added data
      $scope.friendData[friend.key()].status = friend.val();
      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    $scope.friendsIDArr = friendsIDArr;
    $scope.friendData = friendData;

    console.log($scope.friendsIDArr);

  } else {
    $state.go("login");
  }

  $scope.viewProfile = function(friend) {
    $state.go("viewProfile", {'user' : friend});
  }

  $scope.add = function(friend) {
    $scope.friendIndex = $scope.friends.indexOf(friend);

    console.log($scope.AcceptFriendIndex);
    userFriendsReference.child(fbAuth.uid).child(friend.uid).transaction(function(status) {
      return "friend";
    });
    userFriendsReference.child(friend.uid).child(fbAuth.uid).transaction(function(status) {
      return "friend";
    });
  }

});