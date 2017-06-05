/*
 * telemetryCharts.js will create an angular-chart.js bar chart with the Acc_eleration of each axix of the rocket.
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

/* global angular */
/* global Cesium */
/* global io */
/* global app */

'use strict'

app.directive("telemetryCharts", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', 'config', function telemetryChartsController($scope, config) {

            // Connect to the server.
            var namespace = '/main';
            var socket = io.connect('http://' + config.serverSource + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});

            // Note: Using a different number of data points for ADIS and V8A8 strip charts since
            // the number of data packets are significantly different between the two packet types.
            // Can easily be changed if more V8A8 packets are sent during launch, which it sounds
            // like this will be the case for their next launch.

            // Number of data points that will be graphed on the strip-chart at one time.
            // Applies to the Accelerometer and Gyroscope charts which come in the ADIS data packet
            var ADISNumDataPoints = config.numPointsADIS;
            // Number of data points that will be graphed on the strip-chart at one time.
            // Applies to the Altitude and Speed charts which come in the V8A8 data packet.
            var V8A8NumDataPoints = config.numPointsV8A8;

            // Connect to the telemetry server specifically.
            socket.on('telemetry', function(data) {
                // Key here is the packet format.
                // data[key] will then be an object containing types and their respective data.
                for(var key in data) {
                    if(key == config.ADIS) {
                        // Add new data point to Accelerometer chart
                        $scope.Acc_Data[0].push(data[key][config.Acc_X]);
                        $scope.Acc_Data[1].push(data[key][config.Acc_Y]);
                        $scope.Acc_Data[2].push(data[key][config.Acc_Z]);

                        // Add new data point to Gyroscope chart
                        $scope.Gyro_Data[0].push(data[key][config.Gyro_X]);
                        $scope.Gyro_Data[1].push(data[key][config.Gyro_Y]);
                        $scope.Gyro_Data[2].push(data[key][config.Gyro_Z]);

                        // Remove the oldest data point from both Accelerometer and Gyroscope chart
                        $scope.Acc_Data[0].shift();
                        $scope.Acc_Data[1].shift();
                        $scope.Acc_Data[2].shift();
                        $scope.Gyro_Data[0].shift();
                        $scope.Gyro_Data[1].shift();
                        $scope.Gyro_Data[2].shift();
                    }
                    else if(key == config.V8A8){
                        // Add new data point to Altitude chart
                        $scope.Altitude_Data[0].push(data[key][config.Ellipsoid_Altitude]);

                        // Add new data point to Speed chart by calculating the magnitude of the
                        // rocket's velocity
                        $scope.Speed_Data[0].push(Math.sqrt((data[key][config.ECEF_VX] * data[key][config.ECEF_VX]) +
                                                         (data[key][config.ECEF_VY] * data[key][config.ECEF_VY]) +
                                                         (data[key][config.ECEF_VZ] * data[key][config.ECEF_VZ])));

                        // Remove the oldest data point from both Ellipsoid Altitude and Speed chart
                        $scope.Altitude_Data[0].shift();
                        $scope.Speed_Data[0].shift();
                    }
                }

                // Cycles through each chart and updates the data values
                for(var i in $scope.charts){
                    $scope.charts[i].update();
                }
            });

            // Turn on or off tooltip based on the config variable showTooltips
            //Chart.defaults.global.showTooltips = config.showTooltips;
            Chart.defaults.global.tooltips.enabled = config.showTooltips;
    
            // Acceleration Chart Attributes
            $scope.Acc_Labels = [];
            $scope.Acc_Series = ['X', 'Y', 'Z'];
            $scope.Acc_Data = [[], [], []];
            $scope.Acc_Options = {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: -40,
                            suggestedMax: 140
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Meters / Second ^ 2"
                        }
                    }]
                },
                title: {
                    display: true,
                    text: "Accelerometer",
                    fontSize: 16
                },
                legend: {
                    display: true,
                    position: 'right'
                },
                elements: {
                    line: {
                        fill: false
                    },
                    point: {
                        radius: 0
                    }
                }
            };

            // Gyroscope Chart Attributes
            $scope.Gyro_Labels = [];
            $scope.Gyro_Series = ['X', 'Y', 'Z'];
            $scope.Gyro_Data = [[], [], []];
            $scope.Gyro_Options = {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: -80,
                            suggestedMax: 80
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Degrees / Second"
                        }
                    }]
                },
                title: {
                    display: true,
                    text: "Gyroscope",
                    fontSize: 16
                },
                legend: {
                    display: true,
                    position: 'right'
                },
                elements: {
                    line: {
                        fill: false
                    },
                    point: {
                        radius: 0
                    }
                }
            };

            // Assigning new colors to the X,Y,Z lines of the Accelerometer/Gyroscope charts
            // because the default colors had a hard to see color for the Y.
            // TODO: Still needs to be set up with correct colors, current colors are just placeholders
            $scope.Acc_Gyro_Colors = [{
                backgroundColor: 'rgba(132, 20, 50, 0.8)',
                borderColor: 'rgba(132, 20, 50, 0.8)',
                highlightFill: 'rgba(132, 20, 50, 0.8)',
                highlightStroke: 'rgba(132, 20, 50, 0.8)',
                },
                {
                backgroundColor: 'rgba(50, 132, 20, 0.8)',
                borderColor: 'rgba(50, 132, 0, 20.8)',
                highlightFill: 'rgba(50, 132, 20, 0.8)',
                highlightStroke: 'rgba(50, 132, 20, 0.8)',
                },
                {
                backgroundColor: 'rgba(20, 50, 132, 0.8)',
                borderColor: 'rgba(20, 50, 132, 0.8)',
                highlightFill: 'rgba(20, 50, 132, 0.8)',
                highlightStroke: 'rgba(20, 50, 132, 0.8)',
                }
            ];

            // Setting up the Ellipsoid Altitude strip-chart
            // TODO: chart.js creates a curved line by default to connect data points.
            // With the altitude chart it can sometimes cause the graph to indicate that the rocket has
            // either gained or lost altitude when it did not. Need to find a way to disable this so
            // the chart is not misleading.
            $scope.Altitude_Data = [[]];    // I don't know why, but Data needs to be an array of arrays or else
                                            // the Color attribute won't work
            $scope.Altitude_Labels = [];
            $scope.Altitude_Series = ["Ellipsoid Altitude"];
            $scope.Altitude_Options = {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Meters"
                        }
                    }]
                },
                title: {
                    display: true,
                    text: "Altitude",
                    fontSize: 16
                },
                elements: {
                    line: {
                        fill: false
                    },
                    point: {
                        radius: 0
                    }
                }
            };

            // Setting up the Speed strip-chart
            $scope.Speed_Data = [[]];   // I don't know why, but Data needs to be an array of arrays or else
                                        // the Color attribute won't work
            $scope.Speed_Labels = [];
            $scope.Speed_Series = ["Speed"];
            $scope.Speed_Options = {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Meters / Second"
                        }
                    }]
                },
                title: {
                    display: true,
                    text: "Speed",
                    fontSize: 16
                },
                elements: {
                    line: {
                        fill: false
                    },
                    point: {
                        radius: 0
                    }
                }
            }

            // Setting up color for Altitude and Speed chart
            // Placeholder color
            $scope.Altitude_Speed_Colors = [{
                backgroundColor: 'rgba(80, 70, 60, 1)',
                borderColor: 'rgba(80, 70, 60, 1)',
                highlightFill: 'rgba(80, 70, 60, 1)',
                highlightStroke: 'rgba(80, 70, 60, 1)',
            },];

            // Set up Accelerometer and Gyroscope strip charts to track ADISNumDataPoints data points
            // by initializing the chart with ADISNumDataPoints data points with values of 0
            for(var i = 0; i < ADISNumDataPoints; ++i){
                $scope.Acc_Labels.push('');
                $scope.Acc_Data[0].push(0);
                $scope.Acc_Data[1].push(0);
                $scope.Acc_Data[2].push(0);
                $scope.Gyro_Labels.push('');
                $scope.Gyro_Data[0].push(0);
                $scope.Gyro_Data[1].push(0);
                $scope.Gyro_Data[2].push(0);
            }

            // Set up Ellipsoid Altitude and Speed strip charts to track V8A8NumDataPackets data points
            // by initializing the chart with V8A8NumDataPackets data points with values of 0.
            for(var i = 0; i < V8A8NumDataPoints; ++i){
                $scope.Altitude_Data[0].push(0);
                $scope.Altitude_Labels.push('');
                $scope.Speed_Data[0].push(0);
                $scope.Speed_Labels.push('');
            }

            // Create empty array of charts. Array needed to update the charts
            $scope.charts = [];
            // When a new chart gets created, add it to the array.
            $scope.$on('chart-create', function(evt, chart){
                $scope.charts.push(chart);
            });

        }],
        templateUrl: "directives/telemetryCharts.html"
    }
});
