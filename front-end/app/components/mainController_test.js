
/**
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
**/

'use strict';

describe('rvtk MainControlller', function() {
    var $scope, $controller;

    beforeEach(angular.mock.module('rvtk'));
    beforeEach(inject(function(_$rootScope_, _$controller_) {
        $scope = _$rootScope_.$new();
        $controller = _$controller_;

    }));

    describe('toggleCamera', function() {
        
        it('should start at one', function() {
            var controller = $controller('MainController', {$scope: $scope});
            expect($scope.VisibleCamera).toEqual(1);
        });
        it('should increment the feed', function() {
            var controller = $controller('MainController', {$scope: $scope});
            $scope.toggleCamera();
            expect($scope.VisibleCamera).toEqual(0);
        });
    });

});


