
//This is the main controller, it handles the logic in on the main page (app/index.html)
var app = angular.module('rvtk', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

    //initialize variables
    $scope.VisibleCamera = 1;
    $scope.hideEFV = false;

    //This funtion changes which video stream appears on the page when the button is clicked
    $scope.toggleCamera = function() {
	//to change the number of feeds to toggle through change the number of feeds variable
	var numberOfFeeds = 2;
        $scope.VisibleCamera = ++$scope.VisibleCamera%numberOfFeeds;
    };

    $scope.helloWorld = 'nothing';
    var namespace = '/test';
    var url = 'http://localhost:8080/test';
    // this port connects to port broadcast by ../unified/app.py
    var socket = io.connect('http://localhost:8080/test');
    socket.on('connect', function() {});
    $http.get(url).then();
    socket.on('disconnect', function() {});
    socket.on('my response', function(msg) {
        console.log(msg.data);
        $scope.helloWorld = msg.data;
        $scope.$apply();
    });
}]);
   
