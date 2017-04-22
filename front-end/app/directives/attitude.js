'use strict';

angular.module("rvtk").directive("attitude", function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '', 
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
                url: "assets/ADIS.csv", // TODO: Real data. 
                dataType: "text",
                success: function(data) {
                    process(data);
		    allThis();
                }
            });

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
		console.log(imuData[0]);
            }

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
            //animate();

            // Set up the camera and renderer and attach them to html.
            // Start a listener for window resizing.
            function init() {
                camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
                camera.position.set(0, 0, 10);
                scene = new THREE.Scene();
                renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.5);     
                elem[0].appendChild(renderer.domElement);

                //window.addEventListener('resize', onWindowResize, false);
            }

            // TODO: apparently according to Matt this may not be necessary. Consider removing in future
            // Resize the renderer when the window resizes.
            function onWindowResize(event) {
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
            }

		/*
            // Animate the scene.
            function animate() {
                requestAnimationFrame(animate);
                render();
            }
		*/
            var i = 0;
            var n = 0;			// just a loop variable for testing, won't be needed when testing is done
            var dt = 0.0012;		// change in time between data packets
            var loopDelay = dt * Math.pow(10, 3);	// loop delays needs to be in seconds
            var firstData = true;	// track whether this is the first data packet we have received
            // target rotation values for the rocket model
            var targetRotX = 0;
            var targetRotY = 0;
            var targetRotZ = 0;

            // Render the scene, and change the rocket's attitude at 30fps
            // Gets called recursively with the requestAnimationFrame function call
            function render() {
                setTimeout(function() {
                    requestAnimationFrame(render);
                    mesh.rotation.x = targetRotX;
                    mesh.rotation.y = targetRotY;
                    mesh.rotation.z = targetRotZ;
                    renderer.render(scene, camera);
                }, 1000/30);	// run at 30fps
            }

            function calculateData(){
                var x = imuData[i];
                var imuPitch = 0;
                var imuYaw = 0;
                
                targetRotX += Math.radians(x[1]) * dt;
                targetRotY += Math.radians(x[0]) * dt;
                targetRotZ += Math.radians(x[2]) * dt;

                imuPitch = Math.atan2(x[5], x[3]);
                imuYaw = Math.atan2(x[4], x[3]);

                targetRotX = (0.98 * targetRotX) + (0.02 * imuPitch);
                targetRotZ = (0.98 * targetRotZ) + (0.02 * imuYaw);
            }

            

            function loop(){
                setTimeout(function(){
                    calculateData();
                    if(firstData == true){
                        firstData = false;
                    }
                    else{
                        dt = time[i] - time[i - 1];
                        dt = dt * Math.pow(10, -9); //need to convert nanoseconds to seconds
                    }
                    i += 1;
                    n += 1;
                    if(n >= 10){ // just trying to not flood the console while testing
                        console.log(targetRotX);
                        n = 0;
                    }
                    if(i == imuData.length - 1){ // in order to loop when at the end of the ADIS.csv file
                        i = 0;
                        firstData = true;
                    }
                    loopDelay = dt * Math.pow(10, 3); // convert seconds to milliseconds since delay time is in milliseconds
                    loop();
                }, loopDelay);
            }

            loop();
            render();
	    }
        }
    };
});
