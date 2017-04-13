'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('rvtk', ['ngRoute']);

app.config(['$locationProvider', '$routeProvider', '$scope', function($locationProvider, $routeProvider, $scope) {
    $locationProvider.hashPrefix('!');
}]);

