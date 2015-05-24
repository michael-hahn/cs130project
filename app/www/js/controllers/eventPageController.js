'use strict';
/**
 * @ngdoc function
 * @name starter.controller:ImagesController
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
      //    console.log(theUserId);
      }
    }


    //filter by email, if no input, then don't filter by email
    //console.log(AllImages);
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
        //console.log(filterImages[k].time);
     imageDate = new Date(filterImages[k].time);
     if( ( imageDate <= TimeLower) || ( imageDate >= TimeUpper) ){
        console.log(imageDate);
        filterImages.splice(k,1);
     }
   }

    $scope.images = filterImages;

    //time = AllImages[0].time;
    //console.log(time2<time);

  }

  $scope.unfilter = function () {
    $scope.images = AllImages;
  }







  $scope.upload = function(type) {
    // We have to actually go check the value of Active in Firebase because it could have changed since the time they entered
    /*$q(function(resolve, reject) {
      eventReference.once("value", function(eventData) {
        if( eventData.val()['Active'] == 1 ) {
          resolve();
        }
        else {
          reject();
        }
      });
    }).then(function() {
      //Succeed*/      
      /*
    }, function() {
      //Fail
      alert("This event is no longer active");
    });
*/ 
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

        // var timestamp = new Date().getTime();
        // // var date = new Date(timestamp);
        // // var hours = date.getHours();
        // // var minutes = "0" + date.getMinutes();
        // // var seconds = "0" + date.getSeconds();
        // // var formattedTime = hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);

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

  $scope.viewPhoto = function(photoData, index) {
    photoData.userInfo = $scope.allUsersData[photoData.user];
    $state.go('viewPhoto', {
      'imageData' : photoData,
      'imageIndex' : index,
      'eventUID' :  $scope.eventID,
      'imagesArr' : $scope.images,
      'allUsersData' : $scope.allUsersData });
  }

  $scope.goBack = function() {
    $state.go("app.eventsMenu");
  }

  $scope.isHost = function() {
    return (fbAuth.uid == $scope.eventHost);
  }

  $scope.endEvent = function() {
    $scope.eventActive = 0;
    eventDataReference.child("Active").set(0);
    alert("You have ended this event.");
  }

  $scope.reactivateEvent = function() {
    $scope.eventActive = 1;
    eventDataReference.child("Active").set(1);
    alert("You have reactivated this event.");
  }

  $scope.eventInfo = function() {
    console.log($scope.images);
    alert("event info");
  }

  $scope.eventUserList = function() {
    $state.go('viewUserList', { 'allUsersData': $scope.allUsersData, 'eventID' : $scope.eventID })
  }
})