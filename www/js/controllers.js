angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $ionicActionSheet, $ionicModal, Items, Auth, $ionicSwipeCardDelegate) {

 $scope.cards = [];
    $scope.cardTypes = {};
    $scope.cards.push($scope.cardTypes);
    $scope.student = {};

  $scope.cardSwiped = function(index) {
    var newCard = {};
  $scope.cards.push(newCard);
  };


  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  }

    $scope.goAway = function() {
    var card = $ionicSwipeCardDelegate.getSwipeableCard($scope);
    card.swipe();
  };

  $scope.login = function() {
  var ref = new Firebase("https://bookmywride.firebaseio.com/");
ref.authWithOAuthPopup("facebook", function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    // the access token will allow us to make Open Graph API calls
    console.log(authData.facebook.accessToken);
    console.log("Logged in as", authData);

    $scope.authData = authData.facebook; // This will display the user's name in our view
  $http.get('https://graph.facebook.com/me?fields=cover,gender,age_range,birthday,picture.width(800).height(800)&access_token=' + authData.facebook.accessToken)
        .success(function (data) {
         console.log("got it" + JSON.stringify(data));
        $scope.authData.cover = data.picture.data.url;
        $scope.authData.gender = data.gender;
        $scope.authData.age = data.age_range;
        $scope.authData.id = parseInt(data.id);
        $scope.authData.profileImageURL = data.picture.data.url;
        $scope.authData.description = "Erlich Bachman is a a supremely confident and arrogant entrepreneur who founded an innovation incubator in his home after the purchase of his airfare collator Aviato.";

         console.log('kshdkjhdkjhsakjd', data);
        })
        .error(function (data) {
            console.log("Error: " + JSON.stringify(data));
        });
  }
}, {
  scope: "email,user_birthday" // the permissions requested
});
};


$scope.savefbinfo  = function() {
   $scope.modallogin.hide();

  }

  $scope.options = function (option) {
    $scope.option = option;
    if(option === 'Economical'){
         $scope.adventurous = false;
    } else {
        $scope.adventurous = true;
    }
    console.log('the selection had been made', $scope.adventurous);

  }

   $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modallogin) {
      $scope.modallogin = modallogin;
      $scope.modallogin.show();
  });

})


.controller('CustomerCtrl', function($scope) {})

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope) {

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {

})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
