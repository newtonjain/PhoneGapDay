angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $ionicActionSheet, $ionicModal, Items, Auth, $ionicSwipeCardDelegate) {
 //$http.defaults.headers.common.Authorization = 'Basic dGVzdHVzZXI6MTIzNA==';
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
   var students;
   var absent = true;
        $http.get('https://api-us.clusterpoint.com/v4/102225/learntron[X999_Y999]', {
    headers: {'Authorization': 'Basic dGVzdHVzZXI6MTIzNA=='}})
        .success(function (data) {
          console.log(JSON.stringify(data.results[0].Students));
          console.log('Inspecting the data results', data);
          students = data.results[0].Students;

          for(var i = 0; i<students.length; i++) {
            if(students[i].name == $scope.authData.displayName) {
              absent = false;
              break;
            }
          }

          if(absent == true){
               var tosend = {
                    "ID":  ($scope.authData.id).toString(),
                     "name": $scope.authData.displayName,
                     "Rating": "1",
                      "email": $scope.authData.email,
                     "Comments": ""

               }

           data.results[0].Students.push(tosend);


             $http.put('https://api-us.clusterpoint.com/v4/102225/learntron[X999_Y999]', data.results[0], {
            headers: {'Authorization': 'Basic dGVzdHVzZXI6MTIzNA=='}})
            .success(function (data, status, headers, config) {
              console.log('saving data to customer', JSON.stringify(data), JSON.stringify(status));
            }).error(function (data, status, headers, config) {
                console.log('There was a problem posting your information' + JSON.stringify(data) + JSON.stringify(status));
            });


          }

        })
        .error(function (data) {
            alert("Error: " + JSON.stringify(data));
        });
  }

  $scope.options = function (option) {
    $scope.option = option;
    if(option === 'yes'){
         $scope.option = '1';
    } else {
        $scope.option = '0';
    }
  }

  $scope.comment = function(comment) {
      var students;

        $http.get('https://api-us.clusterpoint.com/v4/102225/learntron[X999_Y999]', {
        headers: {'Authorization': 'Basic dGVzdHVzZXI6MTIzNA=='}})
        .success(function (data) {
          students = data.results[0].Students;
          console.log(JSON.stringify(data));


          for(var i = 0; i<students.length; i++) {
            if(students[i].name == $scope.authData.displayName) {
              students[i].Rating = $scope.option;
              students[i].Comments = comment;
              break;
            }
          }

          data.results[0].Students = students;

           $http.put('https://api-us.clusterpoint.com/v4/102225/learntron[X999_Y999]', data.results[0], {
            headers: {'Authorization': 'Basic dGVzdHVzZXI6MTIzNA=='}})
          .success(function (data, status, headers, config) {
            console.log('saving data to customer', JSON.stringify(data), JSON.stringify(status));
          }).error(function (data, status, headers, config) {
              console.log('There was a problem posting your information' + JSON.stringify(data) + JSON.stringify(status));
          });



        })
        .error(function (data) {
            alert("Error: " + JSON.stringify(data));
        });

        if($scope.option == "0") {

             $http.get('http://127.0.0.1:3111/no')
            .success(function (data) {
              console.log('success');
            }).error(function (data) {
                console.log('fail');
            });
        }

        var sending = {};
        
      $http.post('http://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment?apikey=6dba745bbd9815883215760f648c975414379579&outputMode=json&text=' + comment)
            .success(function (data, status, headers, config) {
              console.log('IBM data', JSON.stringify(data.docSentiment)); 
              $scope.sentiment = data.docSentiment;
                          
            }).error(function (data, status, headers, config) {
              alert('Ibm error', JSON.stringify(data), JSON.stringify(status));
            });
  }

   $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modallogin) {
      $scope.modallogin = modallogin;
      $scope.modallogin.show();
  });

})


.controller('CustomerCtrl', function($scope, $http) {

  $scope.calling = function() {
    var tosend = {
      "text": "I am getting an error saying XMLHttpRequest cannot load [url] Response for preflight has invalid HTTP status code 400.I tried calling from a form and it appears to be working. I debug the service from inside Visual Studio and it worked just fine",
    };
            
  }

})

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
