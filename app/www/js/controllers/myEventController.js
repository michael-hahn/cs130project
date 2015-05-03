'use strict';

/**
 * @ngdoc function
 * @name starter.controller:myEventController
 * @description
 * browsing event controller of the app.
 *
**/
angular.module('starter')

.controller('myEventController', function($scope, $firebaseArray, $q, $state, firebaseObject) {
  var fbAuth = firebaseObject.getAuth();
  var myEvents = null;
  var myEventKeys = null;
  $scope.eventInfo =[];

 
  if(fbAuth) {

      var myEventsReference = firebaseObject.child("users/" + fbAuth.uid + "/Events");
      var eventReference = firebaseObject.child('Events');


      //get the keys of all events the user is in 
      myEventsReference.on("value",function(snapshot) {
      		myEvents = snapshot.val();
      		myEventKeys = Object.keys(myEvents);

      		for (var i in myEventKeys){
      			console.log(myEventKeys[i]);
      			eventReference.orderByKey().equalTo(myEventKeys[i]).on("value",function(snapshot) {
      				var theEvent = snapshot.val();
      				for (var j in theEvent){
      					console.log(theEvent[j].Host);
      				($scope.eventInfo).push(theEvent[j]);
      		}		
      				}, function (error) {
      					console.log("Read faild:" + error);      			
      				});
      		}

      }, function(error){
      	console.log("Read faild:" + error);
      });

  }
  else {
      $state.go("login");
  }

})
