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
        templateUrl: 'directives/attitude.html',
        link: function($scope, elem, attrs) {
            // Set up variables needed for the scene.
            var camera;
            var scene;
            var renderer;
            var mesh;
            var imuData = [];     // IMU data handling rotation.
            var time = [];	  // time stamps from the data packets
            $.ajax({
                type: "GET",
                url: "assets/ADIS.csv",
                dataType: "text",
                success: function(data) {
                    process(data);
		    allThis();
                }
            });

            // Helper function to convert degrees into radians
            Math.radians = function(degrees){
                return degrees * Math.PI / 180;
            }

            // Get IMU data out of ADIS.csv.
            function process(text){
                var lines = text.split("\n");
                for(var i = 1; i < lines.length-1; i++) {
                    var data = lines[i].split(",");
                    // Gyro data is in 4th-6th elements, Accelerometer is in 7th-9th elements
                    imuData.push([parseFloat(data[3]), parseFloat(data[4]), parseFloat(data[5]),
                                  parseFloat(data[6]), parseFloat(data[7]), parseFloat(data[8])]);
                    // Timestamp data is in 2nd element
                    time.push([parseFloat(data[1])]);
                }
		//console.log(imuData[0]);
            }

	    // For some reason the imuData variable seems to fall out of scope and become undefined after the
	    // call to process(). I don't know why this behaves this way, but having the rest of the code execute
	    // within a function that is called in the $.ajax(... section fixes this scoping issue.
            function allThis(){
                init();
                var loader1 = new THREE.JSONLoader();

                // Load the rocket model into the mesh variable.
                // The inner function is not called until loader1.load completes.
                function loadModel(modelUrl) {
                    loader1.load(modelUrl, function(geometry) {
                        mesh = new THREE.Mesh(geometry);
		        scene.add(mesh);
                    });
                }

                loadModel("assets/rocket_model2.js");

                // Set up the camera and renderer and attach them to html.
                // Start a listener for window resizing.
                function init() {
                    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
                    camera.position.set(0, 0, 10);
                    scene = new THREE.Scene();
                    renderer = new THREE.WebGLRenderer({antialias: true});
                    // This is where the size of the Attitude window is determined
                    // setSize(int, int, optional boolean); Previously set to window.innerWidth / 3, window.innerHeight / 2
                    renderer.setSize(300, 400);
                    elem[0].appendChild(renderer.domElement);

                    //window.addEventListener('resize', onWindowResize, false);
                }

                // TODO: According to Matt this may not be necessary. Consider removing this in the future
                // Resize the renderer when the window resizes.
                function onWindowResize(event) {
                    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
                }

                var i = 0;			// index for line number in the csv data file
                var n = 0;			// just a loop variable for testing, won't be needed when testing is done
                var dt = 0.0012;		// change in time between data packets
                var loopDelay = dt * Math.pow(10, 3);	// loop delays needs to be in milliseconds
                var firstData = true;		// track whether this is the first data packet we have received
						// for purposes of not using an invalid dt value on first calculation
                // Target rotation values for the rocket model
                var targetRotX = 0;
                var targetRotY = 0;
                var targetRotZ = 0;

		// The function that rotates the model expects a difference in angles to rotate by.
		// So keep track of previous rotation in order to calculate the difference
	        var prevRotX = targetRotX;
	        var prevRotY = targetRotY;
	        var prevRotZ = targetRotZ;

                // Render the scene, and change the rocket's attitude at 30fps
                // Gets called recursively with the requestAnimationFrame function call
                function render() {
                    setTimeout(function() {	// setTimeout used to run at 30 fps
                        requestAnimationFrame(render);

			// Calculate difference in rotations
		        var diffX = targetRotX - prevRotX;
		        var diffY = targetRotY - prevRotY;
		        var diffZ = targetRotZ - prevRotZ;

			// Update previous rotation
		        prevRotX = targetRotX;
		        prevRotY = targetRotY;
		        prevRotZ = targetRotZ;

			// Rotate the model
			mesh.rotateX(diffX);
			mesh.rotateY(diffY);
			mesh.rotateZ(diffZ);

			// Three.js function call to render the scene
                        renderer.render(scene, camera);
                    }, 1000/30);	// run at 30fps
                }

                // This function will process a data packet and update the three targetRot variables
		// Uses a complementary filter between the gyro and accelerometer data to ensure accuracy
		// and avoid drift errors.
                function calculateData(){
		    // Grab current line of IMU data
                    var x = imuData[i];

		    // Variables for calculating the pitch and yaw of the rocket from the accelerometer data
                    var accPitch = 0;
                    var accYaw = 0;

		    // Gyroscope data is in degrees/second. Need to convert to radians.
		    // Data is an angular displacement instead of an absolute angle, so data is
		    // added to target rotation instead of assigning the rotation.
		    // For some reason it appears that the y axis values are actually in the x axis column
		    // so I am switching them here.
		    // TODO: Currently do not know if x is really x axis or z axis because of the y values
		    // being in the x column. Need to investigate further. Currently looks fine
                    targetRotX += Math.radians(x[1]) * dt;
                    targetRotY += Math.radians(x[0]) * dt;
                    targetRotZ += Math.radians(x[2]) * dt;

		    // Uses data from the accelerometer to obtain a pitch and yaw angle. Note that accelerometer
		    // cannot track roll, so only calculating the pitch and yaw.
                    accPitch = Math.atan2(x[5], x[3]);
                    accYaw = Math.atan2(x[4], x[3]);


		    var accMagn = Math.pow(x[3], 2) + Math.pow(x[4], 2) + Math.pow(x[5], 2);

		    // Combine the gyroscope data with the accelerometer data to ensure that the orientation is both
		    // accurate and free of any drift errors that are present with using gyroscopes.
		    // TODO: currently only correcting drift in the pitch and yaw axises and not the roll axis.
		    // This would get fixed by using magnometer data, however, initial search into these calculations
		    // seems exceedingly complex and I am not if it is worth the effort.

		    // A check to factor in the accelerometer data when only within a certain range. If the data is too large
		    // or too small it is not reliable since accelerometers are susceptible to outside forces which
		    // disturbs the data.
		    if(accMagn > 8000 && accMagn < 32000){
                        targetRotX = (0.98 * targetRotX) + (0.02 * accPitch);
                        targetRotZ = (0.98 * targetRotZ) + (0.02 * accYaw);
		    }
                }

	        // Function which is used to loop through the line of data in the ADIS.csv file (the contents of which
                // are now currently in imuData with i being the current index for what line we are currently on).
                // This function was added so that this program can go through data packets at the rate that the packets
	        // came in at, so that its rate is independant of how often the model is being rendered.
	        // TODO: This function will need to be changed in the future to receive data packets from the server instead
	        // of looping through a file. Also should get rid of the recursive function call as well to avoid stack overflow.
                function loop(){
                    setTimeout(function(){
			// Process a line of data
                        calculateData();

			// If it is the beginning of the log, set model's orientation to 0.
                        if(firstData == true){
			    // TODO: This check should be used to initialize the target rotation with accelerometer data.
                            firstData = false;
                        }
			// If it isn't the beginning of the log, calculate new dt
                        else{
                            dt = time[i] - time[i - 1];
                            dt = dt * Math.pow(10, -9); // need to convert nanoseconds to seconds
                        }

			// Increment the file index variable
                        i += 1;

                        if(i == imuData.length - 1){ // in order to loop when at the end of the ADIS.csv file
                            i = 0;
                            firstData = true;
                        }

                        loopDelay = dt * Math.pow(10, 3); // convert seconds to milliseconds since delay time is in milliseconds
                        loop();
                    }, loopDelay);	// loopDelay is calculated by the time between current data packet and last data packet.
	   				// This is done to try to simulate the rate at which the data packets came in during the live launch
                }

		// Call loop and render to process the data and render the scene
                loop();
                render();
	    }
        }
    };
});
