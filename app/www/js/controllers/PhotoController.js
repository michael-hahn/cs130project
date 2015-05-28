'use strict';
/**
 * @ngdoc function
 * @name starter.controller:PhotoController
 * @description
 * Photo controller of the app.
 *
**/
angular.module('starter')

.controller('PhotoController', function($scope, $stateParams, $state, $firebaseObject, $ionicSlideBoxDelegate, $timeout, firebaseObject, $ionicModal, $ionicHistory, $q) {
  
  $scope.currIndex = $stateParams.imageIndex;
  $scope.photoContent = $stateParams.imageData;
  var fbAuth = firebaseObject.getAuth();
  $scope.activePhoto = $scope.currIndex;
  $scope.photosArr = $stateParams.imagesArr;
  $scope.allUsersData = $stateParams.allUsersData;

  $timeout(function(){
    $ionicSlideBoxDelegate.update();
  }, 0);

  $scope.commentArr = [];
  $scope.formComments = function() {
    var comment = [];
    $scope.comment = [];
    imageCommentsReference.child($scope.photoContent.id).on("child_added", function(commentID) {
    var commentData = commentID.val()["data"];
    var c_userId = commentID.val()["userId"];
    var u_info;
    userDataReference.child(c_userId).on("value", function(info) {
      u_info = info.val();
    });
    var userName = getNameOfUserWithID(c_userId);
    var commentInfo = {data: commentData, name: userName, info: u_info};
    comment.push(commentInfo);
    });
    $scope.comment = comment;
    var commentObj = {id: $scope.photoContent.id, comment: $scope.comment};
    $scope.commentArr.push(commentObj);
  }


  if(fbAuth){
    var eventReference = firebaseObject.child("event_data/" + $stateParams.eventUID);
    var imageLikesReference = firebaseObject.child("image_likes");
    //For comments functionality
    var imageCommentsReference = firebaseObject.child("image_comments");
    var userCommentsReference = firebaseObject.child("user_comments");
    var userDataReference = firebaseObject.child("user_data");

    var addCommentObj = true;
    for (var i = 0; i < $scope.commentArr.length; i++) {
      if ($scope.commentArr[i].id === $scope.photoContent.id) {
        $scope.comment = $scope.commentArr[i].comment;
        addCommentObj = false;
      }
    }
    if (addCommentObj === true) {
      $scope.formComments(); 
    }   
  } else {
    $state.go("login");
  }

  /**
   * @ngdoc function
   * @name photoChanged
   * @methodOf starter.controller:PhotoController
   * @description
   * The active photo has changed. 
   *
   * @param {int} index index of new active photo
   */ 
  $scope.photoChanged = function(index) {
    $scope.currIndex = index;
    $scope.photoContent = $scope.photosArr[$scope.currIndex];
    $scope.photoContent.userInfo = $scope.allUsersData[$scope.photoContent.user];
    $ionicSlideBoxDelegate.update();
    var addCommentObj = true;
    for (var i = 0; i < $scope.commentArr.length; i++) {
      if ($scope.commentArr[i].id === $scope.photoContent.id) {
        $scope.comment = $scope.commentArr[i].comment;
        addCommentObj = false;
      }
    }
    if (addCommentObj === true) {
      $scope.formComments(); 
    }   
  }

  /**
   * @ngdoc function
   * @name close
   * @methodOf starter.controller:PhotoController
   * @description
   * close photo viewing session. 
   */ 
  $scope.close = function() {
    $ionicHistory.goBack();
  }

  /**
   * @ngdoc function
   * @name like
   * @methodOf starter.controller:PhotoController
   * @description
   * Like the photo. Increment the number of likes by one.
   *
   * @param {Object} im Firebase object representing the image
   */ 
  $scope.like = function(im) {

    if (im.likedBy !== undefined) {

      if (fbAuth.uid === im.user) {
        if (im.likedBy[fbAuth.uid] === 0) {
          im.numLikes++;
          //im.likedBy[fbAuth.uid] = 1;
          imageLikesReference.child(im.id).update({
            'numLikes': im.numLikes});
          imageLikesReference.child(im.id +'/likedBy').child(fbAuth.uid).set(1);
        }
      } else if (im.likedBy[fbAuth.uid] === undefined) {
        
        if (im.numLikes !== undefined)
          im.numLikes++;

        //im.likedBy[fbAuth.uid] = 1;
        
        imageLikesReference.child(im.id).update({
            'numLikes': im.numLikes});
          imageLikesReference.child(im.id +'/likedBy').child(fbAuth.uid).set(1);
      }
    } else {
      eventReference.child()
    }
  }

  /**
   * @ngdoc function
   * @name isLiked
   * @methodOf starter.controller:PhotoController
   * @description
   * Check if the curent user already liked the photo
   *
   * @param {Object} im Firebase object representing the image
   */ 
  $scope.isLiked = function(im) {
    if (im.likedBy !== undefined) {

      if (im.likedBy[fbAuth.uid] === 1 ) {
        return true;
      } 
    }
    return false;
  }

  $scope.getLikeIcon = function(im) {
    if (im.likedBy !== undefined) {

      if (im.likedBy[fbAuth.uid] === 1 ) {
        return "button button-clear button-icon icon ion-thumbsup";
      } 
      else
        return "button button-icon icon ion-thumbsup balanced";
    }
    return false;
  }

  function getNameOfUserWithID(userID) {
    return $q(function(resolve, reject) {
      firebaseObject.child("user_data/" + userID).once("value", function(userData) {
        resolve( userData.val()["displayName"] );
      });
    });
  }
  
  $scope.addUser2Event = function(photoData, index) {
    $state.go('addUser', {
      'eventUID' :  $scope.eventID, });
  }


   /**
   * @ngdoc function
   * @name addComments
   * @methodOf starter.controller:PhotoController
   * @description
   * Add a comment to the image.
   *
   * @param {Object} im Firebase object representing the image
   * @param {string} comment comment to add to image
   */ 
  $scope.addComments = function(im,comments) {
    //Once "Submit" button is pushed, the comment with the userID is pushed into the "image_comments" attribute
    var commentID = imageCommentsReference.child(im.id).push({
      data: comments,
      userId: fbAuth.uid
    });
    //We will also record which user makes what comments by saving the commentID to the userID in the "user_comments" attribute
    userCommentsReference.child(fbAuth.uid).child(commentID.key()).set(1);
    //End
  }

   /**
   * @ngdoc function
   * @name viewProfile
   * @methodOf starter.controller:PhotoController
   * @description
   * View profile of selected user.
   *
   * @param {string} user ID of user
   */ 
  $scope.viewProfile = function(user) {
    $state.go("viewProfile", {'user' : user});
  }

})
