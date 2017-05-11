/**
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
            //creates the 3D map viewer
            var viewer = new Cesium.Viewer('cesiumContainer', {
                //choose a more true to earth map
                imageryProvider : new Cesium.TileMapServiceImageryProvider({
                    url : '//cesiumjs.org/tilesets/imagery/naturalearthii'
                }),
                //gets rid of a menu to pick map type
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

            //Make a dot for the rocket
            var rocket = viewer.entities.add({
                name : 'Rocket',
                position: Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328, 30000.0),
                ellipsoid : {
                    radii : new Cesium.Cartesian3(300.0, 300.0, 300.0),
                    material : Cesium.Color.BLUE,
                    outline : false
                }

            });

            //Variables for recovery crew location
            $scope.long1   = -121.0232;
            $scope.lat1    = 44.23123;
            $scope.long2   = -121.54221;
            $scope.lat2    = 43.39004;

            //Radius of recovery crew
            $scope.radius  = 3000.0

            //Make a dot for recovery crew 1
            var recoveryCrew1 = viewer.entities.add({
                name : 'Crew1',
                position: Cesium.Cartesian3.fromDegrees($scope.long1, $scope.lat1),
                point : {
                    pixelSize : 5,
                    color : Cesium.Color.GREEN,
                    outlineColor : Cesium.Color.WHITE,
                    outlineWidth : 2
                },
                label : {
                    text : 'Crew 1',
                    font : '14pt monospace',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth : 2,
                    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset : new Cesium.Cartesian2(0, -9)
                }
            });

            //Make a dot for recovery crew 2
            var recoveryCrew2 = viewer.entities.add({
                name : 'Crew2',
                position: Cesium.Cartesian3.fromDegrees($scope.long2, $scope.lat2),
                point : {
                    pixelSize : 5,
                    color : Cesium.Color.BLUE,
                    outlineColor : Cesium.Color.WHITE,
                    outlineWidth : 2
                },
                label : {
                    text : 'Crew 2',
                    font : '14pt monospace',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth : 2,
                    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset : new Cesium.Cartesian2(0, -9)
                }
            });

            //function to move recovery crew 1's longitude and latitude +1 degree
            $scope.movePoints = function() {
                recoveryCrew1.position = Cesium.Cartesian3.fromDegrees(++$scope.long1, ++$scope.lat1);
            };

            //move the camera to where rocket is
            viewer.zoomTo(rocket);

            //Gets rid of a developer tools error and allows cesium to work
            viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

            //the array of longitude, latitude and altitude points sent in from the back-end
            var trajectoryPoints = [];

	    //The point on the ground under the rocket
	    var groundPos = Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328);
	    var rocketPos = Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328, 30000);
	    //The projected trajectory of the rocket.
	    //TODO: It should be possible to just use rocket.position instead of a whole separate variable
	    //rocketPos for the first point in this line. For some reason it is giving me compiler errors though.
	    var projTraj = viewer.entities.add({
	        name : "Projected Trajectory",
		polyline : {
		    positions : [rocketPos, groundPos],
		    	width : 3,
			material : Cesium.Color.WHITE
		}
	    });

            //helper function, used to update the rockets position
            $scope.moveRocket = function(x, y, z) {
                //add a new point to the list of points for the line that creates the actual trajectory
                trajectoryPoints = trajectoryPoints.concat([x, y, z]);
                //store the new position in a variable
                $scope.position = Cesium.Cartesian3.fromDegrees(x, y, z);
                //move the rocket to new position
                rocket.position = $scope.position;
                //create a point for each sample we generate.
                viewer.entities.add({
                    position : $scope.position,
                    point : {
                        pixelSize : 8,
                        color : Cesium.Color.TRANSPARENT,
                        outlineColor : Cesium.Color.YELLOW,
                        outlineWidth : 3
                    }
                });
                //Declare the trajectory line
                var actualTrajectory = viewer.entities.add({
                        name : 'Actual Trajectory',
                        polyline : {
                            positions : Cesium.Cartesian3.fromDegreesArrayHeights(trajectoryPoints),
                            width : 5,
                            material : new Cesium.PolylineOutlineMaterialProperty({
                                color : Cesium.Color.RED, //make the line red
                            })
                        }
                });
                viewer.zoomTo(viewer.entities);

		//Update the start and end positions of the projected trajectory line
		rocketPos = Cesium.Cartesian3.fromDegrees(x, y, z);
		groundPos = Cesium.Cartesian3.fromDegrees(x, y);
		projTraj.polyline.positions = [rocketPos, groundPos];

                if(trajectoryPoints.length == 2) {
                    trajectoryPoints.split(1, 1);
                }

            }


            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var socket = io.connect('http://' + document.domain + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});

            socket.on('telemetry', function(data) {
                for(var key in data) {
                    if(key == 'V8A8') {
                        //update anything that uses V8A8 data in cesium
                        $scope.moveRocket(data[key].Longitude, data[key].Latitude, data[key].MSL_Altitude);                    }
                }

            });


        }],
        templateUrl: 'directives/earthFrameView.html'
    }
});
