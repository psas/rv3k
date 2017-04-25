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

            //move the camera to where rocket is
            viewer.zoomTo(rocket);

            //Gets rid of a developer tools error and allows cesium to work
            viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

        }],
        templateUrl: 'directives/earthFrameView.html'
    }
});
