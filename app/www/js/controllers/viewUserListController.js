'use strict';
/**
 * @ngdoc function
 * @name starter.controller:viewUserListController
 * @description
 * viewUserList controller of the app.
 *
**/
angular.module('starter')

.controller('viewUserListController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $cordovaCamera, $state, firebaseObject, $timeout) {

  var fbAuth = firebaseObject.getAuth();
  $scope.users = $stateParams.userArr;
  $scope.hostUID = $stateParams.host;
  $scope.usersData = [];
  $scope.eventID = $stateParams.eventID;

  if(fbAuth) {

    var usersReference = firebaseObject.child("users");
    var eventReference = firebaseObject.child("Events/" + $scope.eventID);
    
    usersReference.child($scope.hostUID).once("value", function(snapshot) {
      $scope.host = snapshot.val();
    }, function(error) {
      console.log("Read failed:" + error);
    })

    var usersObjs = [];  
    for (var i = 0; i < $scope.users.length; i++) {
      console.log($scope.users[i].$id);
      usersReference.child($scope.users[i].$id).on("value",function(snapshot) {
        var user = snapshot.val();
        console.log(user);
        var userObj = {};
        userObj.uid = Object.keys(user)[0];
        userObj.displayName = user.displayName;
        userObj.profilePicture = user.profilePicture;
        userObj.email = user.email;
        usersObjs.push(userObj);
        //console.log(usersObjs);
        $timeout(function(){},0);
      }, function (error) {
        console.log("Read failed:" + error);
      });
    }
    $scope.usersData = usersObjs;
    //console.log("test: " + $scope.usersData);
  }
  else {
      $state.go("login");
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
})