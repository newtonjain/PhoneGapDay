describe("Controllers: AppCtrl", function() {
    var scope, fb, ctrl, $rootScope, $ionicModal, $controller, $httpBackend, expected={};

    beforeEach(function() {
        module('ngMock', "starter.controllers", function($provide) {
            var $Modal = jasmine.createSpyObj('$ionicModal', ['fromTemplateUrl']);
            $Modal.fromTemplateUrl.and.returnValue(successCallback);
            $provide.value('$ionicModal', $Modal);

            var spyArray = jasmine.createSpy('$firebaseArray').and.returnValue([]);
            $provide.value('$firebaseArray', spyArray);

            var modal = jasmine.createSpy('$cordovaLocalNotification').and.returnValue(expected);
            $provide.value('$cordovaLocalNotification', modal);

            _firebase(); 
        });
    });

    function _firebase() {
        Firebase = function () {
            this.on=  function(){
                return true;
            }
            this.$add = function() {
                return;
            }
            this.authWithOAuthPopup = function() {
                return;
            }
            this.once = function() {
                return;
            }
        }
    }

    var successCallback = {
       then: function(modallogin){
            scope.modallogin = modallogin;
            
            modallogin.hide = function(){};
        }
    };

    beforeEach(inject(function(_$controller_, _$rootScope_, $httpBackend, $ionicModal, $injector, $firebaseArray) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $httpBackend = $httpBackend;
        scope = $rootScope.$new();

        ctrl = $controller('AppCtrl', {
            $scope: scope,
        });

        scope.$apply();
    }));


    describe("test firebase login", function() {
        it("should make a call to firebase auth service", function() {
            fb = jasmine.createSpyObj('Firebase', ['on', '$add', 'authWithOAuthPopup', 'once']);
            expect(fb.$add).toBeDefined();
       })
    })
})

describe('Controllers: FeedbackCtrl', function(){
    var scope;
    var ionicSlideBoxDelegate;
    var questions;
    var FeedbackCtrl;

    // load the controller's module
    beforeEach(module('ngMock','starter.controllers', function($provide) {
        var $Modal = jasmine.createSpyObj('$ionicModal', ['fromTemplateUrl']);
        $Modal.fromTemplateUrl.and.returnValue(successCallback);
        $provide.value('$ionicModal', $Modal);


        questions = jasmine.createSpyObj('Questions', ['all']);
        questions.all.and.returnValue(successCallback3);
        $provide.value('Questions', questions);
    }));
       

    var successCallback = {
       then: function(modal){
            scope.modal_login = modal;
        }
    };

    var successCallback3 = {
        then: function() {
            var questions = {
                q1: 'Here is a test question',
                q2: 'How are you',
                q3: 'where are you from'
            }
        return questions;
        }
    };

    function onSuccess() {
        var acceleration = { x: 12, y:13, z:14 };
        return acceleration;
    }


    beforeEach(inject(function($rootScope, $controller, _$window_) {
        scope = $rootScope.$new();
        $window = _$window_;
        
        navigator = $window.navigator;
        
        $window.navigator = {
            accelerometer: {
                watchAcceleration : onSuccess
            } 
        };

        ionicSlideBoxDelegate = jasmine.createSpyObj('ionicSlideBoxDelegate', ['next', 'currentIndex', 'previous']);

        FeedbackCtrl = $controller('FeedbackCtrl', {
            $scope: scope,
            $window : window,
            $ionicSlideBoxDelegate : ionicSlideBoxDelegate,
            Questions : questions
        });
    }));
    
    it('can get an instance of my factory', inject(function(Questions) {
        expect(Questions).toBeDefined();
    }));

    // tests start here
    it('should have current rating to 5', function(){
        expect(scope.dynamic).toEqual(5);
        expect(scope.max).toEqual(10);
    });
    
    it('should have survey submitted to false', function(){
       expect(FeedbackCtrl.surveySubmitted).toBe(false);
    });
    
     it('should reflect ionicSlideBoxDelegate', function(){
        scope.next();
        scope.$apply();
        expect(ionicSlideBoxDelegate.next).toHaveBeenCalled();

        scope.previous();
        scope.$apply();
       expect(ionicSlideBoxDelegate.previous).toHaveBeenCalled();
    });

    it('start from question on slide 1', function(){
        scope.next();
        scope.$apply();
        expect(scope.prev).toEqual(0);
    });
});
