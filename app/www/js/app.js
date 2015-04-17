// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['firebase', 'ngCordova', 'ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $state) {
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

    $state.go('app.login')
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: "/login",
    views: {
      'menuContent': {
        templateUrl: "templates/login.html",
        controller: "LoginController"
      }
    }
  })

  .state('app.createEvent', {
    url: "/createEvent",
    views: {
      'menuContent': {
        templateUrl: "templates/createEvent.html",
        controller: "createEventController"
      }
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
    params: {'loginAuth' : null}
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
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});
