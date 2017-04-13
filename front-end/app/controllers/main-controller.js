
//This is the main controller, it handles the logic in on the main page (app/index.html)
var app = angular.module('rvtk', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

    //initialize variables
    $scope.VisibleCamera = 1;
    $scope.hideEFV = false;

    //This funtion changes which video stream appears on the page when the button is clicked
    $scope.toggleCamera = function() {
	//to change the number of feeds to toggle through change the number of feeds variable
	var numberOfFeeds = 2;
        $scope.VisibleCamera = ++$scope.VisibleCamera%numberOfFeeds;
    };

    $scope.helloWorld = 'nothing';
    var namespace = '/test';
    var url = 'http://localhost:8080/test';
    // this port connects to port broadcast by ../unified/app.py
    var socket = io.connect('http://localhost:8080/test');
    socket.on('connect', function() {});
    $http.get(url).then();
    socket.on('disconnect', function() {});
    socket.on('my response', function(msg) {
        console.log(msg.data);
        $scope.helloWorld = msg.data;
        $scope.$apply();
    });

    // -----------------------------
    // all 3D map stuff
    //creates the 3D map viewer
    var viewer = new Cesium.Viewer('cesiumContainer', {
        //choose a more true to earth map
        imageryProvider : new Cesium.TileMapServiceImageryProvider({
            url : '//cesiumjs.org/tilesets/imagery/naturalearthii'
        }),
        //gets rid of a menu to pick map type
        baseLayerPicker : false
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

    //sets the camera to the launch site
    function lookAtLaunchSite() {
        var target = new Cesium.Cartesian3(-2351419.98752473, -3967847.6396402, 4396807.49924701);
        var offset = new Cesium.Cartesian3(6344.974098678562, -793.3419798081741, 2499.9508860763162);
        viewer.camera.lookAt(target, offset);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
    //calls the function to look at the launch site
    lookAtLaunchSite();

    //Gets rid of a developer tools error and allows cesium to work
    viewer.infoBox.frame.sandbox = "allow-same-origin allow-top-navigation allow-pointer-lock allow-popups allow-forms allow-scripts";

}]);
   
