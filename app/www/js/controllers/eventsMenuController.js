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
  $scope.joinedEvents = {
    eventIDs: [],
    show: false
  };
  $scope.hostedEvents = {
    eventIDs: [],
    show: false
  };

  $scope.pendingEvents = {
    eventIDs: [],
    show: false
  }
  var fbAuth = firebaseObject.getAuth();

  if(fbAuth) {
    var myEventsReference = firebaseObject.child("user_events/" + fbAuth.uid);
    var eventReference = firebaseObject.child('event_data');
    var userReference = firebaseObject.child("user_data/" + fbAuth.uid);
    var eventAttendeesReference = firebaseObject.child('event_attendees');

    var myEvents = {};
    var hEventIDs = []; //host
    var jEventIDs = []; //joined
    var pEventIDs = []; //pending
    //var myEventKeys = null;
    myEventsReference.on("child_added", function(event){
      var eventID = event.key();
      var eventRole = event.val();

      if(eventRole === "host") {
        hEventIDs.push(eventID);
      } else if (eventRole === "guest") {
        jEventIDs.push(eventID);
      } else if (eventRole === "pending") {
        pEventIDs.push(eventID);
      }

      $timeout(function() {}, 0);
      eventReference.child(eventID).on("value", function(eventData) {
        //store events data
        myEvents[eventID] = eventData.val();
      });
    });

    //when role changes (pending -> guest)
    myEventsReference.on("child_changed", function(event){
      console.log("changed " + event.key() + " " + event.val());

      var i = $scope.pendingEvents.eventIDs.indexOf(event.key());

      if (i > -1) {
        $scope.pendingEvents.eventIDs.splice(i,1);
        $scope.joinedEvents.eventIDs.push(event.key());
        $timeout(function(){},0);
      }
    });

    //when declining/removing event invite
    myEventsReference.on("child_removed", function(event){
      console.log("removed " + event.key() + " " + event.val());
      delete $scope.eventData[event.key()];
      var role = event.val();
      var index;
      var arrRef;
      if (role === "host") {
        index = $scope.hostedEvents.eventIDs.indexOf(event.key());
        arrRef = $scope.hostedEvents.eventIDs;
      } else if (role === "guest") {
        index = $scope.joinedEvents.eventIDs.indexOf(event.key());
        arrRef = $scope.joinedEvents.eventIDs;
      } else if (role === "pending") {
        index = $scope.pendingEvents.eventIDs.indexOf(event.key());
        arrRef = $scope.pendingEvents.eventIDs;
      }
      if (index > -1) {
        arrRef.splice(index,1);
      }
      $timeout(function(){},0);

    });

    $scope.eventData = myEvents;
    $scope.hostedEvents.eventIDs = hEventIDs;
    $scope.joinedEvents.eventIDs = jEventIDs;
    $scope.pendingEvents.eventIDs = pEventIDs;
  }
  else {
      $state.go("login");
  }

  $scope.goToEvent = function(eventID) {
    $state.go("app.eventsPage", { 
      'eventUID' : eventID, 
      'eventData' : $scope.eventData[eventID] });
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

  $scope.getCoverPhoto = function(photo) {
    if (photo === "") {
      return "./././img/blank-coverphoto.png";
    } else {
      return photo;
    }
  }

  $scope.joinEvent = function(eventID) {
    myEventsReference.child(eventID).transaction(function(role) {
      return "guest";
    });
    eventAttendeesReference.child(eventID).child(fbAuth.uid).set("guest");
  }

  $scope.rejectEvent = function(eventID) {
    var onDelete = function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Event declined");
      }
    }

    myEventsReference.child(eventID).remove(onDelete);
  }


  $scope.removeEvent = function(eventID) {
    if(confirm("Are you sure you want to delete this event? All associated photos will be lost.")) {
      // First remove all guests associated with the event, then remove the whole event
      $q(function(resolve, reject) {
        eventAttendeesReference.child(eventID).once("value", function(users) {
          users.forEach(function(user) {
            removeGuestFromEvent(user.key(), eventID);
          });
          resolve();
        });
      }).then(function() {
        myEventsReference.child(eventID).remove();
        eventReference.child(eventID).remove();
      });
    }
  }

  function removeGuestFromEvent(userID, eventID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("user_events/" + userID + "/" + eventID).remove();
      eventAttendeesReference.child(eventID + "/" + userID).remove();
      resolve();
    });
  }

  $scope.leaveEvent = function(eventID) {
    if(confirm("Are you sure you want to leave this event?")) {
      // Then leave the event in database
      removeGuestFromEvent(fbAuth.uid, eventID);
    }
  }
})