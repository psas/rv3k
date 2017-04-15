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
            var gyros = [];     // Gyroscopic data handling rotation. 
            $.ajax({
                type: "GET",
                url: "directives/components/ADIS.csv", // TODO: Real data. 
                dataType: "text",
                success: function(data) {
                    process(data);
                }
            });

            // Get gyroscopic data out of ADIS.csv.
            function process(text){ 
                var lines = text.split("\n");
                for(var i = 1; i < lines.length-1; i++) {
                    var data = lines[i].split(",");
                    gyros.push([parseFloat(data[3]), parseFloat(data[4]), parseFloat(data[5])]);
                }
            }

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

            loadModel("directives/components/rocket_model2.js");
            animate();

            // Set up the camera and renderer and attach them to html.
            // Start a listener for window resizing.
            function init() {
                camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
                camera.position.set(0, 0, 10);
                scene = new THREE.Scene();
                renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.5);     
                elem[0].appendChild(renderer.domElement);

                window.addEventListener('resize', onWindowResize, false);
            }

            // Resize the renderer when the window resizes.
            function onWindowResize(event) {
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
            }

            // Animate the scene.
            function animate() {
                requestAnimationFrame(animate);
                render();
            }

            // Render the scene, and change the rocket's attitude every .1 seconds.
            var i = 0;
            function render() {
                setTimeout(function() {
                    var x = gyros[i];
                    mesh.rotation.x = x[0];
                    mesh.rotation.y = x[1];
                    mesh.rotation.z = x[2];
                    i += 1;
                    if(i == gyros.length - 1) {
                        i = 0;
                    }
                    renderer.render(scene, camera);
                }, 100);
            }
        }
    };
});
