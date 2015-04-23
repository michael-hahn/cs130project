'use strict';

var firebaseObject = new Firebase("https://cs130project.firebaseio.com/");

angular.module('starter.controllers', [])

.controller('LoginController', ['$scope', '$state', '$firebaseAuth', '$ionicModal', '$ionicLoading', function($scope, $state, $firebaseAuth, $ionicModal, $ionicLoading) {  
  
  var fbAuth = $firebaseAuth(firebaseObject); 

  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modal = modal;
  });

  $scope.register = function(em, pw, confirmPw) {
    console.log("Create User Function called");
    if (em && pw && confirmPw) {


      if (pw !== confirmPw) {
        alert("Password and Confirm password must match.");
      } else {
        $ionicLoading.show({
          template: 'Registering...'
        });
        fbAuth.$createUser({
          email: em, 
          password: pw
        }).then(function(userData) {
          /* do something here */
          //add to firebase at 'users' endpoint
          firebaseObject.child("users").child(userData.uid).set({
            email: em
          });
          //login after registering
          return fbAuth.$authWithPassword({
            email: em,
            password: pw
          });
        }).then(function(authData) {
          $ionicLoading.hide();
          //$scope.modal.hide();
          $scope.modal.hide();
          $state.go("registerUserDetails");
        }).catch(function(error){
          alert("Error: " + em + " already taken.");
          console.log("ERROR REGISTER: " + error);
          $ionicLoading.hide();
        });
      }
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
}])

.controller('RegisterUserDetailsController', function( $scope, $cordovaCamera, $ionicModal, $firebaseAuth, $state) {
    
    console.log("in details ctrl");
    $scope.profilePic = ""; 

    $ionicModal.fromTemplateUrl('templates//registerDetails/registerChooseProfilePic.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalChooseProfilePic = modal;
    });

    var fbAuth = firebaseObject.getAuth();

    console.log("id = " + fbAuth.uid);
    if(fbAuth) {
      var userReference = firebaseObject.child("users/" + fbAuth.uid);
    }
    else {
      $state.go("login");
    }

    $scope.chooseProfilePicture = function(type) {
      //from camera
      var options1 = {
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
      //from photo library
      var options2 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      if (type === 0) {
        var options = options1;
      } else {
        var options = options2;
      }

      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.profilePic = imageData;
      });

      $scope.$apply();//updates the view
    }

    $scope.submit = function(name) {
      if (name) {
        userReference.update({
          displayName : name,
          profilePicture : $scope.profilePic
        }, function(error) {
          if(error === null) {
            $state.go("app.images");
          } else {
            alert(error);
          }
        });
      } else {
        alert("A name is required.");
      }

    };

  })

.controller('createEventController', function($scope, $firebaseArray, $q, $state) {
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
    });
  }

  $scope.createEvent = function(eventName, password, confirmPassword) {
    // First, refresh the list of events this user is hosting
    refreshMyEvents().then(function() {
      // Then, check if the event name is available
      eventNameIsAvailable(eventName).then(function() {
        // We're not hosting an event by that name yet, so we can add it
        if( password == confirmPassword ) {
          var eventID = eventsReference.push({Host: fbAuth.uid, Name: eventName, Password: password, Active: 1}).key();
          myEventsReference.child(eventID).set("host");

          alert("Event Created!");
          $state.go("app.images");
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
    var testPosts = userReference.child("testPosts");
  }
  else {
    $state.go("login");
  }
  //upload to firebase, endpoint at testPosts
$scope.uploadPost = function() {
    var timestamp = new Date().getTime();;
    testPosts.push({
      testPost: timestamp
    });
    alert("posted to firebase!");
  }
})

.controller('ProfileController', ['$scope', '$state', '$ionicModal', '$ionicLoading', '$cordovaCamera', function($scope, $state, $ionicModal, $ionicLoading, $cordovaCamera) {
    var fbAuth = firebaseObject.getAuth();

    if(fbAuth) {
       
      var userReference = firebaseObject.child("users/" + fbAuth.uid);
      userReference.on("value", function(snapshot) {
          console.log(snapshot.val());
          $scope.userData = snapshot.val();
          $scope.$apply();
      }, function(error) {
          console.log("Read failed: " + error);
      });
    }
    else {
      $state.go("login");
    }

    //Modal for Display Name
    $ionicModal.fromTemplateUrl('templates/profileSettings/changeDisplayName.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalDisplayName = modal;
    });
    
    //Modal for Email
    $ionicModal.fromTemplateUrl('templates/profileSettings/changeEmail.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalEmail = modal;
    });

    //Modal for Profile Picture
    $ionicModal.fromTemplateUrl('templates/profileSettings/changeProfilePicture.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalProfilePicture = modal;
    });

    //Modal for Password
    $ionicModal.fromTemplateUrl('templates/profileSettings/changePassword.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalPassword = modal;
    });

    $scope.logout = function() {
      firebaseObject.unauth();
      alert("logged out!");
      $state.go("login");
    }

    $scope.changeDisplayName = function(newName) {
      if (newName) {
        userReference.update({
          displayName: newName
        }, function(error) {
          if (error) {
            alert("Error: " + error);
          } else {
            alert("Changed display name to " + newName);
            $scope.modalDisplayName.hide();
          }
        });
      } else {
        alert("Please choose new Display Name.");
      }
      
    }

    $scope.changeEmail = function(oldEm, newEm, pw) {
      if (oldEm && newEm) {
        userReference.changeEmail({
          oldEmail : oldEm,
          newEmail : newEm,
          password : pw
        }, function(error) {
          if (error === null) {
            alert("Email changed from " + oldEm + " to " + newEm);
            userReference.update({
              email : newEm
            });
            $scope.modalEmail.hide();
          } else {
            alert(error);
          }
        })
      } else {
        alert("Please fill out all details.");
      }
    }

    $scope.changeProfilePicture = function(opt) {
      //from camera
      var options1 = {
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
      //from photo library
      var options2 = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingTpe: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };

      if (opt === 0) {
        var options = options1;
      } else {
        var options = options2;
      }

      $cordovaCamera.getPicture(options).then(function(imageData) {
        userReference.update({
          profilePicture : imageData
        }, function(error) {
          if ( error === null ) {
            alert("Profile picture changed!");
            $scope.modalProfilePicture.hide();
          } else {
            alert(error);
          }
        });
      });

      $scope.$apply();//updates the view
    }

    $scope.changePassword = function(em, oldPw, newPw, confirmPw) {
      if ( em && oldPw && newPw && confirmPw ) {
        userReference.changePassword({
          email : em,
          oldPassword : oldPw,
          newPassword : newPw
        }, function(error) {
          if (error === null){
            alert("Password successfully changed!");
            $scope.modalPassword.hide();
          } else {
            alert(error);
          }
        });
      } else {
        alert("Please fill in all details.");


      }
    }
}])
