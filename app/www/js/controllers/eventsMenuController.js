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
  $scope.eventInfo =[];

  if(fbAuth) {

    var myEventsReference = firebaseObject.child("users/" + fbAuth.uid + "/Events");
    var eventReference = firebaseObject.child('Events');

    //get the keys of all events the user is in 
    myEventsReference.on("value",function(snapshot) {
      myEvents = snapshot.val();
      myEventKeys = Object.keys(myEvents);
      var eventList = [];
      for (var i in myEventKeys){
        //should only be called once or else keeps pushing to list when picture is taken
        eventReference.orderByKey().equalTo(myEventKeys[i]).once("value",function(snapshot) {
          var theEvent = snapshot.val();
          var eventID = Object.keys(theEvent)[0];
          theEvent[eventID].key = eventID; //added key to lead to that event
          eventList.push(theEvent[eventID]);
          $timeout(function(){},0);
        }, function (error) {
          console.log("Read faild:" + error);
        });
      }
      $scope.eventInfo = eventList;
    }, function(error){
      console.log("Read faild:" + error);
    });
  }
  else {
      $state.go("login");
  }

  $scope.goToEvent = function(event) {
    $state.go("app.eventsPage", { 'eventUID' : event.key, 'eventHost' : event.Host, 'eventActive' : event.Active, 'userEmail' : $stateParams.userEmail });
  }

})