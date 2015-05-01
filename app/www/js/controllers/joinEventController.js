'use strict';

/**
 * @ngdoc function
 * @name starter.controller:joinEventController
 * @description
 * Join event controller of the app.
 *
**/
angular.module('starter', ['firebase', 'ngCordova', 'ionic'])

.controller('joinEventController', function($scope, $firebaseArray, $q, $state, firebaseObject) {
  var fbAuth = firebaseObject.getAuth();


  if(fbAuth) {
      var myEventsReference = firebaseObject.child("users/" + fbAuth.uid + "/Events");
      var eventReference = firebaseObject.child('Events');
    }
    else {
      $state.go("login");
    }

  function eventExist(eventName) {
    return $q(function(resolve, reject){
      var eventReference = firebaseObject.child('Events');
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

  function userHasEvents() {
    return $q(function(resolve, reject) {
      var userInfo = firebaseObject.child("users/" + fbAuth.uid);
      userInfo.once('value', function(dataSnapshot) {
        if (dataSnapshot.hasChild("Events")) {
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

  function eventNotJoined(eventID) {
    return $q(function(resolve, reject){
    //   var userEvents = firebaseObject.child("users/" + fbAuth.uid + "/Events");
    //   userEvents.equalTo(eventName).on("value", function(oneEvent){
    //     var eventinfo = oneEvent.val();
    //     if(oneEvent.val() != null) {
    //       reject();
    //       alert("You have joined this event already!");
    //     }
    //     else {
    //       resolve();
    //       alert("You can join this event!");
    //     }
    //   });
    // });
        var userInfo = firebaseObject.child("users/" + fbAuth.uid);
        if (!userHasEvents()) {
          resolve();
         // alert("You can join this event!");
        }
        else {
          //var eventID = getEventID(eventName, userEmail);
          userInfo.once('value', function(dataSnapshot) {
            if (dataSnapshot.child("Events/" + eventID).exists()) {
              reject();
             // alert("You have joined this event already!");
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
      firebaseObject.child("users/" + userID).once("value", function(userData) {
        resolve( userData.val()["email"] );
      });
    });
  }

  function validEventHost(userEmail) {
    return $q(function(resolve, reject){
      var userReference = firebaseObject.child('users');
      userReference.orderByChild("email").equalTo(userEmail).on("value", function(oneHost){
          if (oneHost.val() == getEmailOfUserWithID(fbAuth.uid)) {
            reject();
            alert("You cannot join your own event!");
          }
          else if (oneHost.val() != null) {
            resolve();
            alert("Host Email is Valid");
          }
          else {
            alert("NO USER MATCHED");
            reject();
          } 
        }); 
    });
  }

  var targetEvent = null;
  var targetEventID = null;

  // function getEventID(eventName, userEmail) {
  //   var eventReference = firebaseObject.child('Events');
  //   return $q(function(resolve, reject) {
  //     eventReference.once('value', function(allEvents){
  //       allEvents.forEach(function(singleEvent){
  //         var singleEventName = singleEvent.child('Name').val();
  //         var singleEventHost = singleEvent.child('Host').val();
  //         if(singleEventName == eventName && singleEventHost == userEmail){
  //           targetEvent = singleEvent.val();
  //           resolve(singleEvent.key());
  //           return true;
  //         }
  //       });
  //         if (targetEvent == null) {
  //         alert("NO EVENT FOUND");
  //         reject();
  //         }
  //     });
  //   });
  // }

  function getEventPassword(eventName, userEmail) {
    targetEvent = null;
    var eventReference = firebaseObject.child('Events');
    return $q(function(resolve, reject){
      eventReference.once('value', function(allEvents){
        allEvents.forEach(function(singleEvent){
          var singleEventName = singleEvent.child('Name').val();
          var singleEventHost = singleEvent.child('Host').val();
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


  $scope.joinEvent = function(eventName, userEmail, password) {
      eventExist(eventName).then(function() {
        //validEventHost(userEmail).then(function(){
          // eventNotJoined(eventName, userEmail).then(function(){
          //   getEventPassword(eventName, userEmail).then(function(eventPassword) {
            getEventPassword(eventName, userEmail).then(function(eventPassword) {
                eventNotJoined(targetEventID).then(function(){
                if (password == eventPassword) {

                  myEventsReference.child(targetEventID).set("guest");
                  alert("Event joined!");
                  $state.go("app.images");
              }
              else {
                alert("Wrong Passowrd");
              }
            }, function() {
              alert("Cannot join the event");
            });
          }); 
      });
  }




})
