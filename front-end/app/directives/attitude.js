/*
 * attitude.js renders a 3d model of a rocket and rotates it so that the model's rotation matches the real rocket's rotation during a launch
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

"use strict";

app.directive("attitude", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', '$element', 'config', function attitudeController($scope, $element, config) {

            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var socket = io.connect('http://' + config.serverSource + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});

            socket.on('telemetry', function(data) {
                for(var key in data) {
                    if(key == config.ADIS) {
                        $scope.Gyro_X = data[key][config.Gyro_X];
                        $scope.Gyro_Y = data[key][config.Gyro_Y];
                        $scope.Gyro_Z = data[key][config.Gyro_Z];
                        $scope.Acc_X = data[key][config.Acc_X];
                        $scope.Acc_Y = data[key][config.Acc_Y];
                        $scope.Acc_Z = data[key][config.Acc_Z];

                        // If TimeStamp has not been initialized we set previous to current,
                        // deltaTime will be 0 for very first calculateData call.
                        if($scope.TimeStamp) {
                            $scope.PreviousTimeStamp = $scope.TimeStamp;
                        }
                        else {
                            $scope.PreviousTimeStamp = data[key][config.timestamp];
                        }

                        $scope.TimeStamp = data[key][config.timestamp];
                        $scope.calculateData();
                    }
                }
            });

            // Helper function to convert degrees into radians
            Math.radians = function(degrees){
                return degrees * Math.PI / 180;
            }

            $scope.loader1 = new THREE.JSONLoader();

            // Load the rocket model into the $scope.mesh variable.
            // The inner function is not called until loader1.load completes.
            $scope.loadModel = function (modelUrl) {
                $scope.loader1.load(modelUrl, function(geometry, materials) {
                    $scope.material = new THREE.MeshFaceMaterial(materials);
                    $scope.mesh = new THREE.Mesh(geometry, $scope.material);
                    $scope.mesh.position.y += 5;
                    $scope.scene.add($scope.mesh);

                    // need to update camera's rotation here since the lookAt target only exists once
                    // the rocket mesh has been created
                    $scope.camera.lookAt($scope.mesh.position);
                    // point the camera up a little bit, otherwise the camera looks too far down on the rocket
                    $scope.camera.rotateX(0.16);
                });
            }

            // Set up the $scope.camera and $scope.renderer and attach them to html.
            // Start a listener for window resizing.
            $scope.init = function () {
                $scope.canvas = document.getElementById('attitude-canvas');

                // create scene and scene size
                $scope.scene = new THREE.Scene();

                // create the renderer and add it to the DOM
                $scope.renderer = new THREE.WebGLRenderer({canvas: $scope.canvas, antialias: true, alpha: true});
                $scope.canvas.width = $scope.canvas.clientWidth;
                $scope.canvas.height = $scope.canvas.clientHeight*5;
                $scope.renderer.setViewport(0,0,$scope.canvas.width, $scope.canvas.height);
                // $element[0].appendChild($scope.renderer.domElement);

                // create the camera with FOV, aspect ratio, distance from scene, clipping distance
                $scope.camera = new THREE.PerspectiveCamera(config.FOV, $scope.canvas.width / $scope.canvas.height, .1, 2000);
                $scope.camera.position.set(-14, 10, 22); // pos x,y,z
                $scope.scene.add($scope.camera);

                // set the background color of the scene
                $scope.renderer.setClearColor(new THREE.Color(0xffffff, 1));

                // set up light for the scene
                $scope.light = new THREE.DirectionalLight(0xffffff, 1);
                $scope.light.position.set(10, 50, 100);
                $scope.scene.add($scope.light);

                //$scope.attitudeGraphic = $scope.renderer.domElement;
                //$scope.$apply();
            }

            $scope.resize = function () {
                if ($scope.canvas.width != $scope.canvas.clientWidth || $scope.canvas.height != $scope.canvas.clientHeight) {
                    $scope.canvas.width = $scope.canvas.clientWidth;
                    $scope.canvas.height = $scope.canvas.clientHeight;
                    $scope.renderer.setViewport(0,0,$scope.canvas.width, $scope.canvas.height);
                    $scope.camera.aspect = $scope.canvas.width / $scope.canvas.height;
                    $scope.camera.updateProjectionMatrix();
                }
            }

            // Function which initializes the background. Adds a red and green line for the axises and sets the background to
            // a neutral color
            $scope.bgInit = function(){
                // Adds red line along the x axis
                var lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(new THREE.Vector3(-800, 0, 0), new THREE.Vector3(800, 0, 0));
                lineGeometry.computeLineDistances();
                var lineMaterial = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 2});
                var line = new THREE.Line(lineGeometry, lineMaterial);
                $scope.scene.add(line);

                // Adds green line along the z axis
                var lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(new THREE.Vector3(0, 0, -800), new THREE.Vector3(0, 0, 800));
                lineGeometry.computeLineDistances();
                var lineMaterial = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 2});
                var line = new THREE.Line(lineGeometry, lineMaterial);
                $scope.scene.add(line);

                // Set background color to a nice neutral color with an opacity of 1
                $scope.renderer.setClearColor(0x355565, 1);
            }

            // This function will process a data packet and update the three $scope.targetRot variables
            // Uses a complementary filter between the gyro and accelerometer data to ensure accuracy
            // and avoid drift errors.
            $scope.calculateData = function (){
                // Variables for calculating the pitch and yaw of the rocket from the accelerometer data
                $scope.accPitch = 0;
                $scope.accYaw = 0;

                //$scope.deltaTime = $scope.time[i] - scope.time[i - 1];
                $scope.deltaTime = $scope.TimeStamp - $scope.PreviousTimeStamp;
                $scope.deltaTime = $scope.deltaTime * Math.pow(10, -9); // need to convert nanoseconds to seconds

                // Gyroscope data is in degrees/second. Need to convert to radians.
                // Data is an angular displacement instead of an absolute angle, so data is
                // added to target rotation instead of assigning the rotation.
                // For some reason it appears that the y axis values are actually in the x axis column
                // so I am switching them here.
                // TODO: Currently do not know if x is really x axis or z axis because of the y values
                // being in the x column. Need to investigate further. Currently looks fine
                //targetRotX += Math.radians(x[1]) * dt;
                $scope.targetRotX += Math.radians($scope.Gyro_Y) * $scope.deltaTime;
                //targetRotY += Math.radians(x[0]) * dt;
                $scope.targetRotY += Math.radians($scope.Gyro_X) * $scope.deltaTime;
                //targetRotZ += Math.radians(x[2]) * dt;
                $scope.targetRotZ += Math.radians($scope.Gyro_Z) * $scope.deltaTime;

                // Uses data from the accelerometer to obtain a pitch and yaw angle. Note that accelerometer
                // cannot track roll, so only calculating the pitch and yaw.
                //$scope.accPitch = Math.atan2(x[5], x[3]);
                $scope.accPitch = Math.atan2($scope.Acc_Z, $scope.Acc_X);
                //$scope.accYaw = Math.atan2(x[4], x[3]);
                $scope.accYaw = Math.atan2($scope.Acc_Y, $scope.Acc_X);


                //var $scope.accMagn = Math.pow(x[3], 2) + Math.pow(x[4], 2) + Math.pow(x[5], 2);
                $scope.accMagn = Math.pow($scope.Acc_X, 2) + Math.pow($scope.Acc_Y, 2) + Math.pow($scope.Acc_Z, 2);

                // Combine the gyroscope data with the accelerometer data to ensure that the orientation is both
                // accurate and free of any drift errors that are present with using gyroscopes.
                // TODO: currently only correcting drift in the pitch and yaw axises and not the roll axis.
                // This would get fixed by using magnometer data, however, initial search into these calculations
                // seems exceedingly complex and I am not if it is worth the effort.

                // A check to factor in the accelerometer data when only within a certain range. If the data is too large
                // or too small it is not reliable since accelerometers are susceptible to outside forces which
                // disturbs the data.
                if($scope.accMagn > 8000 && $scope.accMagn < 32000){
                    $scope.targetRotX = (0.98 * $scope.targetRotX) + (0.02 * $scope.accPitch);
                    $scope.targetRotZ = (0.98 * $scope.targetRotZ) + (0.02 * $scope.accYaw);
                }
            }

            $scope.deltaTime = 0.0012;	// change in time between data packets
            // Target rotation values for the rocket model
            $scope.targetRotX = 0;
            $scope.targetRotY = 0;
            $scope.targetRotZ = 0;

            // The function that rotates the model expects a difference in angles to rotate by.
            // So keep track of previous rotation in order to calculate the difference
            $scope.prevRotX = $scope.targetRotX;
            $scope.prevRotY = $scope.targetRotY;
            $scope.prevRotZ = $scope.targetRotZ;

            // Render the scene, and change the rocket's attitude at 30fps
            // Gets called recursively with the requestAnimationFrame function call
            $scope.render = function () {
                setTimeout(function() { // setTimeout used to run at 30 fps
                    requestAnimationFrame($scope.render);

                    // Calculate difference in rotations
                    $scope.diffX = $scope.targetRotX - $scope.prevRotX;
                    $scope.diffY = $scope.targetRotY - $scope.prevRotY;
                    $scope.diffZ = $scope.targetRotZ - $scope.prevRotZ;

                    // Update previous rotation
                    $scope.prevRotX = $scope.targetRotX;
                    $scope.prevRotY = $scope.targetRotY;
                    $scope.prevRotZ = $scope.targetRotZ;

                    // Rotate the model
                    $scope.mesh.rotateX($scope.diffX);
                    $scope.mesh.rotateY($scope.diffY);
                    $scope.mesh.rotateZ($scope.diffZ);

                    // Three.js function call to render the scene
                    $scope.renderer.render($scope.scene, $scope.camera);
                    $scope.resize();
                }, 1000/30); // run at 30fps
            }

            // Create the scene
            $scope.init();
            // Create the background
            $scope.bgInit();
            // Create the rocket model
            $scope.loadModel("assets/rocket_final_obj.js");
            // Render will call it self 30 times a second to render the scene and update the rocket's rotation
            $scope.render();
        }],
        templateUrl: ''
    };
});
