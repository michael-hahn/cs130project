'use strict';

/**
 * @ngdoc function
 * @name starter.controller:eventsPageController
 * @description
 * events page controller of the app.
 *
**/
angular.module('starter')

.controller('eventsMenuController', function($scope, $stateParams, $firebaseArray, $q, $state, firebaseObject, $timeout) {
  var fbAuth = firebaseObject.getAuth();
  var myEvents = null;
  var myEventKeys = null;
  $scope.joinedEvents = {
    events: [],
    show: false
  };
  $scope.hostedEvents = {
    events: [],
    show: false
  };

  if(fbAuth) {
    var myEventsReference = firebaseObject.child("user_events/" + fbAuth.uid);
    var eventReference = firebaseObject.child('event_data');
    var userReference = firebaseObject.child("user_data/" + fbAuth.uid);

    userReference.child("email").on("value", function(userInfo) {
      $scope.userEmail = userInfo.val();
    })
    //get the keys of all events the user is in 
    myEventsReference.on("value",function(snapshot) {
      myEvents = snapshot.val();
      if (myEvents !== null) {
        myEventKeys = Object.keys(myEvents);
        var jEvents = [];
        var hEvents = [];
        for (var i in myEventKeys){
          //should only be called once or else keeps pushing to list when picture is taken
          eventReference.orderByKey().equalTo(myEventKeys[i]).once("value",function(snapshot) {
            var theEvent = snapshot.val();
            var eventID = Object.keys(theEvent)[0];
            theEvent[eventID].key = eventID; //added key to lead to that event
            if (theEvent[eventID].HostEmail !== $scope.userEmail) {
              jEvents.push(theEvent[eventID]);
            } else {
              hEvents.push(theEvent[eventID]);
            }
            $timeout(function(){},0);
          }, function (error) {
            console.log("Read faild:" + error);
          });
        }
        $scope.joinedEvents.events = jEvents;
        $scope.hostedEvents.events = hEvents;
      } else {
        $scope.joinedEvents.events = [];
        $scope.hostedEvents.events = [];
      }
    }, function(error){
      console.log("Read failed:" + error);
    });
  }
  else {
      $state.go("login");
  }

  $scope.goToEvent = function(event) {
    $state.go("app.eventsPage", { 
      'eventUID' : event.key, 
      'eventHost' : event.Host, 
      'eventHostEmail' : event.HostEmail, 
      'eventActive' : event.Active, 
      'userEmail' : $stateParams.userEmail });
  }

 /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    group.show = !group.show;
  };
  $scope.isGroupShown = function(group) {
    return group.show;
  };
})