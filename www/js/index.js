var app = angular.module('App', ['ngCordova','ui.router']);
var titles = {
    main: "CBC Radio",
    programs: "خلكم وينا",
    program: "برامجنا",
    news: "آخر الأخبار",
    contact: "برامجنا",
    categories: "Categories"
};
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $httpParamSerializerProvider) {

    $stateProvider
    .state('main', {
        url: '/newses/:cat',
        controller: 'mainController',
        templateUrl: 'views/news.html'
    })
    .state('categories', {
        url: '/categories',
        controller: 'catsController',
        templateUrl: 'views/categories.html',
        bclass: "categories"
    })
    .state('contact', {
        url: '/contact',
        controller: 'ContactController',
        templateUrl: 'views/contact.html',
        bclass: "contact"
    })
    .state('news', {
        url: '/news/{id:int}',
        controller: 'newsController',
        templateUrl: 'views/news.html',
        bclass: 'news'
    })
    .state('settings', {
        url: '/settings',
        controller: 'SettingsController',
        templateUrl: 'views/settings.html',
        bclass: 'settings'
    });

    $urlRouterProvider.otherwise('/newses/0');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $httpProvider.defaults.transformRequest = function(data) {
        return $httpParamSerializerProvider.$get()(data);
    };


    $(function(){

        $(".button-collapse").sideNav();
        // Initialize collapsible (uncomment the line below if you use the dropdown variation)
        $('.collapsible').collapsible();

        $(".play-pause").click(function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
        $('.modal').modal();

        $(".side-nav a").click(function() {
            $(".button-collapse").sideNav("hide");
        });

    });

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

app.controller("mainController", function($scope, $stateParams, $http, $state, $api) {

    $scope.$parent.isLoading = true;

    console.log($stateParams);
    var url = parseInt($stateParams.cat) ? "/news/cat" : "/news/all";

    $api.get(url, {
        'page':1,
        'length':10,
        'id': $stateParams.cat
    }, function(data) {
        if(data.success) {
            $scope.$parent.isLoading = false;
            $scope.news = data.result;
            // fixHeight(document.querySelector(".post-container"));
        }
    });


    $scope.open = function(id) {
        $state.go("news",{id:id});
        console.log(id);
    };

});

app.controller("catsController", function ($scope, $api, $state) {
    $api.get("/news/categories", {}, function(data) {
        if(data.success) {
            $scope.categories = data.result;
        }
    });

    $scope.open = function(id) {
        $state.go("main", {cat:id})
    }
});

app.controller('programsController', function ($scope,$state,$api) {

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

app.controller('ContactController', function ($scope,$state,$api, $timeout) {
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

    self.qualityPaths = {
        "HQ": "/live",
        "LQ": "/livelq"
    };

    self.bclass = "";
    self.pageTitle = "";

    self.isAudioLoading = true;

    $scope.timeStr = "00:00:00";

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

    audio.addEventListener("timeupdate", function(e) {
        $scope.timeStr = toHHMMSS(e.target.currentTime);
        $scope.$apply();
    });

    $scope.isLoading = true;

    $scope.$on('$stateChangeStart', function(){
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

    function setStreamSrc() {
        $scope.streamQuality = getQuality();
        $scope.streamSrc = "http://35.165.142.89:8000"+getQualityPath();
        console.log($scope.streamSrc);
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    }
    setStreamSrc();

    this.streamState = "playing";
    this.streamVolumeState = "enabled";

    $scope.playPause = function() {
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
    };

    function toHHMMSS(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    }

    function getQuality() {
        var q = localStorage.getItem("quality");
        if(q==null) {
            q = "HQ";
            localStorage.setItem("quality", q);
        }
        return q;
    }

    function getQualityPath() {
        return self.qualityPaths[getQuality()];
    }

    $scope.saveQuality = function(quality) {
        localStorage.setItem("quality", quality);
        setStreamSrc();
    };


});

app.controller("SettingsController", function($scope) {
    $scope.mdl = {
        quality: "1"
    };


    $scope.changeQuality = function($event) {
        $scope.$parent.saveQuality($event.target.checked ? "HQ" : "LQ");
    }

});

function fixHeight(e) {
    if(e) {
        var c = e.getBoundingClientRect();
        e.style.height = (document.body.clientHeight - c.top - 71) + "px";
    }
}
