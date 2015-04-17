var firebaseObject = new Firebase("https://cs130project.firebaseio.com/");

angular.module('starter.controllers', [])


.controller('AppCtrl', function($scope) {
})

.controller('LoginController', ['$scope', '$state', '$firebaseAuth', function($scope, $state, $firebaseAuth) {  
  var fbAuth = $firebaseAuth(firebaseObject); 

  $scope.login = function(username, password) {
    fbAuth.$authWithPassword({
      email: username,
      password: password
    }).then(function(authData) {
      alert("logged in!");
      $state.go("app.images");
    }).catch(function(error) {
      alert("email or password is invalid"); 
      console.error("ERROR: " + error);
    });
  }

  $scope.register = function(username, password) {
    fbAuth.$createUser({email: username, password: password}).then(function(userData) {
      return fbAuth.$authWithPassword({
        email: username,
        password: password
      });
    }).then(function(authData) {
      $state.go("app.images");
    }).catch(function(error){
      alert("Error: " + username + " already taken.");
      console.log("ERROR: " + error);
    });
  }

  $scope.logout = function() {
    firebaseObject.unauth();
    alert("logged out!");
    $state.go("app.login");
  }
}])

.controller('createEventController', function($scope, $stateParams) {
})

.controller('joinEventController', function($scope, $stateParams) {
})

.controller('ImagesController', function( $scope, $ionicHistory, $firebaseArray, $cordovaCamera, $state) {
  
  $ionicHistory.clearHistory();
  $scope.images = [];
  var fbAuth = firebaseObject.getAuth();
  
  if(fbAuth) {
    var userReference = firebaseObject.child("users/" + fbAuth.uid);
    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.images = syncArray;
  }
  else {
    $state.go("app.login");
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
      console.error(error);
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
});
