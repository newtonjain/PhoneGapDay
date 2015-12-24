angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $ionicActionSheet, $ionicModal, Items, Auth, $ionicSwipeCardDelegate) {
  //$http.defaults.headers.common.Authorization = 'Basic dGVzdHVzZXI6MTIzNA==';
  $scope.student = {};
  var _self = this;
  _self.users = new Firebase("https://poll2roll.firebaseio.com/users");
  $scope.users = $firebaseArray(_self.users);

  //Opens the login modal as soon as the controller initializes
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modallogin) {
      $scope.modallogin = modallogin;
      $scope.modallogin.show();
  });

  //2 separate calls made to Facebook, First call gets the access token and some basic info and second call is 
  //used to get more advanced information. Second call has some limitations at the moment. 
  $scope.login = function() {
    var ref = new Firebase("https://poll2roll.firebaseio.com/");

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
          console.log("got it when made a request to FB open graph", data);
          $scope.authData.cover = data.picture.data.url;
          $scope.authData.gender = data.gender;
          $scope.authData.age = data.age_range;
          $scope.authData.id = parseInt(data.id);
          $scope.authData.profileImageURL = data.picture.data.url;
          $scope.authData.description = "Bio";
        })
        .error(function (data) {
          console.log("Error: " + JSON.stringify(data));
        });
      }
    },
    {
    scope: "email,user_birthday" // the permissions requested
    });
  };

  $scope.savefbinfo  = function() {
    $scope.modallogin.hide();
    _self.userExists = false;

    var userData= {
      "facebook_id": $scope.authData.id,
      "name": $scope.authData.displayName,
      "email": $scope.authData.email,
      "profile_picture_url": $scope.authData.profileImageURL,
      "gender": $scope.authData.gender
    };

    var ref = _self.users;
    ref.once("value", function(allUsersSnapshot) {
      console.log('khjkjh', allUsersSnapshot.val());

      allUsersSnapshot.forEach(function(userSnapshot) {
        var name = userSnapshot.child("username").val();
         console.log('////', name);
         if(name == $scope.authData.displayName) {
          console.log('matching');
          _self.userExists = true;
          return true;
         }
      }) 

      if(!_self.userExists) {
        $scope.users.$add({
          username: $scope.authData.displayName,
          userData: userData
        });
      }

    });
  };

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

})


.controller('CustomerCtrl', function($scope, $http) {

  $scope.calling = function() {
    var tosend = {
      "text": "I am getting an error saying XMLHttpRequest cannot load [url] Response for preflight has invalid HTTP status code 400.I tried calling from a form and it appears to be working. I debug the service from inside Visual Studio and it worked just fine",
    };
            
  }

})

.controller('DashCtrl', function($scope) {
})

.controller('ChatsCtrl', function($scope) {
})

.controller('ChatDetailCtrl', function($scope, $stateParams) {
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
