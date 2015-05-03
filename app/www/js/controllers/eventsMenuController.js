'use strict';

/**
 * @ngdoc function
 * @name starter.controller:eventsPageController
 * @description
 * events page controller of the app.
 *
**/
angular.module('starter')

.controller('eventsMenuController', function($scope, $firebaseArray, $q, $state, firebaseObject, $timeout) {
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
        //console.log("key: " + myEventKeys[i]);
        eventReference.orderByKey().equalTo(myEventKeys[i]).on("value",function(snapshot) {
          var theEvent = snapshot.val();
          var eventID = Object.keys(theEvent)[0];
          for (var j in theEvent){
            theEvent[eventID].key = eventID; //added key to lead to that event
            eventList.push(theEvent[eventID]);
            $timeout(function(){},0);
          }
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

  $scope.goToEvent = function(eventID) {
    $state.go("app.eventsPage", { 'eventUID' : eventID });
  }

})