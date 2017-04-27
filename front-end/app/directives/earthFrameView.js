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

            var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/world',
                requestWaterMask : true,
                requestVertexNormals : true
            });
            viewer.terrainProvider = cesiumTerrainProviderMeshes;

            //makes the map more 3D with terrain
            viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/world'
            });

            //Make a dot for the rocket
            var rocket = viewer.entities.add({
                name : 'Rocket',
                position: Cesium.Cartesian3.fromDegrees(-120.6517673, 43.7961328, 30000.0),
                ellipsoid : {
                    radii : new Cesium.Cartesian3(3000.0, 3000.0, 3000.0),
                    material : Cesium.Color.RED,
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
                position: Cesium.Cartesian3.fromDegrees(long1, lat1),
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
                position: Cesium.Cartesian3.fromDegrees(long2, lat2),
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
                recoveryCrew1.position = Cesium.Cartesian3.fromDegrees(long1++, lat1++);
                console.log("buttonclicked");
            };

            //move the camera to where rocket is
            viewer.zoomTo(rocket);

            //Gets rid of a developer tools error and allows cesium to work
            viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

        }],
        templateUrl: 'directives/earthFrameView.html'
    }
});