'use strict';

/**
 * @ngdoc overview
 * @name starter
 * @description
 * Main module of the application
 * angular.module is a global place for creating, registering and retrieving Angular modules
 *
 * 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
 *
 * the 2nd parameter is an array of 'requires'
 * 
 * Uses $stateProvider to create states that correspond to a "place" in the application in terms of the overall UI and navigation.
 *    - A state describes what the UI looks like and does at that place (via controller/template/view properties)
 *    - States often have things in common, and can use nested states to factor out commonalities

 */

// Ionic Starter App
angular.module('starter', ['firebase', 'ngCordova', 'ionic'])

.value('firebaseObject', new Firebase("https://cs130project.firebaseio.com/"))

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

  });
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/loginHTML/login.html",
    controller: "LoginController",
  })

  .state('registerUserDetails', {
    url: "/registerUserDetails",
    templateUrl: "templates/registerHTML/registerUserDetails.html",
    controller: "RegisterUserDetailsController",
  })

  .state('createEvent', {
    url: "/createEvent",
    templateUrl: "templates/createEvent.html",
    controller: "createEventController",
    cache: false,
    resolve: {
    // controller will not be loaded until $requireAuth resolves
      "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase('https://cs130project.firebaseio.com/');
        var authObj = $firebaseAuth(ref);
        return authObj.$requireAuth();
      }]
    }
  })

  .state('joinEvent', {
    url: "/joinEvent",
    templateUrl: "templates/joinEvent.html",
    controller: "joinEventController",
    cache: false,
    resolve: {
    // controller will not be loaded until $requireAuth resolves
      "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase('https://cs130project.firebaseio.com/');
        var authObj = $firebaseAuth(ref);
        return authObj.$requireAuth();
      }]
    }
  })

  .state("viewPhoto", {
    url: "/photo",
    templateUrl: "templates/photo.html",
    controller: 'PhotoController',
    params: {'imageData' : null,
             'imageIndex' : null,
             'eventUID': null,
             'imagesArr': null
    },
    cache: true,
    resolve: {
    // controller will not be loaded until $requireAuth resolves
      "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase('https://cs130project.firebaseio.com/');
        var authObj = $firebaseAuth(ref);
        return authObj.$requireAuth();
      }]
    }
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    resolve: {
    // controller will not be loaded until $requireAuth resolves
      "currentAuth": ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase('https://cs130project.firebaseio.com/');
        var authObj = $firebaseAuth(ref);
        return authObj.$requireAuth();
      }]
    }
  })

  .state("app.eventsPage", {
    url: "/images",
    views: {
      'menuContent': {
        templateUrl: "templates/eventPage.html",
        controller: 'eventPageController'
      }
    },
    params: {'eventUID' : null }
  })

  .state("app.settings", {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settingsHTML/settings.html",
        controller: 'SettingsController'
      }
    }
  })

  .state("app.eventsMenu", {
    url: "/eventsMenu",
    views: {
      'menuContent': {
        templateUrl: "templates/eventsMenu.html",
        controller: 'eventsMenuController'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})

