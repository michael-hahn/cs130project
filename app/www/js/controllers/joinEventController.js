'use strict';

/**
 * @ngdoc function
 * @name starter.controller:joinEventController
 * @description
 * Join event controller of the app.
 *
**/
angular.module('starter')

.controller('joinEventController', function($scope, $firebaseArray, $q, $state, firebaseObject, $ionicHistory) {
  var fbAuth = firebaseObject.getAuth();


  if(fbAuth) {
      var myEventsReference = firebaseObject.child("user_events/" + fbAuth.uid);
      var eventReference = firebaseObject.child('event_data');
      var eventAffected = firebaseObject.child("event_attendees");
    }
    else {
      $state.go("login");
    }

  //resolve if the event eventName exists
  function eventExist(eventName) {
    return $q(function(resolve, reject){
      var eventReference = firebaseObject.child('event_data');
      eventReference.orderByChild("Name").equalTo(eventName).on("value", function(oneEvent){
          if (oneEvent.val() != null){
            resolve();
            //alert("At least one Event with the same name exists");
          }
          else {
            alert("No Events Matched. Try Again");
            reject();
          } 
        });       
    });
  }

  //resolve if the current user has any events
  function userHasEvents() {
    return $q(function(resolve, reject) {
      var userInfo = firebaseObject.child("user_events/" + fbAuth.uid);
      userInfo.once('value', function(dataSnapshot) {
        if (dataSnapshot) {
          resolve();
        //  alert("You have some event(s)");
        }
        else {
          reject();
        //  alert("You don't have any events");
        }
      });
    });
  }

  //resolve if the even identified by the event ID has not been joined by the user
  function eventNotJoined(eventID) {
    return $q(function(resolve, reject){
        var userEvents = firebaseObject.child("user_events/" + fbAuth.uid).child(eventID);
        if (!userHasEvents()) {
          resolve();
         // alert("You can join this event!");
        }
        else {
          userEvents.once('value', function(dataSnapshot) {
            if (dataSnapshot.val()) {
              console.log(dataSnapshot.val())
              reject();
              alert("You have joined this event already!");
            }
            else {
              resolve();
            //alert("Another event to be joined!");
            }
          });
        }
    });
  }

  // Get the name of the event with a given ID
  function getEmailOfUserWithID(userID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("user_data/" + userID).once("value", function(userData) {
        resolve( userData.val()["email"] );
      });
    });
  }

  var targetEvent = null;
  var targetEventID = null;
  //If the given event name and host email address are vaild, return the event's password for checking
  function getEventPassword(eventName, userEmail) {
    targetEvent = null;
    var eventReference = firebaseObject.child('event_data');
    return $q(function(resolve, reject){
      eventReference.once('value', function(allEvents){
        allEvents.forEach(function(singleEvent){
          var singleEventName = singleEvent.child('Name').val();
          var singleEventHost = singleEvent.child('HostEmail').val();
          if(singleEventName == eventName && singleEventHost == userEmail){
            targetEvent = singleEvent.val();
            targetEventID = singleEvent.key();
            resolve(targetEvent.Password);
            return true;
          }
        });
        if (targetEvent == null) {
          alert("No events associated with this user or invalid user email");
          reject();
        }
      });
    });
  }

  //called when join event button is pushed. To test whether the event given event name and host email address can be
  //joined by checking whether the user gives correct password. If the event can be joined, alert the user and 
  //direct the user to the event image page. Otehrwise alert the user and let him try again
  $scope.joinEvent = function(eventName, userEmail, password) {
      eventExist(eventName).then(function() {
            getEventPassword(eventName, userEmail).then(function(eventPassword) {
                eventNotJoined(targetEventID).then(function(){
                if (password == eventPassword) {
                  myEventsReference.child(targetEventID).set("guest");
                  eventAffected.child(targetEventID).child(fbAuth.uid).set("guest");
                  alert("Event joined!");
                  $state.go("app.eventsPage", { 'eventUID' : targetEventID });
              }
              else {
                alert("Wrong Passowrd");
              }
            }, function() {
              //alert("Cannot join the event");
            });
          }); 
      });
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

})
