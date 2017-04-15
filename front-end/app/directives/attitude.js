'use strict';

angular.module("rvtk").directive("attitude", function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'directives/attitude.html',
        link: function($scope, elem, attrs) {
            var camera;
            var scene;
            var renderer;
            var mesh;
            var gyros = [];
            $.ajax({
              type: "GET",
              url: "directives/components/ADIS.csv", <!-- TODO this will be streamed data -->
              dataType: "text",
              success: function(data) {
                process(data);
                //allThis();
              }
            });

            function process(text){ 
              var lines = text.split("\n");
              for(var i = 1; i < lines.length-1; i++) {
                var data = lines[i].split(",");
                gyros.push([parseFloat(data[3]), parseFloat(data[4]), parseFloat(data[5])]);
              }
              console.log(gyros[0]);
            }

            init();
            var loader1 = new THREE.JSONLoader();

            function loadModel(modelUrl) {
                loader1.load(modelUrl, function(geometry) {
                    mesh = new THREE.Mesh(geometry);
                    scene.add(mesh);
                });
            }

            loadModel("directives/components/rocket_model2.js");
            animate();

            function init() {
                camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
                camera.position.set(0, 0, 10);
                scene = new THREE.Scene();
                renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.5);     
                elem[0].appendChild(renderer.domElement);

                window.addEventListener('resize', onWindowResize, false);
            }

            function onWindowResize(event) {
                renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
            }

            function animate() {
                requestAnimationFrame(animate);
                render();
            }

            var i = 0;
            function render() {
              setTimeout(function() {
                var x = gyros[i];
                requestAnimationFrame(render);
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
