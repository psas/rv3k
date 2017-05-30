/*
 * atAGlance.js displays the information received by the PSAS telemetry packet in easy to read cards that describe the information
 * of the rocket in real-time.
 * Copyright (C) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen
 * Michael Ohl, Mathew Tighe
 *
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either vesion 2 of the License, or (at our option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY of FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * ALL RIGHTS RESERVED
 * This program is licensed under the "GNU General Public License"
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict'

angular.module("rvtk").directive("atAGlance", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', function atAGlanceController($scope) {
            // This variable represents the different data formats
            // We are using a set so that we only have one item of a specific type added
            $scope.formats = new Set();
            // A parallel array with timestamps for each piece of data
            $scope.formatsTimeStamps = new Set();

            // Connect to the server.
            var namespace = '/main';
            var socket = io.connect('http://' + document.domain + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});

            // Connect to the telemetry server specifically.
            socket.on('telemetry', function(data) {
                // Key here is the packet format.
                // data[key] will then be an object containing types and
                // their respective data.
                for(var key in data) {
                    // Ignore these formats
                    if(key == 'BMP1' || key == 'JGPS' || key == 'SEQN' || key == 'ROLL') {
                        continue;
                    }
                    
                    $scope.formats.add(key);
                    $scope.formatsTimeStamps.add(key);
                    // The if statement makes sure that we do not clear the old data
                    if(!$scope.formats[key]) {
                        $scope.formats[key] = new Set();
                        $scope.formatsTimeStamps[key] = new Set();
                    }

                    for(var type in data[key]){
                        // Do not display the timestamps 
                        if(type == 'timestamp' || type == 'recv') {
                            continue;
                        }
                        $scope.formats[key].add(type);
                        $scope.formatsTimeStamps[key].add(type);
                        $scope.formats[key][type] = data[key][type];
                        $scope.formatsTimeStamps[key][type] = Date.now();
                    }
                    // Update the display 
                    $scope.$apply();
                }
                // checks to see if the data is stale and changes the background color
                $scope.dataAging();
            });
            $scope.dataAging = function() {
                for(var key in $scope.formatsTimeStamps) {
                    // Ignore these
                    if(key == 'BMP1' || key == 'JGPS' || key == 'SEQN' || key == 'ROLL') {
                        continue;
                    }
                    for(var type in $scope.formatsTimeStamps[key]){
                        var currentTime = Date.now();
                        // PSAS Green
                        var color = '#607D2A';
                        // 12 seconds
                        if($scope.formatsTimeStamps[key][type] <= currentTime - 12000) {
                                color = '#BABABA'; 
                        // 9 seconds
                        } else if($scope.formatsTimeStamps[key][type] <= currentTime - 9000) {
                                color = '#A8AD9D';
                        // 6 seconds
                        } else if($scope.formatsTimeStamps[key][type] <= currentTime - 6000) {
                                color = '#8D9B72';
                        // 3 seconds 
                        } else if($scope.formatsTimeStamps[key][type] <= currentTime - 3000) {
                                color = '#728946';
                        } 
                        // grab the element
                        var currentElement = angular.element(document.querySelector('#' + type));
                        // change it's background color
                        currentElement.css('background-color', color);
                    }
                }

            };
        }],
        templateUrl: 'directives/atAGlance.html'
    }
});
