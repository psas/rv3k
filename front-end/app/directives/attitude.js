/*
 * attitude.js will render a 3d model of a rocket and rotate it so that the model's rotation match the real rocket's rotation during a launch
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

'use strict';

angular.module("rvtk").directive("attitude", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', '$element', function attitudeController($scope, $element) {

            $scope.attitudeGraphic = "some string";
            var namespace = '/main';
            // this port connects to port broadcast by ../unified/app.py
            var socket = io.connect('http://' + document.domain + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});
            
            socket.on('telemetry', function(data) {
                for(var key in data) {
                    if(key == 'ADIS') {
                        //console.log(data[key]);
                        $scope.Gyro_X = data[key].Gyro_X;
                        $scope.Gyro_Y = data[key].Gyro_Y;
                        $scope.Gyro_Z = data[key].Gyro_Z;
                        $scope.Acc_X = data[key].Acc_X;
                        $scope.Acc_Y = data[key].Acc_Y;
                        $scope.Acc_Z = data[key].Acc_Z;
                        if($scope.TimeStamp) {
                            $scope.PreviousTimeStamp = $scope.TimeStamp;
                        } 
                        else {
                            $scope.PreviousTimeStamp = data[key].timestamp;
                        }

                        $scope.TimeStamp = data[key].timestamp;
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
                $scope.loader1.load(modelUrl, function(geometry) {
                    $scope.mesh = new THREE.Mesh(geometry);
                    $scope.scene.add($scope.mesh);
                });
            }

            // Set up the $scope.camera and $scope.renderer and attach them to html.
            // Start a listener for window resizing.
            $scope.init = function () {
                $scope.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
                $scope.camera.position.set(0, 0, 10);
                $scope.scene = new THREE.Scene();
                $scope.renderer = new THREE.WebGLRenderer({antialias: true});
                $scope.renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.5);     
                $element[0].appendChild($scope.renderer.domElement);
                //$scope.attitudeGraphic = $scope.renderer.domElement;
                //$scope.$apply();

            }

            $scope.init();

            $scope.loadModel("assets/rocket_model2.js");

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
                }, 1000/30); // run at 30fps
            }

            // Render will call it self 30 times a second to render the scene.
            $scope.render();
            // The socket.io function at the beginning of the file will continuously receive and the data packets
            // so no need for the loop() function.

        }],
        templateUrl: ''
    };
});
