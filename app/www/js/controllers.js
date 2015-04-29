'use strict';

var firebaseObject = new Firebase("https://cs130project.firebaseio.com/");

angular.module('starter.controllers', [])

.controller('LoginController', ['$scope', '$state', '$firebaseAuth', '$ionicModal', '$ionicLoading', function($scope, $state, $firebaseAuth, $ionicModal, $ionicLoading) {  
  
  var fbAuth = $firebaseAuth(firebaseObject); 

  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalRegister = modal;
  });

  $ionicModal.fromTemplateUrl('templates/loginExtra/recoverPassword.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modalRecoverPassword = modal;
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
          $scope.modalRegister.hide();
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

  $scope.recoverPassword = function(userEmail) {
    if (userEmail) {

      $ionicLoading.show({
          template: 'Sending password reset email...'
        });

      firebaseObject.resetPassword({
        email: userEmail
      }, function(error) {
        if (error === null) {
          $ionicLoading.hide();
          $scope.modalRecoverPassword.hide();
          alert("Password reset email has been sent to " + userEmail + ".");
        } else {
          $ionicLoading.hide();
          alert("Error sending reset password email :" + error);
        }
      })
    } else {
      alert("Please give your email.");
    }
  }

}])

.controller('RegisterUserDetailsController', function( $scope, $cordovaCamera, $ionicModal, $firebaseAuth, $state, $timeout) {
    
    console.log("in details ctrl");
    $scope.profilePic = ""; 

    $ionicModal.fromTemplateUrl('templates/registerDetails/registerChooseProfilePic.html', {
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
        $scope.profilePic = "data:image/jpeg;base64," +imageData;
      });

      $timeout(function() {},0);
      //$scope.$apply();//updates the view
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
            var eventID = eventsReference.push({Host: email, Name: eventName, Password: password, Active: 1}).key();
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

.controller('joinEventController', function($scope, $stateParams) {
})

.controller('ImagesController', function( $scope, $ionicHistory, $firebaseArray, $cordovaCamera, $state) {
  //$ionicHistory.clearHistory();
 
  var fbAuth = firebaseObject.getAuth();
  $scope.images = [];
  if(fbAuth) {
     
    var userReference = firebaseObject.child("users/" + fbAuth.uid);

    userReference.on("value", function(snapshot) {
          //console.log(snapshot.val());
          $scope.userData = snapshot.val();
      }, function(error) {
          console.log("Read failed: " + error);
      });

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

      var timestamp = new Date().getTime();
      var date = new Date(timestamp);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      var formattedTime = hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
      
      syncArray.$add({
        image: "data:image/jpeg;base64," + imageData,
        user: fbAuth.uid,
        time: formattedTime
      }).then(function() {
        alert("Image has been uploaded!");
      });
    }, function(error) {
      console.error("ERROR UPLOAD: " + error);
    });
  }

  $scope.viewPhoto = function(photoData, index) {
    $state.go('viewPhoto', {
      'imageData' : photoData,
      'imageIndex' : index
       });
  }

})

.controller('PhotoController', function($scope, $stateParams, $state, $firebaseArray, $ionicSlideBoxDelegate, $timeout) {
  
  var index = $stateParams.imageIndex;

  $scope.currIndex = $stateParams.imageIndex;
  $scope.photoContent = $stateParams.imageData;

  var fbAuth = firebaseObject.getAuth();
  
  $scope.activePhoto = $scope.currIndex;
  $scope.photosArr = [];

  if(fbAuth){

    var userReference = firebaseObject.child("users/" + $stateParams.imageData.user);

    userReference.on("value", function(snapshot) {;
          $scope.userData = snapshot.val();

          $timeout(function() {
            $ionicSlideBoxDelegate.update();
          }, 50);

      }, function(error) {
          console.log("Read failed: " + error);
      });

    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.photosArr = syncArray;

  } else {
    $state.go("login");
  }

  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
  }

  $scope.close = function() {
    $state.go("app.images");
  }

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

  //gets time
  var timestamp = new Date().getTime();
  var date = new Date(timestamp);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var formattedTime = hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
  
  testPosts.push({
      testPost: formattedTime
    });
    alert("posted to firebase!");
  }
})

.controller('ProfileController', ['$scope', '$state', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$timeout', function($scope, $state, $ionicModal, $ionicLoading, $cordovaCamera, $timeout) {
    var fbAuth = firebaseObject.getAuth();
    $scope.userData = null;
    if(fbAuth) {
       
      var userReference = firebaseObject.child("users/" + fbAuth.uid);
      userReference.on("value", function(snapshot) {
          //using timeout to schedule the changes to the scope in a future call stack. timeout period of 0ms makes it occur as soon as possible and $timeout will ensure code be called in single $apply block
          $timeout(function() {
            $scope.userData = snapshot.val();
          }, 0);
      }, function(error) {
          console.log("Read failed: " + error);
      });
    }
    else {
      $state.go("login");
    

    }
     
    console.log($scope.userData);

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
            $scope.modalDisplayName.hide();
            alert("Changed display name to " + newName);
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
            $scope.modalEmail.hide();
            userReference.update({
              email : newEm
            });
            alert("Email changed from " + oldEm + " to " + newEm);
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
      } else{
        var options = options2;
      } 

      $cordovaCamera.getPicture(options).then(function(imageData) {
        userReference.update({
          profilePicture : "data:image/jpeg;base64," +imageData
        }, function(error) {
          if ( error === null ) {
            $scope.modalProfilePicture.hide();
            alert("Profile picture changed!");
          } else {
            alert(error);
          }
        });
      });

      $scope.$apply();//updates the view
    }

    $scope.removeProfilePicture = function() {
      userReference.update({
          profilePicture : ''
        }, function(error) {
          if ( error === null ) {
            $scope.modalProfilePicture.hide();
            alert("Profile picture changed!");
          } else {
            alert(error);
          }
        })
    }

    $scope.changePassword = function(em, oldPw, newPw, confirmPw) {
      if ( em && oldPw && newPw && confirmPw ) {
        userReference.changePassword({
          email : em,
          oldPassword : oldPw,
          newPassword : newPw
        }, function(error) {
          if (error === null){
            $scope.modalPassword.hide();
            alert("Password successfully changed!");
          } else {
            alert(error);
          }
        });
      } else {
        alert("Please fill in all details.");


      }
    }
}])