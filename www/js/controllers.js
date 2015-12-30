angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $ionicActionSheet, $ionicModal, Items, Auth) {

  var _self = this;
  _self.users = new Firebase("https://poll2roll.firebaseio.com/users");
  _self.questions = new Firebase("https://poll2roll.firebaseio.com/questions");

  $scope.users = $firebaseArray(_self.users);
  $scope.questions = $firebaseArray(_self.questions);

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
        // the access token will allow us to make Open Graph API calls.
        console.log(authData.facebook.accessToken);
        console.log("Logged in as", authData);

        $scope.authData = authData.facebook; // This will display the user's name in our view.
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

    var userData = {
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
          console.log('matching', userSnapshot.key());
           $scope.key = userSnapshot.key();
          _self.userExists = true;
          return true;
         }
      }) 

      if(!_self.userExists) {
        $scope.users.$add({
          username: $scope.authData.displayName,
          userData: userData
        }).then(function(ref) {
      $scope.key = ref.key();
      console.log("added record with id " + $scope.key, '/////', $scope.users.$indexFor($scope.key));
      // returns location in the array
    });

      }
    });
    $scope.index = $scope.users.$indexFor($scope.key);
  };
})

.controller('CustomerCtrl', function($scope, $http, $window, $ionicSlideBoxDelegate, $ionicModal, $ionicPlatform) {
  var _self = this;
  $scope.X;
  $scope.Y;
  $scope.Z;
  $scope.dynamic = 50;
  $scope.max = 100;
  _self.surveySubmitted = false;
  $scope.prev = 0;

$scope.slideHasChanged = function(index) {
  if(!$scope.questions[$scope.prev].Rating){
    $scope.questions[$scope.prev].Rating = $scope.dynamic;
  }
  $scope.prev = index;
  $scope.dynamic = 50;
}

$scope.closeLogin = function() {
  $scope.modal.hide();
};

$scope.rateAgain = function() {
  $scope.dynamic = $scope.questions[$scope.prev].Rating;
  $scope.questions[$scope.prev].Rating = null;
}

 $ionicModal.fromTemplateUrl('templates/surveyComplete.html', {
  scope: $scope
}).then(function(modal) {
  $scope.modal = modal;
});

$scope.submitSurvey = function() {
  var send={};

  $scope.questions[$scope.prev].Rating = $scope.dynamic;

  for(var i = 0; i < $scope.questions.length; i++) {
    var val = $scope.questions[i];
    send[val.$id] = val.Rating || 'NA';
  }

  $scope.users[$scope.index].feedback = send;
  console.log('///', $scope.users[$scope.index].feedback);

  $scope.users.$save($scope.index).then(function() {
  $scope.modal.show();
  _self.surveySubmitted = true;
  });
}

$scope.previous = function() {
  $ionicSlideBoxDelegate.previous();
}

$scope.next = function() {
  $ionicSlideBoxDelegate.next();
}

function onSuccess(acceleration) {
    $scope.X = acceleration.x;
    $scope.Y = acceleration.y;
    $scope.Z = acceleration.z;

    if($scope.X < -3 && $scope.X > -5) {
      $scope.dynamic += 4;
    } 
    if ($scope.X < -5) {
      $scope.dynamic += 8;
    } 
    if ($scope.X > 5) {
      $scope.dynamic -= 8;
    } 
    if ($scope.X > 3 && $scope.X < 5) {
      $scope.dynamic -= 4;
    } 
    if($scope.Y  < 0 && $scope.Z > 9) {
       $ionicSlideBoxDelegate.next();
    }

    if($scope.Z < -4.7) {
       $ionicSlideBoxDelegate.previous();
    }
    if($scope.dynamic > 100) {
      $scope.dynamic = 100;
    } else if($scope.dynamic <0) {
      $scope.dynamic = 0;
    }
    var type;

    if ($scope.dynamic < 45) {
      type = 'warning';
    } else {
      type = 'success';
    }
    $scope.detectShake(acceleration); 

    $scope.type = type;
    $scope.$apply();
}

function onError() {
    console.log('accelerometer not working');
}

var options = { frequency: 500 };  // Update every 3 seconds

var watchID = $window.navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

//////////////////////

  // watch Acceleration
  $scope.options = { 
    frequency: 100, // Measure every 100ms
    deviation : 25  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
  };

  // Current measurements
  $scope.measurements = {
    x : null,
    y : null,
    z : null,
    timestamp : null
  }

  // Previous measurements  
  $scope.previousMeasurements = {
    x : null,
    y : null,
    z : null,
    timestamp : null
  } 
  
  // Watcher object
  $scope.watch = null;
  
  // Start measurements when Cordova device is ready
    $ionicPlatform.ready(function() {
    
    //Start Watching method
    $scope.startWatching = function() {   

        // Device motion configuration
    var watchID = $window.navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
        
    };    

    // Stop watching method
    $scope.stopWatching = function() {  
      $window.navigator.accelerometer.clearWatch(watchID);
    }   
    
    // Detect shake method    
    $scope.detectShake = function(result) { 
    
        //Object to hold measurement difference between current and old data
            var measurementsChange = {};
      
      // Calculate measurement change only if we have two sets of data, current and old
      if ($scope.previousMeasurements.x !== null) {
        measurementsChange.x = Math.abs($scope.previousMeasurements.x, result.x);
        measurementsChange.y = Math.abs($scope.previousMeasurements.y, result.y);
        measurementsChange.z = Math.abs($scope.previousMeasurements.z, result.z);
      }
      
      // If measurement change is bigger then predefined deviation
      if (measurementsChange.x + measurementsChange.y + measurementsChange.z > $scope.options.deviation) {
        //$scope.stopWatching();  // Stop watching because it will start triggering like hell
      console.log('Shake detected'); // shake detected
        //setTimeout($scope.startWatching(), 1000);  // Again start watching after 1 sex
         $scope.submitSurvey();
        
        // Clean previous measurements after succesfull shake detection, so we can do it next time
        $scope.previousMeasurements = { 
          x: null, 
          y: null, 
          z: null
        }       
        
      } else {
        // On first measurements set it as the previous one
        $scope.previousMeasurements = {
          x: result.x,
          y: result.y,
          z: result.z
        }
      }     
      
        }   
    
    });
  
  $scope.$on('$ionicView.beforeLeave', function(){
      $window.navigator.accelerometer.clearWatch(watchID);
  }); 
})


