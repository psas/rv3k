
//This is the main controller, it handles the logic in on the main page (app/index.html)
angular.module('rvtk', [])
    .controller('MainController', ['$scope', function($scope) {
    console.log("init");

    //initialize variables
    $scope.VisibleCamera = 1;
    $scope.hideEFV = false;

    //This funtion changes which video stream appears on the page when the button is clicked
    $scope.toggleCamera = function() {
	//to change the number of feeds to toggle through change the number of feeds variable
	var numberOfFeeds = 2;
        $scope.VisibleCamera = ++$scope.VisibleCamera%numberOfFeeds;
	console.log($scope.VisibleCamera);
    }
}]);


