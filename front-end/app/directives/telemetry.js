'use strict'

// This filter will find  the matching entry in $scope.cards based on the data
// type sent to it.
// EG: $filter('getByType')($scope.cards, 'VCC') will find the object in cards
// with format: ADIS, type: VCC, and display: Velocity.
app.filter('getByType', function() {
    return function(input, type) {
        var i = 0, len = input.length;
        for(; i< len; i++) {
            if(input[i].type == type) {
                return i;
            }
        }     
        return null;
    }
});

angular.module("rvtk").directive("telemetry", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', '$filter', function telemetryController($scope, $filter) {

            $scope.cards = [
                {format: 'ADIS', type: 'VCC',       display: 'Velocity',            data: ''},
                {format: 'ADIS', type: 'Acc_X',     display: 'Acceleration - X',    data: ''},
                {format: 'ADIS', type: 'Acc_Y',     display: 'Acceleration - Y',    data: ''},
                {format: 'ADIS', type: 'Acc_Z',     display: 'Acceleration - Z',    data: ''}
            ];

            // Connect to the server.
            var namespace = '/main';
            var socket = io.connect('http://' + document.domain + ':8080' + namespace);
            socket.on('connect', function() {});
            socket.on('disconnect', function() {});

            // Connect to the telemetry server specifically.
            socket.on('telemetry', function(data) {
                // Key here is the packet format.
                // data[key] will then be an object containing types and
                // their respective data.
                for(var key in data) {
                    // TODO Update this to check for unimportant types as packet formats
                    // change.
                    if(data[key] == 'JGPS') { 
                        continue;
                    }
                    update(data[key]);
                }
            });
            
            function update(data) {
                // key is now a type, such as VCC.
                // data[key] will then be the numerical data.
                for(var key in data) {
                    if(key == 'timestamp' || key == 'recv') {
                        continue;
                    }
                    var found = $filter('getByType')($scope.cards, key);
                    if(found != null) {
                        $scope.cards[found].data = data[key];
                        $scope.$apply();
                    }
                    else {
                        console.log('Telemetry module told to update a data type: ' + key + ' that was not expected.');
                    }
                }
            }
        }],
        templateUrl: "directives/telemetry.html" 
    }
});
