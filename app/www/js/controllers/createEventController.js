'use strict';

/**
 * @ngdoc function
 * @name starter.controller:createEventController
 * @description
 * Create event controller of the app.
 *
**/
angular.module('starter')

.controller('createEventController', function($scope, $firebaseArray, $q, $state, firebaseObject) {
  var fbAuth = firebaseObject.getAuth();
  var myEvents = [];

  if(fbAuth) {
    var myEventsReference = firebaseObject.child("users/" + fbAuth.uid + "/Events");
    var eventsReference = firebaseObject.child("Events");
  }
  else {
    $state.go("login");
  }

  // Get the name of the event with a given ID
  function getNameOfEventWithID(eventID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("Events/" + eventID).once("value", function(eventData) {
        resolve( eventData.val()["Name"] );
      });
    });
  }

  // Update the list of the events this user is hosting
  function refreshMyEvents() {
    return $q(function(resolve, reject) {
      myEvents = [];
      firebaseObject.child("users/" + fbAuth.uid + "/Events").once("value", function(events) {
        events.forEach(function(event) {
          if(event.val() == "host") {
            myEvents.push(event.key());
          }
        });
        resolve();
      });
    });
  }

  // Detect whether this event name has already been taken
  function eventNameIsAvailable(eventName) {
    return $q(function(resolve, reject) {
      var count = 0;

      for( var i = 0; i < myEvents.length; i++ ) {
        getNameOfEventWithID(myEvents[i]).then(function(name) {
          count++;
          if( name == eventName ) {
            reject();
          }
          if( count == myEvents.length ) {
            resolve();
          }
        });
      }

      if(myEvents.length == 0) {
        resolve();
      }
    });
  }

  // Get the name of the event with a given ID
  function getEmailOfUserWithID(userID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("users/" + userID).once("value", function(userData) {
        resolve( userData.val()["email"] );
      });
    });
  }

  $scope.createEvent = function(eventName, password, confirmPassword) {
    // First, refresh the list of events this user is hosting
    refreshMyEvents().then(function() {
      // Then, check if the event name is available
      eventNameIsAvailable(eventName).then(function() {
        // We're not hosting an event by that name yet, so we can add it
        if( password == confirmPassword ) {
          getEmailOfUserWithID(fbAuth.uid).then(function(email) {
            var eventID = eventsReference.push({Host: email, Name: eventName, Password: password, Timestamp: Firebase.ServerValue.TIMESTAMP, Active: 1}).key();
            myEventsReference.child(eventID).set("host");

            alert("Event Created!");
            $state.go("app.images");
          });
          
        }
        else {
          alert("The passwords do not match");
        }
      },
      function() {
        // We're already hosting an event by that name, so we can't add it.
        alert("You are already hosting an event by this name. Choose a different name.");
      });
    });
  }
})