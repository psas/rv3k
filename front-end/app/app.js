/**
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('rvtk', ['ngRoute']);

app.config(['$locationProvider', '$routeProvider', '$scope', function($locationProvider, $routeProvider, $scope) {
    $locationProvider.hashPrefix('!');
}]);

