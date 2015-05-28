'use strict';

/**
 * @ngdoc function
 * @name starter.controller:eventsMenuController
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
    var eventImagesReference = firebaseObject.child('event_images');
    var imageCommentsReference = firebaseObject.child('image_comments');
    var userCommentsReference = firebaseObject.child('user_comments');
    var userImagesReference = firebaseObject.child('user_images');
    var imageDataReference = firebaseObject.child('image_data');
    var imageLikesReference = firebaseObject.child('image_likes');


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

  /**
   * @ngdoc function
   * @name goToEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Brings up the selected event page
   *
   * @param {int} eventID the event ID
   */  
  $scope.goToEvent = function(eventID) {
    $state.go("app.eventsPage", { 
      'eventUID' : eventID, 
      'eventData' : $scope.eventData[eventID] });
  }

  /**
   * @ngdoc function
   * @name toggleGroup
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Display/collapse content panels (accordian)
   *
   * @param {int} group panel to display/collapse
   */  
  $scope.toggleGroup = function(group) {
    group.show = !group.show;
  };

  /**
   * @ngdoc function
   * @name isGroupShown
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Check if the panel is shown
   *
   * @param {int} group group ID of panel 
   */ 
  $scope.isGroupShown = function(group) {
    return group.show;
  };

  /**
   * @ngdoc function
   * @name getCoverPhoto
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Checks if there is a valid photo. Returns a generic photo if there is not any.
   *
   * @param {int} photo photo of user
   */ 
  $scope.getCoverPhoto = function(photo) {
    if (photo === "") {
      return "./././img/blank-coverphoto.png";
    } else {
      return photo;
    }
  }

  /**
   * @ngdoc function
   * @name joinEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Current user joins an event he or she was invited to.
   *
   * @param {int} eventID ID of event the user was invited to.
   */ 
  $scope.joinEvent = function(eventID) {
    myEventsReference.child(eventID).transaction(function(role) {
      return "guest";
    });
    eventAttendeesReference.child(eventID).child(fbAuth.uid).set("guest");
  }

  /**
   * @ngdoc function
   * @name rejectEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Current user rejects an event he or she was invited to.
   *
   * @param {int} eventID ID of event the user was invited to.
   */ 
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

  /**
   * @ngdoc function
   * @name removeEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Delete an event
   *
   * @param {int} eventID ID of event the user wants to delete
   */ 
  $scope.removeEvent = function(eventID) {
    if(confirm("Are you sure you want to delete this event? All associated photos will be lost.")) {
      // First, remove all associations of people with the event
      // Takes care of event_attendees and user_events
      eventAttendeesReference.child(eventID).once("value", function(users) {
        users.forEach(function(user) {
          removeGuestFromEvent(user.key(), eventID);
        });
      });

      // Next, remove the data about the event
      // Takes care of event_data
      eventReference.child(eventID).remove();

      // Last, remove all pictures associated with the event
      // Takes care of user_images, image_data, image_likes, event_images, user_comments, and image_comments
      eventImagesReference.child(eventID).once("value", function(images) {
        images.forEach(function(image) {
          removeImageFromEvent(image.key(), eventID);
        });
      });
    }
  }

  /**
   * @ngdoc function
   * @name removeImageFromEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Delete an image
   *
   * @param {int} imageID ID of event 
   * @param {int} eventID ID of image that the user wants to delete
   */ 
  function removeImageFromEvent(imageID, eventID) {
    // Removes all traces of the image from user_images, image_data, image_likes, event_images, user_comments, and image_comments
    return $q(function(resolve, reject) {
      imageDataReference.child(imageID).once("value", function(data) {
        userImagesReference.child(data.val()['user'] + "/" + imageID).remove(function() {
          imageDataReference.child(imageID).remove();
        });
      });
      
      imageLikesReference.child(imageID).remove();
      eventImagesReference.child(eventID + "/" + imageID).remove();

      imageCommentsReference.child(imageID).once("value", function(comments) {
        comments.forEach(function(comment) {
          userCommentsReference.child(comment.val()['userId'] + "/" + comment.key()).remove(function() {
            imageCommentsReference.child(imageID).remove();
          });
        });
      });
    });
  }

  /**
   * @ngdoc function
   * @name removeGuestFromEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Remove a guest from the event
   *
   * @param {int} userID ID of user to be removed 
   * @param {int} eventID ID of event
   */ 
  function removeGuestFromEvent(userID, eventID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("user_events/" + userID + "/" + eventID).remove();
      eventAttendeesReference.child(eventID + "/" + userID).remove();
      resolve();
    });
  }

  /**
   * @ngdoc function
   * @name leaveEvent
   * @methodOf starter.controller:eventsMenuController
   * @description
   * Remove the current user from the event.
   *
   * @param {int} eventID ID of event
   */ 
  $scope.leaveEvent = function(eventID) {
    if(confirm("Are you sure you want to leave this event?")) {
      // Then leave the event in database
      removeGuestFromEvent(fbAuth.uid, eventID);
    }
  }
})