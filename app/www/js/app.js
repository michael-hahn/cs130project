'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['firebase', 'ngCordova', 'ionic', 'starter.controllers', 'starter.services'])

.run(['$rootScope', '$ionicPlatform', '$state', function($rootScope, $ionicPlatform, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        window.alert('You forgot to log in!');
        console.log("auth required");
        $state.go('login'); 
      }
    });
    //$state.go('login')
  });
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginController",
  })

  .state('registerUserDetails', {
    url: "/registerUserDetails",
    templateUrl: "templates/registerUserDetails.html",
    controller: "RegisterUserDetailsController",
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    //controller: 'AppCtrl'
    resolve: {
    // controller will not be loaded until $requireAuth resolves
      "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase('https://cs130project.firebaseio.com/');
        var authObj = $firebaseAuth(ref);
        return authObj.$requireAuth();
      }]
    }
  })

  .state('app.createEvent', {
    url: "/createEvent",
    views: {
      'menuContent': {
        templateUrl: "templates/createEvent.html",
        controller: "createEventController"
      },
      cache: false
    }
  })

    .state('app.joinEvent', {
    url: "/joinEvent",
    views: {
      'menuContent': {
        templateUrl: "templates/joinEvent.html",
        controller: "joinEventController"
      }
    }
  })

  .state("app.images", {
    url: "/images",
    views: {
      'menuContent': {
        templateUrl: "templates/images.html",
        controller: 'ImagesController'
      }
    },
    params: {'loginAuth' : null},
    resolve: {
        // controller will not be loaded until $requireAuth resolves
          "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
                  var ref = new Firebase('https://cs130project.firebaseio.com/');
                  var authObj = $firebaseAuth(ref);
                  return authObj.$requireAuth();
              }
          ]
        }
  })

  .state("app.photo", {
    url: "/photo",
    views: {
      'menuContent': {
        templateUrl: "templates/photo.html",
        controller: 'PhotoController'
      }
    },
    params: {'imageData' : null }
  })

  .state("app.profile", {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/profile.html",
        controller: 'ProfileController'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
