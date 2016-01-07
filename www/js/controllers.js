angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $http, $firebaseObject, $firebaseArray, $ionicActionSheet, $ionicModal, Auth, $cordovaLocalNotification) {

  var _self = this;
  _self.users = new Firebase("https://poll2roll.firebaseio.com/users");
  _self.questions = new Firebase("https://poll2roll.firebaseio.com/questions");
  _self.pushNotify = new Firebase("https://poll2roll.firebaseio.com/pushNotify");

  $scope.users = $firebaseArray(_self.users);
  $scope.questions = $firebaseArray(_self.questions);

  var notifications = _self.pushNotify;

  notifications.on('value', function(dataSnapshot) {
    var value = dataSnapshot.val();

    console.log('pushNotify', value, Object.keys(value).length);
    notificationReceived(value);
  });


  var notificationReceived = function(value) {
    var now = new Date().getTime();
    var date = new Date();
    var _10SecondsFromNow = new Date(now + 30 * 1000);
    var notificationDate = new Date(value[1].Time);
    console.log('here and now',_10SecondsFromNow, notificationDate);

    angular.forEach(value, function(value, key) {
      console.log(key,': ',value);

      if(value.Activate) {
        $cordovaLocalNotification.schedule({
        id: key,
        title: value.Title,
        text: value.Body,
        firstAt: notificationDate
        });
      }
    });
  }

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

.controller('FeedbackCtrl', function($scope, $http, $window, $ionicSlideBoxDelegate, $ionicModal) {
    var _self = this;
    var X;
    var Y;
    var Z;
    $scope.dynamic = 5;
    $scope.max = 10;
    _self.surveySubmitted = false;
    $scope.prev = 0;

    $scope.slideHasChanged = function(index) {
        console.log('yes yes', index);

        if(!$scope.questions[$scope.prev].Rating){
            $scope.questions[$scope.prev].Rating = $scope.dynamic;
        }
      if(index<$scope.questions.length) {
        $scope.prev = index;
        $scope.dynamic = 5;
      } else {
        console.log('no no', index);
      }


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
        X = acceleration.x;
        Y = acceleration.y;
        Z = acceleration.z;

        if(X < -3) {
            $scope.dynamic += 1;
        } 
        
        if (X > 3) {
            $scope.dynamic -= 1;
        } 

        if($scope.dynamic > 10) {
            $scope.dynamic = 10;
        } else if ($scope.dynamic < 0 || $scope.dynamic == 0) {
            $scope.dynamic = 1;
        }
        
        var type = "info";

        if ($scope.dynamic < 3) {
            type = 'danger';
        } else if ($scope.dynamic > 7) {
            type = 'success';
        }
        
        $scope.detectShake(acceleration); 
        $scope.type = type;
        $scope.$apply();
    }

    function onError() {
        console.log('accelerometer not working');
    }

    var options = { frequency: 900 };  // Update every 500 milliseconds
    $window.navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

    // watch Acceleration
    $scope.options = { 
        frequency: 100, // Measure every 100ms
        deviation : 30  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
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

    
    // $('.character').addClass('poptwo'); // Intro
    // $('.rating').addClass('popthree'); // Intro
    // $('.next,.prev').addClass('popfour'); // Intro


    var slide_amount = $('.feedbackform_slide').length; // Slide count
    var window_width = $(window).width(); // Init window width
    var current_x = 0; // Current x value of slides
    var current_position = 0; // Current position

    $('.feedbackform').css('width',window_width * slide_amount + 'px'); // Set up the slides
    $('.feedbackform_slide').css('width',window_width + 'px'); // Set up the slides

    $(window).resize(function(){ // Responisivity
        var window_width = $(window).width(); // Window width
        $('.feedbackform').css('width',window_width * slide_amount + 'px'); // Re jig slide sizes
        $('.feedbackform_slide').css('width',window_width + 'px'); // Re jig slide sizes
        current_position = 0; // Reset
        current_x = current_position * window_width; // Reset
        $('.feedbackform_slide').css('right',current_x); // Reset
        $('.active_slide').removeClass('active_slide')
        $('.first').addClass('active_slide');
    });

    // Messages
    var active_array = ['terrible','bad','not great','average','good','excellent','amazing']; // Panda array
    var smile_value;

    var active_smile = 'panda'; // Get active smile
    setInterval(function() {
        // Change smile svg coords
        smile_value = $scope.questions[$scope.prev].Rating*2 || $scope.dynamic*2; // Get the value
        $('.smile.' + active_smile + ' path').attr('d','M10 10 C 20 ' + smile_value + ', 40 ' + smile_value + ', 50 10');

        $('.sb.' + active_smile).css('opacity',(smile_value/60)); // Pattern opacity
        $('.grad.' + active_smile).css('opacity',(smile_value/40)); // Gradient opacity
        if(smile_value == 0){
            // Worst
            $('.rating.' + active_smile + ' span').html(active_array[0]); // Set message
        } else if(smile_value < 5 && smile_value > 0){
            // Bad
            $('.rating.' + active_smile + ' span').html(active_array[1]); // Set message
        } else if(smile_value < 10 && smile_value > 5){
            // Not good
            $('.rating.' + active_smile + ' span').html(active_array[2]); // Set message
        } else if(smile_value == 10){
            // Average
            $('.rating.' + active_smile + ' span').html(active_array[3]); // Set message
        } else if(smile_value > 10 && smile_value < 15){
            // Good
            $('.rating.' + active_smile + ' span').html(active_array[4]); // Set message
        } else if(smile_value > 15 && smile_value < 20){
            // Very good
            $('.rating.' + active_smile + ' span').html(active_array[5]); // Set message
        } else if(smile_value== 20){
            // Amazing
            $('.rating.' + active_smile + ' span').html(active_array[6]); // Set message
        }        
    }, 200)
})


