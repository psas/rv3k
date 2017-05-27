/**
 * This file includes all the logic for the earth frame view. It works in conjuction with the earthFrameView.html page to render a 3D map that and objects on that map.
 *
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict'

angular.module("rvtk").directive("earthFrameView", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', function earthFrameViewController($scope) {
            // -----------------------------
            // all 3D map stuff
            // creates the 3D map viewer
            var viewer = new Cesium.Viewer('cesiumContainer', {
                // gets rid of a menu to pick map type
                baseLayerPicker : false,
                // hides clock, timeline bar, and home button
                timeline: false,
                animation: false,
                homeButton: false,
                terrainExaggeration : 2.0
            });

            // set lighting to true - makes it look more realistic
            viewer.scene.globe.enableLighting = true;

            viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask : true,
                requestVertexNormals : true
            });


            $scope.RocketPosition = Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328, 3000);

            // Make a dot for the rocket
            var rocket = viewer.entities.add({
                name : 'Rocket',
                position: $scope.RocketPosition,
                ellipsoid : {
                    radii : new Cesium.Cartesian3(300.0, 300.0, 300.0),
                    material : Cesium.Color.BLUE,
                    outline : false
                }

            });

            // Radius of recovery crew
            $scope.radius  = 3000.0;
            $scope.recoveryCrews = {};

            var addDotForRecoveryCrew = function(callsign, lat, longi) {
                var recoveryCrew = viewer.entities.add({
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
            

            // function to move recovery crew 1's longitude and latitude +1 degree
            $scope.movePoints = function(callsign, lat, longi) {
                $scope.recoveryCrews[callsign].position = Cesium.Cartesian3.fromDegrees(longi, lat);
            };

            // positions the camera so that all entities are in view
            viewer.zoomTo(viewer.entities);

            // Gets rid of a developer tools error and allows cesium to work
            viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

            // the array of longitude, latitude and altitude points sent in from the back-end
            var trajectoryPoints = [];

            // The point on the ground under the rocket
            var groundPos = Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328);
            // The projected trajectory of the rocket.
            var projTraj = viewer.entities.add({
                name : "Projected Trajectory",
                polyline : {
                    positions : [$scope.RocketPosition, groundPos],
                        width : 3,
                    material : Cesium.Color.WHITE
                }
            });

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
                var actualTrajectory = viewer.entities.add({
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
                        viewer.camera.lookAt($scope.RocketPosition, offset);
                        break;
                    case 'top':
                        viewer.zoomTo(viewer.entities);
                        break;
                }

            };

            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var telemetrySocket = io.connect('http://' + document.domain + ':8080' + namespace);
            telemetrySocket.on('connect', function() {});
            telemetrySocket.on('disconnect', function() {});

            telemetrySocket.on('telemetry', function(data) {
                for(var key in data) {
                    if(key == 'V8A8') {
                        //update anything that uses V8A8 data in cesium
                        $scope.RocketPosition = Cesium.Cartesian3.fromDegrees(data[key].Longitude, data[key].Latitude, data[key].MSL_Altitude);
                        $scope.moveRocket(data[key].Longitude, data[key].Latitude, data[key].MSL_Altitude);                    
                    }
                }

            });

            var aprsSocket = io.connect('http://' + document.domain + ':8080' + namespace);
            aprsSocket.on('connect', function() {});
            aprsSocket.on('disconnect', function() {});
    
            aprsSocket.on('recovery', function(data) {
                console.log(data);
                var callsign = data["Callsign"];
                var lat = data["Latitude"];
                var longi = data["Longitude"];

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
