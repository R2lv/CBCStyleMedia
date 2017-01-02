var app = angular.module('App', ['ngCordova','ui.router']);
var titles = {
    main: "الرئيسية",
    live: "البث المباشر",
    programs: "خلكم وينا",
    program: "برامجنا",
    news: "آخر الأخبار",
    contact: "برامجنا"
};
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $httpParamSerializerProvider) {

    $stateProvider
    .state('main', {
        url: '/',
        controller: 'mainController',
        templateUrl: 'views/index.html'
    })
    .state('live', {
        url: '/live',
        controller: 'liveController',
        templateUrl: 'views/livestream.html',
        bclass: "live"
    })
    .state('programs', {
        url: '/programs',
        controller: 'programsController',
        templateUrl: 'views/programs.html',
        bclass: "programs"
    })
    .state('contact', {
        url: '/contact',
        controller: 'contactController',
        templateUrl: 'views/contact.html',
        bclass: "contact"
    })
    .state('program', {
        url: '/program/{id:int}',
        controller: 'programController',
        templateUrl: 'views/program.html',
        bclass: "program"
    })
    .state('news', {
        url: '/news/{id:int}',
        controller: 'newsController',
        templateUrl: 'views/news.html',
        bclass: 'news'
    });

    $urlRouterProvider.otherwise('/');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $httpProvider.defaults.transformRequest = function(data) {
        return $httpParamSerializerProvider.$get()(data);
    }

});

app.run(function($cordovaStatusbar) {
    document.addEventListener("deviceready", function() {
        console.log("Setting Style");
        $cordovaStatusbar.overlaysWebView(true);
        $cordovaStatusbar.style(2);
        $cordovaStatusbar.styleHex("#EBE13A");
        // $cordovaStatusbar.styleHex("#FFFFFF");
    }, false);
});

app.controller("mainController", function($scope, $http, $state, $api, $timeout) {

    $scope.$parent.isLoading = true;
    $api.get('/news/all', {
        'page':1,
        'length':10
    }, function(data) {
        if(data.success) {
            $scope.$parent.isLoading = false;
            $scope.news = data.result;
            fixHeight(document.querySelector(".post-container"));
        }
    });


    $scope.open = function(id) {
        $state.go("news",{id:id});
        console.log(id);
    };

});
app.controller("liveController", function ($scope, $http, $state, $api, $interval) {
    function showDate() {
        var dt = new Date();
        $scope.timeStr = dt.getHours()+":"+dt.getMinutes();
    }

    showDate();

    var i = $interval(showDate, 1000);

    $scope.$on("$destroy", function() {
        $interval.cancel(i);
    })
});

app.controller('programsController', function ($scope,$state,$api, $timeout) {


    $scope.$parent.isLoading = true;
    $api.get('/programs/all', {
        'page':1,
        'length':10
    }, function(data) {
        if(data.success) {
            $scope.$parent.isLoading = false;
            $scope.programs = data.result;
            fixHeight(document.querySelector(".post-container"));
        }
    });

    $scope.open = function(id) {
        $state.go("program",{id:id});
    };
});

app.controller('contactController', function ($scope,$state,$api, $timeout) {
    $scope.$on('$viewContentLoaded', function() {
        $timeout(function() {
            fixHeight(document.querySelector("form.contact-form"));
        }, 300);
    });

    $scope.submit = function() {
       $api.get("/contact", {
           name: $scope.name,
           email: $scope.email,
           message: $scope.text
       }, function(data) {
            if(data.success) {
                document.querySelector(".response").textContent = "Sent successfully";
            } else {
                document.querySelector(".response").textContent = "Error sending message";
            }
       }, function() {
           document.querySelector(".response").textContent = "Error sending message";
       });
    }
});

app.controller('programController', function($scope, $stateParams, $timeout, $api) {

    $scope.program = {
        title: "...",
        post_whole: "...",
        broadcast: "..."
    };


    $scope.$parent.isLoading = true;
    $api.get('/programs', {
        'id':$stateParams.id
    }, function(data) {
        if(data.success) {
            $scope.$parent.isLoading = false;
            $scope.program = data.result;
            fixHeight(document.querySelector(".program-info"));
        }
    });

});

app.controller('newsController', function($scope, $stateParams, $timeout, $api) {

    $scope.news = {
        title: "...",
        post_whole: "..."
    };

    $scope.$parent.isLoading = true;
    $api.get('/news', {
        'id':$stateParams.id
    }, function(data) {
        if(data.success) {
            $scope.$parent.isLoading = false;
            $scope.news = data.result;
            fixHeight(document.querySelector(".program-info"));
        }
    });

});

app.controller('BodyController', function($scope, $interval, $api) {
    var self = this;
    self.bclass = "";
    self.pageTitle = "";

    self.isAudioLoading = true;

    var getCurrentProgram;
    $interval(getCurrentProgram = function() {
        $api.get("/programs/current", {}, function(data) {
            if(data.success)
                $scope.currentProgram = data.result.title;
        });
    },10000);

    getCurrentProgram();

    var audio = document.querySelector('audio');

    audio.addEventListener("ended", function() {
        self.isAudioLoading = true;
        audio.load();
    });

    audio.addEventListener("error", function() {
        self.isAudioLoading = true;
        audio.load();
    });

    audio.addEventListener("play", function() {
        self.isAudioLoading = false;
    });

    $scope.isLoading = true;

    $scope.$on('$stateChangeStart', function(event, toState/*, toParams, fromState, fromParams*/){
        $scope.isLoading = true;
    });

    $scope.$on('$stateChangeSuccess', function(event, toState/*, toParams, fromState, fromParams*/){
        if (angular.isDefined(toState.bclass)) {
            self.bclass = toState.bclass;
        } else {
            self.bclass = "";
        }

        $scope.isLoading = false;

        if(angular.isDefined(titles[toState.name])) {
            self.pageTitle = titles[toState.name];
        }
    });

    $scope.streamSrc = "http://35.165.142.89:8000/live";

    this.streamState = "playing";
    this.streamVolumeState = "enabled";

    this.playPause = function() {
        console.log("pp");
        if(audio.paused) {
            audio.play();
            self.streamState = "playing";
        } else {
            audio.pause();
            self.streamState = "paused";
        }
    };

    this.switchVolume = function() {
        audio.muted = !audio.muted;
        self.streamVolumeState = audio.muted ? "disabled" : "enabled";
    }

});

function fixHeight(e) {
    if(e) {
        var c = e.getBoundingClientRect();
        e.style.height = (document.body.clientHeight - c.top - 71) + "px";
    }
}