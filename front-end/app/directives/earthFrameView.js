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
                homeButton: false
            });

            // set lighting to true - makes it look more realistic 
            viewer.scene.globe.enableLighting = true;

            var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask : true,
                requestVertexNormals : true
            });
    
            //makes the map more 3D with terrain
            viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/world'
            });

            $scope.oldPosition = Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328, 30000.0);

            //Make a dot for the rocket
            var rocket = viewer.entities.add({
                name : 'Rocket',
                position: $scope.oldPosition,
                ellipsoid : {
                    radii : new Cesium.Cartesian3(300.0, 300.0, 300.0),
                    material : Cesium.Color.BLUE,
                    outline : false
                }

            });


            //move the camera to where rocket is
            viewer.zoomTo(rocket);

            //Gets rid of a developer tools error and allows cesium to work
            viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";
            
            //the array of longitude, latitude and altitude points sent in from the back-end
            var trajectoryPoints = [];


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
                $scope.$apply();
            }


            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var socket = io.connect('http://' + document.domain + ':8080' + namespace);
            console.log(socket);
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
