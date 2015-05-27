'use strict';

/**
 * @ngdoc function
 * @name starter.controller:createEventController
 * @description
 * Create event controller of the app.
 *
**/
angular.module('starter')

.controller('createEventController', function($scope, $firebaseArray, $q, $state, firebaseObject, $ionicHistory, $ionicLoading, $cordovaCamera, $timeout) {
  var fbAuth = firebaseObject.getAuth();
  var myEvents = [];
  $scope.eventCoverPhoto = '';

  if(fbAuth) {
    var myEventsReference = firebaseObject.child("user_events/" + fbAuth.uid);
    var eventsReference = firebaseObject.child("event_data");
    var userReference = firebaseObject.child("user_data/"+ fbAuth.uid);
    
    userReference.child("profilePicture").on("value", function(pic) {
      $scope.userProfilePic = pic.val();
    })
    //alert($scope.eventCoverPhoto);
  }
  else {
    $state.go("login");
  }

  // Get the name of the event with a given ID
  function getNameOfEventWithID(eventID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("event_data/" + eventID).once("value", function(eventData) {
        resolve( eventData.val()["Name"] );
      });
    });
  }

  // Update the list of the events this user is hosting
  function refreshMyEvents() {
    return $q(function(resolve, reject) {
      myEvents = [];
      firebaseObject.child("user_events/" + fbAuth.uid).once("value", function(events) {
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
      firebaseObject.child("user_data/" + userID).once("value", function(userData) {
        resolve( userData.val()["email"] );
      });
    });
  }


  /**
   * @ngdoc function
   * @name createEvent
   * @methodOf starter.controller:createEventController
   * @description
   * Creates the event with the details supplied by the user
   *
   * @param {string} eventName The name of the event to create
   * @param {string} password The password for the new event
   * @param {string} confirmPassword The repeated password to confirm the password
   */
  $scope.createEvent = function(eventName, password, confirmPassword) {
    if (eventName && password && confirmPassword){
      $ionicLoading.show({
        template: 'Creating event...'
      });

      // First, refresh the list of events this user is hosting
      refreshMyEvents().then(function() {
        // Then, check if the event name is available
        eventNameIsAvailable(eventName).then(function() {
          // We're not hosting an event by that name yet, so we can add it
          var coverPhoto;
          if($scope.eventCoverPhoto === '') {
            coverPhoto = $scope.userProfilePic;
          } else {
            coverPhoto = $scope.eventCoverPhoto;
          }

          if( password == confirmPassword ) {
            getEmailOfUserWithID(fbAuth.uid).then(function(email) {
              var eventID = eventsReference.push({Host: fbAuth.uid, 
                HostEmail: email, 
                Name: eventName, 
                Password: password, 
                Timestamp: Firebase.ServerValue.TIMESTAMP, 
                Active: 1, 
                coverPhoto: coverPhoto 
              }).key();
              
              myEventsReference.child(eventID).set("host");

              firebaseObject.child("event_attendees").child(eventID).child(fbAuth.uid).set("host");

              $ionicLoading.hide();
              
              $timeout(function(){
                alert("Event Created!");
              }, 0);

              $state.go("app.eventsPage", { 'eventUID' : eventID});
            });
            
          }
          else {
            $ionicLoading.hide();
            alert("The passwords do not match");
          }
        },
        function() {
          // We're already hosting an event by that name, so we can't add it.
          $ionicLoading.hide();
          alert("You are already hosting an event by this name");
        });
      });
    } else {
      $timeout(function(){  
        alert("Fill out all fields.");
      },0);
    } 
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  /**
   * @ngdoc function
   * @name takeCoverPhoto
   * @methodOf starter.controller:createEventController
   * @description
   * Allows the user to either select a photo from their photo gallery or take a new photo to use as the cover photo for their event
   *
   * @param {int} opt The user's selection of how to upload a picture (either taking a new one or selecting one from their photo gallery)
   */
  $scope.takeCoverPhoto = function(opt) {
    //from camera
      var options1 = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 325,
        targetHeight: 300,
        saveToPhotoAlbum: false
      };
      //from photo library
      var options2 = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 325,
        targetHeight: 300,
        saveToPhotoAlbum: false
      };

      if (opt === 0) {
        var options = options1;
      } else{
        var options = options2;
      } 

      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.eventCoverPhoto = "data:image/jpeg;base64," +imageData;
      });

      $timeout(function() {}, 0);
      //$scope.$apply();//updates the view
  }
})