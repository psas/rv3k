/**
 * earthFrameView.js includes all the logic for the earth frame view. It works in conjuction with the earthFrameView.html page to render a 3D map that and objects on that map.
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

"use strict"

app.directive("earthFrameView", function() {
    return {
        restrict: "E",
        scope: {},
        controller: ['$scope', 'config', function earthFrameViewController($scope, config) {

            // Radius of recovery crew
            $scope.radius = config.recoveryCrewSize;
            $scope.recoveryCrews = {};

            // the array of longitude, latitude and altitude points sent in from the back-end
            var trajectoryPoints = [];

            // The point on the ground under the rocket
            var groundPos = Cesium.Cartesian3.fromDegrees(config.launchLocation.longitude, config.launchLocation.latitude);

            // var terrainProvider = new Cesium.CesiumTerrainProvider({
            //     url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
            //     requestWaterMask : true,
            //     requestVertexNormals : true
            // });

            // var imageryProvider = Cesium.createTileMapServiceImageryProvider({
            //    url : '/bower_components/cesium.js/dist/Assets/Textures/NaturalEarthII',
            //    fileExtension : 'jpg'
            // });

            // Initializes the Cesium Viewer, positions the camera, and adds entities
            $scope.init = function () {
                // Create the viewer
                $scope.viewer = new Cesium.Viewer('cesiumContainer', {
                    // imageryProvider: imageryProvider,    // Activate imagery overlay
                    // terrainProvider: terrainProvider,    // Activate terrain
                    baseLayerPicker: false,     // disables menu to choose map type
                    homeButton: false,          // disables home button
                    timeline: false,            // disables timeline
                    animation: false,           // disables clock
                    fullscreenButton: false,    // fullscreen doesn't work correctly
                    geocoder: false,            // disables landmark detection
                    selectionIndicator: false,  // disables indicator on selected object
                    sceneModePicker: false      // disables default scene picker
                });

                // Activate directional lighting for terrain (globe will be dark at night)
                // $scope.viewer.scene.globe.enableLighting = true;

                // Set Initial Rocket Position
                $scope.RocketPosition = Cesium.Cartesian3.fromDegrees(config.launchLocation.longitude, config.launchLocation.latitude, config.launchLocation.height);

                // Make a dot for the rocket
                var rocket = $scope.viewer.entities.add({
                    name : 'Rocket',
                    position: $scope.RocketPosition,
                    model : {
                        uri : 'assets/rocket.gltf',
                        color : Cesium.Color.BLUE,
                        minimumPixelSize : config.rocketSize,
                        maximumScale : 1000,
                        colorBlendAmount : 1.0
                    }
                });
                $scope.viewer.trackedEntity = rocket;

                // Positions the camera so that all entities are in view
                $scope.viewer.zoomTo($scope.viewer.entities);

                // Position the camera gradually with flyTo
                // $scope.viewer.camera.flyTo({
                //     destination: new Cesium.Cartesian3.fromDegrees(config.launchLocation.longitude, config.launchLocation.latitude, 1500)
                // });

                // Gets rid of a developer tools error and allows cesium to work
                $scope.viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

                // The projected trajectory of the rocket.
                var projTraj = $scope.viewer.entities.add({
                    name : "Projected Trajectory",
                    polyline : {
                        positions : [$scope.RocketPosition, groundPos],
                            width : 3,
                        material : Cesium.Color.WHITE
                    }
                });
            };

            // Adds Recovery Crew Dots to globe
            var addDotForRecoveryCrew = function(callsign, lat, longi) {
                var recoveryCrew = $scope.viewer.entities.add({
                    name : callsign,
                    position: Cesium.Cartesian3.fromDegrees(longi, lat),
                    point : {
                        pixelSize : 25,
                        color : Cesium.Color.GREEN,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2
                    },
                    label : {
                        text : callsign,
                        font : '14pt monospace',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(0, -9)
                    }
                });
                $scope.recoveryCrews[callsign] = recoveryCrew;
            }

            // Move recovery crew
            $scope.movePoints = function(callsign, lat, longi) {
                $scope.recoveryCrews[callsign].position = Cesium.Cartesian3.fromDegrees(longi, lat);
            };

            // helper function, used to update the rockets position
            $scope.moveRocket = function(x, y, z) {
                // Update the start positions of the projected trajectory line
                groundPos = Cesium.Cartesian3.fromDegrees(x, y);
                // add a new point to the list of points for the line that creates the actual trajectory
                trajectoryPoints = trajectoryPoints.concat([x, y, z]);
                // store the new position in a variable
                //$scope.RocketPosition = Cesium.Cartesian3.fromDegrees(x, y, z);
                // move the rocket to new position
                rocket.position = $scope.RocketPosition;
                // Declare the trajectory line
                var actualTrajectory = $scope.viewer.entities.add({
                        name : 'Actual Trajectory',
                        polyline : {
                            positions : Cesium.Cartesian3.fromDegreesArrayHeights(trajectoryPoints),
                            width : 5,
                            material : new Cesium.PolylineOutlineMaterialProperty({
                                color : Cesium.Color.RED, // make the line red
                            })
                        }
                });
                var rocketPos = Cesium.Cartesian3.fromDegrees(x, y, z);
                projTraj.polyline.positions = [rocketPos, groundPos];
                //only adds the newest point to the map to avoid overflow
                if(trajectoryPoints.length == 2) {
                    trajectoryPoints.split(1, 1);
                }
            }

            // Changes the camera location and tilt when a new item is selected in the efv
            // camera drop down menu
            $scope.changeCameraView = function() {
                var viewKey = $scope.selected;
                switch(viewKey) {
                    case 'side':
                        var offset = new Cesium.Cartesian3(70642.66030209465, -31661.517948317807, 35505.179997143336);
                        $scope.viewer.camera.lookAt($scope.RocketPosition, offset);
                        break;
                    case 'top':
                        $scope.viewer.zoomTo($scope.viewer.entities);
                        break;
                }
            };

            // Initialize Cesium
            $scope.init();

            // Reset Cesium Viewer
            $scope.reset = function () {
                $scope.viewer.destroy();
                console.log("Cesium Reset");
                if ($scope.viewer.isDestroyed()) {
                    $scope.init();
                }
            }

            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var telemetrySocket = io.connect('http://' + document.domain + ':8080' + namespace);
            telemetrySocket.on('connect', function() {});
            telemetrySocket.on('disconnect', function() {});

            telemetrySocket.on('telemetry', function(data) {
                for(var key in data) {
                    if(key == config.V8A8) {
                        //update anything that uses V8A8 data in cesium
                        $scope.RocketPosition = Cesium.Cartesian3.fromDegrees(data[key].Longitude, data[key].Latitude, data[key].MSL_Altitude);
                        $scope.moveRocket(data[key].Longitude, data[key].Latitude, data[key].MSL_Altitude);
                    }
                }
            });

            var aprsSocket = io.connect('http://' + document.domain + ':8081' + namespace);
            aprsSocket.on('connect', function() {});
            aprsSocket.on('disconnect', function() {});

            aprsSocket.on('recovery', function(data) {
                console.log(data);
                var callsign = data["callsign"];
                var lat = data["latitude"];
                var longi = data["longitude"];

                if(!$scope.recoveryCrews.hasOwnProperty(callsign)) {
                    addDotForRecoveryCrew(callsign, lat, longi);
                } else {
                    $scope.movePoints(callsign, lat, longi);
                }
            });

        }],
        templateUrl: 'directives/earthFrameView.html'
    }
});
