/*
 * atAGlance.js will display the information received by the PSAS telemetry packet in easy to read cards that describe the information
 * of the rocket in real-time.
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

angular.module("rvtk").directive("atAGlance", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', '$filter', function atAGlanceController($scope, $filter) {
            // -----------------------------

            // Adding entries to this array will cause them to be displayed on the
            // at-a-glance page, and if there is a telemetry object matching the type
            // coming from the telemetry server, it will be updated every time data is
            // received.
            $scope.cards = [
                {format: 'ADIS', type: 'VCC',       display: 'Velocity',            data: ''},
                {format: 'ADIS', type: 'Gyro_X',    display: 'Gyroscope - X',       data: ''},
                {format: 'ADIS', type: 'Gyro_Y',    display: 'Gyroscope - Y',       data: ''},
                {format: 'ADIS', type: 'Gyro_Z',    display: 'Gyroscope - Z',       data: ''},
                {format: 'ADIS', type: 'Acc_X',     display: 'Acceleration - X',    data: ''},
                {format: 'ADIS', type: 'Acc_Y',     display: 'Acceleration - Y',    data: ''},
                {format: 'ADIS', type: 'Acc_Z',     display: 'Acceleration - Z',    data: ''},
                {format: 'ADIS', type: 'Magn_X',    display: 'Magnetometer - X',    data: ''},
                {format: 'ADIS', type: 'Magn_Y',    display: 'Magnetometer - Y',    data: ''},
                {format: 'ADIS', type: 'Magn_Z',    display: 'Magnetometer - Z',    data: ''},
                {format: 'ADIS', type: 'Temp',      display: 'Temperature',         data: ''},
                {format: 'ADIS', type: 'Aux_ADC',   display: 'Aux_ADC',             data: ''},

                {format: 'MPL3', type: 'Pressure',  display: 'Pressure',    data: ''},
                {format: 'MPL3', type: 'Temp',      display: 'Temperate',   data: ''},

                {format: 'RNHH', type: 'Temperature',       display: 'Temperature',         data: ''},
                {format: 'RNHH', type: 'TS1Temperature',    display: 'Temperature - TS1',   data: ''},
                {format: 'RNHH', type: 'Ts2Temperature',    display: 'Temperature - TS2',   data: ''},
                {format: 'RNHH', type: 'TempRange',         display: 'Temperature - Range', data: ''},
                {format: 'RNHH', type: 'Voltage',           display: 'Voltage',             data: ''},
                {format: 'RNHH', type: 'Current',           display: 'Current',             data: ''},
                {format: 'RNHH', type: 'AverageCurrent',    display: 'Current - Average',   data: ''},
                {format: 'RNHH', type: 'CellVoltage1',      display: 'Cell Voltage 1',      data: ''},
                {format: 'RNHH', type: 'CellVoltage2',      display: 'Cell Voltage 2',      data: ''},
                {format: 'RNHH', type: 'CellVoltage3',      display: 'Cell Voltage 3',      data: ''},
                {format: 'RNHH', type: 'CellVoltage4',      display: 'Cell Voltage 4',      data: ''},
                {format: 'RNHH', type: 'PackVoltage',       display: 'Pack Voltage',        data: ''},
                {format: 'RNHH', type: 'AverageVoltage',    display: 'Voltage - Average',   data: ''},

                {format: 'RNHP', type: 'Port1',     display: 'Port - 1',        data: ''},
                {format: 'RNHP', type: 'Port2',     display: 'Port - 2',        data: ''},
                {format: 'RNHP', type: 'Port3',     display: 'Port - 3',        data: ''},
                {format: 'RNHP', type: 'Port4',     display: 'Port - 4',        data: ''},
                {format: 'RNHP', type: 'Umbilical', display: 'Umbilical Port',  data: ''},
                {format: 'RNHP', type: 'Port6',     display: 'Port - 6',        data: ''},
                {format: 'RNHP', type: 'Port7',     display: 'Port - 7',        data: ''},
                {format: 'RNHP', type: 'Port8',     display: 'Port - 8',        data: ''},

                {format: 'ROLL', type: 'Angle',     display: 'Roll Angle',          data: ''},
                {format: 'ROLL', type: 'Disable',   display: 'Roll Disable Signal', data: ''},

                {format: 'VSTE', type: 'Time',          display: 'Launch Time Elapsed',             data: ''},
                {format: 'VSTE', type: 'Acc_up',        display: 'Current Acceleration Upwards',    data: ''},
                {format: 'VSTE', type: 'Vel_up',        display: 'Current Velocity Upwards',        data: ''},
                {format: 'VSTE', type: 'Altitude',      display: 'Current Altitude',                data: ''},
                {format: 'VSTE', type: 'Roll_Rate',     display: 'Current Roll Rate',               data: ''},
                {format: 'VSTE', type: 'Roll_Angle',    display: 'Current Roll Angle',              data: ''},

                {format: 'SEQN', type: 'Sequence',      display: 'Test Addtion', data: ''}
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
                }
            }

        }],
        templateUrl: 'directives/atAGlance.html'
    }
});
