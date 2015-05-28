'use strict';
/**
 * @ngdoc function
 * @name starter.controller:eventPageController
 * @description
 * Images controller of the app.
 *
**/
angular.module('starter')

.controller('eventPageController', function( $scope, $stateParams, $ionicHistory, $firebaseArray, $firebaseObject, $cordovaCamera, $state, firebaseObject, $timeout, $q, $ionicModal) {

  $scope.eventID = $stateParams.eventUID;
  $scope.eventData = $stateParams.eventData;
  $scope.numLikes = 0;
  $scope.allUsersData = {};
  $timeout(function() {}, 0);
  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  var AllImages = [];

  if(fbAuth) {
    var usersReference = firebaseObject.child("user_data");    
    var eventDataReference = firebaseObject.child("event_data/" + $scope.eventID);
    var eventImagesReference = firebaseObject.child("event_images/" + $scope.eventID);
    var eventAttendeesReference = firebaseObject.child("event_attendees/" + $scope.eventID);
    var imageDataReference = firebaseObject.child("image_data");
    var imageLikesReference = firebaseObject.child("image_likes");

    var u = {};
    eventAttendeesReference.on("child_added", function(attendee) {
      usersReference.child(attendee.key()).on("value", function(info) {
        u[info.key()] = info.val();
        u[info.key()].role = attendee.val();
        u[info.key()].uid = attendee.key();
        $timeout(function(){},0);        
      });
    });
    $scope.allUsersData = u;

    var images = [];
    eventImagesReference.on("child_added", function(img) {
      var im = {};
      
      imageDataReference.child(img.key()).on("value", function(p) {
        if(p.val() !== null) {
          im.id = img.key();
          im.image = p.val().image;
          im.time = p.val().time;
          im.user = p.val().user;
        }
      });

      imageLikesReference.child(img.key()).on("value", function(likeInfo) {
        if (likeInfo.val() !== null) {
          im.numLikes = likeInfo.val().numLikes;
          im.likedBy = likeInfo.val().likedBy;
          $timeout(function(){},0);
        }
      });
      images.unshift(im);
    });

    AllImages = images;
    $scope.images = images;
  }
  else {
    $state.go("login");
  }


  $ionicModal.fromTemplateUrl('templates/filterInput.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalFilterInput = modal;
  });


  /**
   * @ngdoc function
   * @name filter
   * @methodOf starter.controller:eventPageController
   * @description
   * Filters the photos in the event based on the user and/or a date range
   *
   * @param {string} userEmail The email of the user to filter photos by
   * @param {string} timeLower The lower bound of the time to filter by
   * @param {string} timeUpper The upper bound of the time to filter by
   */
  $scope.filter = function(userEmail, timeLower, timeUpper) {
    var UserEmail = null;
    var users = $scope.allUsersData;
    var theUserId = null;
    var filterImages = [];
    var TimeLower = new Date("1980-06-09T15:20:00-07:00");
    var TimeUpper = new Date();



    //check if input is null, after the second input empty input will become length of 
    //of one intead of null, so solution is test its length
    if( (userEmail != null)&&(userEmail.length > 5) ){
      UserEmail = userEmail;
    }
    if((timeLower!=null)&&(timeLower.length > 5) ){
      timeLower = timeLower.substr(0,10) + "T" + timeLower.substr(11,timeLower.length);
      TimeLower = new Date(timeLower + ":00-07:00") ;

    }
    if((timeUpper!=null)&&(timeUpper.length >5)){
      timeUpper = timeUpper.substr(0,10) + "T" + timeUpper.substr(11,timeUpper.length);    
      TimeUpper = new Date(timeUpper + ":00-07:00");

    }

    //get the id of the attendence with the email
    for(var i in users){
      if(UserEmail == users[i].email){
          theUserId = users[i].uid;
      }
    }

    //filter by email, if no input, then don't filter by email
    if(UserEmail != null){
      for(var j in AllImages){
        if(AllImages[j].user == theUserId){
            filterImages.push(AllImages[j]);
        }
      }
    }
    else{
      for(var l in AllImages){
            filterImages.push(AllImages[l]);
      }
    }

    //filter by time
   var imageDate;
   for(var k=filterImages.length -1 ; k>=0; k--){
     imageDate = new Date(filterImages[k].time);
     if( ( imageDate <= TimeLower) || ( imageDate >= TimeUpper) ){
        console.log(imageDate);
        filterImages.splice(k,1);
     }
   }

    $scope.images = filterImages;
  }

  /**
   * @ngdoc function
   * @name unfilter
   * @methodOf starter.controller:eventPageController
   * @description
   * Removes the filter on photos (displaying them all)
   */
  $scope.unfilter = function () {
    $scope.images = AllImages;
  }


  /**
   * @ngdoc function
   * @name upload
   * @methodOf starter.controller:eventPageController
   * @description
   * Uploads a photo to the current event (either a new photo or an existing one from the user's photo gallery)
   *
   * @param {int} type The user's selection of how to upload a picture (either taking a new one or selecting one from their photo gallery)
   */
  $scope.upload = function(type) {

      var option1 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      var option2 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      var options;
      if(type === 0 ) {
        options = option1;
      } else {
        options = option2;
      }

      $cordovaCamera.getPicture(options).then(function(imageData) {

        var date = new Date();
        var formattedTime = date.toString();
        var likedbyList = {};
        likedbyList[fbAuth.uid] = 0;

        var imageID = eventImagesReference.push(1).key();
          
        imageDataReference.child(imageID).set({
          user: fbAuth.uid,
          time: formattedTime,
          image: "data:image/jpeg;base64," + imageData
        });

        firebaseObject.child("image_likes").child(imageID).set({
          numLikes: 0, // 0 likes for a new photo
          likedBy: likedbyList // should be empty object ({}) but FB doesn't allow it.});
        });

        firebaseObject.child("user_images").child(fbAuth.uid).child(imageID).set($scope.eventID);

        alert("Image has been uploaded!");

      }, function(error) {
        console.error("ERROR UPLOAD: " + error);
      });
  }

  /**
   * @ngdoc function
   * @name viewPhoto
   * @methodOf starter.controller:eventPageController
   * @description
   * Brings up a page to view the selected photo
   *
   * @param {Object} photoData The data of the photo that the user selected
   * @param {int} index The index of the photo the user selected
   */  
  $scope.viewPhoto = function(photoData, index) {
    photoData.userInfo = $scope.allUsersData[photoData.user];
    $state.go('viewPhoto', {
      'imageData' : photoData,
      'imageIndex' : index,
      'eventUID' :  $scope.eventID,
      'imagesArr' : $scope.images,
      'allUsersData' : $scope.allUsersData });
  }

  /**
   * @ngdoc function
   * @name goBack
   * @methodOf starter.controller:eventPageController
   * @description
   * Returns to the eventMenu Page
   */
  $scope.goBack = function() {
    $state.go("app.eventsMenu");
  }

  /**
   * @ngdoc function
   * @name isHost
   * @methodOf starter.controller:eventPageController
   * @description
   * Checks if the current user is the host of the event
   */
  $scope.isHost = function() {
    return (fbAuth.uid == $scope.eventData.Host);
  }

  /**
   * @ngdoc function
   * @name endEvent
   * @methodOf starter.controller:eventPageController
   * @description
   * Ends the event so that it still exists, but no user can add pictures to it
   */  
  $scope.endEvent = function() {
    $scope.eventData.Active = 0;
    eventDataReference.child("Active").set(0);
    alert("You have ended this event.");
  }

  /**
   * @ngdoc function
   * @name reactivateEvent
   * @methodOf starter.controller:eventPageController
   * @description
   * Reactivates the event so that users can add pictures to it again
   */  
  $scope.reactivateEvent = function() {
    $scope.eventData.Active = 1;
    eventDataReference.child("Active").set(1);
    alert("You have reactivated this event.");
  }

  /**
   * @ngdoc function
   * @name eventInfo
   * @methodOf starter.controller:eventPageController
   * @description
   * Displays information about the current event
   */ 
  $scope.eventInfo = function() {
    console.log($scope.images);
    alert("event info");
  }

  /**
   * @ngdoc function
   * @name eventUserList
   * @methodOf starter.controller:eventPageController
   * @description
   * Brings up a list of all users associated with the event
   */  
  $scope.eventUserList = function() {
    $state.go('viewUserList', { 'allUsersData': $scope.allUsersData, 'eventID' : $scope.eventID })
  }
})