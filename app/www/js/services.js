angular.module('starter.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  var ref = new Firebase("https://cs130project.firebaseio.com");
  return $firebaseAuth(ref);
}])