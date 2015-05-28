'use strict';

/**
 * @ngdoc function
 * @name starter.controller:FriendsController
 * @description
 * Friends page controller of the app.
 *
**/
angular.module('starter')

.controller('FriendsController', function($scope, $stateParams, $firebaseArray, $state, firebaseObject, $timeout, $ionicHistory, Scopes) {
  $scope.friendData = {};
  $scope.friendsObjs = {ids: [], show: true};
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
      console.log("child_added: " + id);
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
      console.log("changed: " + friend.key());
      var status = friend.val();

      //remove id from pendingIDs and put in friendsID
      var i = $scope.pendAndWaitObjs.ids.indexOf(friend.key());
      if (i > -1) {
        $scope.pendAndWaitObjs.ids.splice(i,1);
        $scope.friendsObjs.ids.push(friend.key());
        $scope.friendData[friend.key()].status = status;
        $timeout(function() {}, 0);
      }
      $timeout(function() {}, 0);
    }, function(error) {
      console.log(error);
    });

    userFriendsReference.child(fbAuth.uid).on("child_removed", function(friend) {
      console.log("removed: " + friend.key());
      var id = friend.key();
      var i = $scope.pendAndWaitObjs.ids.indexOf(id);
      var j = $scope.friendsObjs.ids.indexOf(id);
      
      if (i > -1) {
        $scope.pendAndWaitObjs.ids.splice(i,1);
        delete $scope.friendData[id]; //object now undefined
      }else if (j > -1) {
        console.log("j = " + j);
        $scope.friendsObjs.ids.splice(j,1);
        delete $scope.friendData[id]; //object now undefined
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

  /**
   * @ngdoc function
   * @name viewProfile
   * @methodOf starter.controller:FriendsController
   * @description
   * View the profile of a friend
   *
   * @param {int} friend ID of friend
   */  
  $scope.viewProfile = function(friend) {
    $state.go("viewProfile", {'user' : friend});
  }

  /**
   * @ngdoc function
   * @name add
   * @methodOf starter.controller:FriendsController
   * @description
   * Add a user as a friend 
   *
   * @param {int} friend ID of friend
   */ 
  $scope.add = function(friend) { 
    userFriendsReference.child(fbAuth.uid).child(friend.uid).transaction(function(status) {
      return "friend";
    });
    userFriendsReference.child(friend.uid).child(fbAuth.uid).transaction(function(status) {
      return "friend";
    });
  }

  /**
   * @ngdoc function
   * @name delete
   * @methodOf starter.controller:FriendsController
   * @description
   * Delete user as a friend
   *
   * @param {int} friend ID of friend
   */ 
  $scope.delete = function(friend) {
    //log msg when delete finished sync
    if(confirm("Remove friend?")) {
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
  }

  /**
   * @ngdoc function
   * @name getFriendProfilePicture
   * @methodOf starter.controller:FriendsController
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
   * @name getStatusIcon
   * @methodOf starter.controller:FriendsController
   * @description
   * Get status icon
   *
   * @param {string} status status of a potential friend
   */ 
  $scope.getStatusIcon = function(status) {
    if (status === "friend") {
      return "icon ion-android-happy";
    } else if (status === "pending" || status === "waiting") {
      return "icon ion-load-a";
    }
  }

  /**
   * @ngdoc function
   * @name toggleGroup
   * @methodOf starter.controller:FriendsController
   * @description
   * Display/collapse content panels (accordian)
   *
   * @param {int} group panel to display/collapse
   */  
  $scope.toggleGroup = function(group) {
    group.show = !group.show;
  }

  /**
   * @ngdoc function
   * @name isGroupShown
   * @methodOf starter.controller:FriendsController
   * @description
   * Check if the panel is shown
   *
   * @param {int} group group ID of panel 
   */ 
  $scope.isGroupShown = function(group) {
    return group.show;
  }

  /**
   * @ngdoc function
   * @name findUser
   * @methodOf starter.controller:FriendsController
   * @description
   * Find user using email address
   *
   * @param {string} userEmail email address of user 
   */ 
  $scope.findUser = function(userEmail) {
    if(userEmail) {
      userDataReference.orderByChild("email").equalTo(userEmail).once("value", function(val) {
        if(val.val() !== null) {
          var userID = Object.keys(val.val())[0];
          if (userID !== fbAuth.uid) { //not logged in user
            if ($scope.friendData[userID] === undefined) {
              sendRequest(userID);
              alert("Request sent.");
            } else {
              alert("User already added.");
            }
          } else {
            alert("You cannot add yourself.");
          }
        } else {
          $timeout(function(){
            alert("Email is invalid.");
          },0);
        }
      });
    } else {
      $timeout(function(){
        alert("Must input an email");
      },0);
    }
  }

  /**
   * @ngdoc function
   * @name sendRequest
   * @methodOf starter.controller:FriendsController
   * @description
   * Send friend request to user
   *
   * @param {int} userID ID of the user
   */ 
  function sendRequest(userID) {
    userFriendsReference.child(userID).child(fbAuth.uid).transaction(function(status) {
      if(status === null) {
        return "pending";
      }
    });

    //adds to my (logged in user's) list
    userFriendsReference.child(fbAuth.uid).child(userID).transaction(function(status) {
      if(status === null) {
        return "waiting";
      }
    });
  }
});