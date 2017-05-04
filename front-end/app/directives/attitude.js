/*
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen
 * Michael Ohl, Mathew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict';

angular.module("rvtk").directive("attitude", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', '$element', function earthFrameViewController($scope, $element) {

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
                            $scope.PreviousTimeStamp = $scope.TimeStamp;
                        }
                        $scope.TimeStamp = data[key].recv;
                        //$scope.allThis();
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
                //

                //window.addEventListener('resize', onWindowResize, false);
            }

            $scope.init();

            $scope.loadModel("assets/rocket_model2.js");

            // For some reason the imuData variable seems to fall out of scope and become undefined after the
            // call to process(). I don't know why this behaves this way, but having the rest of the code execute
            // within a function that is called in the $.ajax(... section fixes this scoping issue.
            /*
            $scope.allThis = function (){

                // TODO: According to Matt this may not be necessary. Consider removing this in the future
                // Resize the $scope.renderer when the window resizes.
                function onWindowResize(event) {
                    $scope.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
                }

                $scope.dt = 0.0012;		// change in time between data packets
                $scope.loopDelay = dt * Math.pow(10, 3);	// loop delays needs to be in milliseconds
                var firstData = true;		// track whether this is the first data packet we have received
						// for purposes of not using an invalid dt value on first calculation
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
                    setTimeout(function() {	// setTimeout used to run at 30 fps
                        requestAnimationFrame(render);
		    
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
                    }, 1000/30);	// run at 30fps
                }

                // This function will process a data packet and update the three$scope.targetRot variables
                // Uses a complementary filter between the gyro and accelerometer data to ensure accuracy
                // and avoid drift errors.
                $scope.calculateData = function (){
                    // Grab current line of IMU data
                    //var x = imuData[i];

                    // Variables for calculating the pitch and yaw of the rocket from the accelerometer data
                    $scope.accPitch = 0;
                    $scope.accYaw = 0;
                
                    //$scope.dt = $scope.time[i] - scope.time[i - 1];
                    $scope.dt = $scope.PreviousTimeStamp - $scope.TimeStamp;
                    $scope.dt = $scope.dt * Math.pow(10, -9); // need to convert nanoseconds to seconds


                    // Gyroscope data is in degrees/second. Need to convert to radians.
                    // Data is an angular displacement instead of an absolute angle, so data is
                    // added to target rotation instead of assigning the rotation.
                    // For some reason it appears that the y axis values are actually in the x axis column
                    // so I am switching them here. 
                    // TODO: Currently do not know if x is really x axis or z axis because of the y values
                    // being in the x column. Need to investigate further. Currently looks fine 
                    //targetRotX += Math.radians(x[1]) * dt;
                   $scope.targetRotX += Math.radians($scope.Gyro_Y);
                    //targetRotY += Math.radians(x[0]) * dt;
                   $scope.targetRotY += Math.radians($scope.Gyro_X) * dt;
                    //targetRotZ += Math.radians(x[2]) * dt;
                   $scope.targetRotZ += Math.radians($scope.Gyro_Z) * dt;

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
            
	            // Function which is used to loop through the line of data in the ADIS.csv file (the contents of which
                // are now currently in imuData with i being the current index for what line we are currently on).
                // This function was added so that this program can go through data packets at the rate that the packets
	            // came in at, so that its rate is independant of how often the model is being rendered.
	            // TODO: This function will need to be changed in the future to receive data packets from the server instead
	            // of looping through a file. Also should get rid of the recursive function call as well to avoid stack overflow.
                /*
                function loop(){
                    setTimeout(function(){
			            // Process a line of data
                        $scope.calculateData();
			
			            // If it is the beginning of the log, set model's orientation to 0.
                        if(firstData == true){
			                // TODO: This check should be used to initialize the target rotation with accelerometer data.
                            firstData = false;
                        }
			            // If it isn't the beginning of the log, calculate new dt
                        else{
                        }

			            // Increment the file index variable
                        i += 1;

                        if(i == imuData.length - 1){ // in order to loop when at the end of the ADIS.csv file
                            i = 0;
                            firstData = true;
                        }

                        $scope.loopDelay = dt * Math.pow(10, 3); // convert seconds to milliseconds since delay time is in milliseconds
                        loop();
                    }, $scope.loopDelay);	// loopDelay is calculated by the time between current data packet and last data packet.
	   				// This is done to try to simulate the rate at which the data packets came in during the live launch
                }

		        // Call loop and render to process the data and render the scene
                //loop();
                render();

	    }
        */
        }],
        templateUrl: ''
    };
});
