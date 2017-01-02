app.service('$api', ['$http', function($http) {
    var apiUrl = "http://35.165.142.89/api";

    this.get = function(url, data, callback, error) {

        $http.post(apiUrl+url, data).success(function(data) {
            if(callback) {
                callback(data);
            }
        }).error(function(data) {
            if(error) {
                error(data);
            }
        });

    }
}]);