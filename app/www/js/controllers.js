var firebaseObject = new Firebase("https://cs130project.firebaseio.com/");

angular.module('starter.controllers', [])

/*
.controller('AppCtrl', function($scope) {
})
*/
.controller('LoginController', ['$scope', '$state', '$firebaseAuth', '$ionicModal', '$ionicLoading', function($scope, $state, $firebaseAuth, $ionicModal, $ionicLoading) {  
  var fbAuth = $firebaseAuth(firebaseObject); 

  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modal = modal;
  });


  $scope.register = function(em, pw, name) {
    console.log("Create User Function called");
    if (em && name && pw) {
      $ionicLoading.show({
              template: 'Registering...'
      });

      fbAuth.$createUser({
        email: em, 
        password: pw,
        displayName: name
      }).then(function(userData) {
        firebaseObject.child("users").child(userData.uid).set({
          email: em,
          displayName: name
        });
        return fbAuth.$authWithPassword({
          email: em,
          password: pw,
          displayName: name
        });
      }).then(function(authData) {
        $ionicLoading.hide();
        $scope.modal.hide();
        $state.go("app.images");
      }).catch(function(error){
        alert("Error: " + em + " already taken.");
        console.log("ERROR REGISTER: " + error);
        $ionicLoading.hide();
      });
    } else {
      alert("Please fill out all details.");
    }
  }

  $scope.login = function(username, password) {
    if (username && password) {

      $ionicLoading.show({
        template: 'Logging in...'
      });

      fbAuth.$authWithPassword({
        email: username,
        password: password
      }).then(function(authData) {
        $ionicLoading.hide();
        $state.go("app.images");
      }).catch(function(error) {
        alert("email or password is invalid"); 
        console.error("ERROR LOGIN: " + error);
        $ionicLoading.hide();
      });
  } else {
    alert("Please fill out all details.");
  }
  }

  $scope.logout = function() {
    firebaseObject.unauth();
    alert("logged out!");
    $state.go("login");
  }
}])

.controller('createEventController', function($scope, $firebaseArray, $q, $state) {
  var fbAuth = firebaseObject.getAuth();
  var myEvents = [];
  var allEvents = [];

  if(fbAuth) {
    var myEventsReference = firebaseObject.child("users/" + fbAuth.uid + "/Events");
    var eventsReference = firebaseObject.child("Events");

    refreshEvents();
  }
  else {
    $state.go("login");
  }

  function refreshEvents() {
    var deferredPromise = $q.defer();

    $q(function(resolve, reject) {
      myEvents = [];
      firebaseObject.child("users/" + fbAuth.uid + "/Events").once("value", function(events) {
        events.forEach(function(event) {
          if(event.val() == "host") {
            myEvents.push(event.key());
          }
        });
        resolve();
      });
    }).then(function() {
      $q(function(resolve, reject) {
        allEvents = [];
        eventsReference.once("value", function(events) {
          events.forEach(function(event) {
            allEvents.push(event);
          });
          resolve();
        });
      }).then(function() {
        deferredPromise.resolve();
      });
    });

    return deferredPromise.promise;
  }

  $scope.createEvent = function(eventName, password, confirmPassword) {
    function getNameOfEventWithID(eventID) {
      for( i = 0; i < allEvents.length; i++ ) {
        if( allEvents[i].key() == eventID ) {
          return allEvents[i].val()["Name"];
        }
      }
      return null;
    }

    // If we're already hosting an event by that name, we can't add it.
    for( i = 0; i < myEvents.length; i++ ) {
      if( eventName == getNameOfEventWithID(myEvents[i]) ) {
        alert("You are already hosting an event by this name. Choose a different name.");
        return;
      }
    }

    // Try to add the event
    if( password == confirmPassword ) {
      var eventID = eventsReference.push({Host: fbAuth.uid, Name: eventName, Password: password, Active: 1}).key();
      myEventsReference.child(eventID).set("host");

      // I would like to do this each time the page loads instead of anytime the button is pressed
      // but this works for now.
      refreshEvents().then(function() {
        alert("Event Created!");
        $state.go("app.images");
      });
    }
    else {
      alert("The passwords do not match");
    }
  }
})

.controller('joinEventController', function($scope, $stateParams) {
})

.controller('ImagesController', function( $scope, $ionicHistory, $firebaseArray, $cordovaCamera, $state) {
  $ionicHistory.clearHistory();
 
  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  if(fbAuth) {
     
    var userReference = firebaseObject.child("users/" + fbAuth.uid);
    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.images = syncArray;
  }
  else {
    $state.go("login");
  }

  $scope.upload = function() {
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingTpe: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      syncArray.$add({image: imageData}).then(function() {
        alert("Image has been uploaded!");
      });
    }, function(error) {
      console.error("ERROR UPLOAD: " + error);
    });
  }

  $scope.goBack = function() {
    $state.go("app.images");
  }

  $scope.viewPhoto = function(photo) {
    $state.go('app.photo', {'imageData' : photo });
  }
})

.controller('PhotoController', function($scope, $stateParams) {
  $scope.photoContent = $stateParams.imageData;
})

.controller('PostController', function($scope, $firebaseArray, $state) {
  var fbAuth = firebaseObject.getAuth();
  
  if(fbAuth) {
    var userReference = firebaseObject.child("users/" + fbAuth.uid);
    var syncArray = $firebaseArray(userReference.child("testPosts"));
  }
  else {
    $state.go("login");
  }

  $scope.uploadPost = function() {
    var timestamp = new Date().getTime();;
    syncArray.$add({testPost: timestamp})
    .then(function() {
      alert("Posted to firebase!");
    });
  }
})
