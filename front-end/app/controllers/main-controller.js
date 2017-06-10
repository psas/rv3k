/**
 * main-controller.js provides the controller for application and handles
 * hiding different elements and swapping windows.
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

app.controller('MainController', ['$scope', function($scope) {

    // Initialize variables
    $scope.hideAtAGlance = true;
    $scope.swapWindowsCount = 0;

    // Initial location of each module.
    var focuses = ['main-container', 'sideTop-container', 'sideBottom-container'];
    var videoIndex = 0;
    var efvIndex = 1;
    var attitudeIndex = 2;
    $scope.videoFocus = focuses[videoIndex];
    $scope.efvFocus = focuses[efvIndex];
    $scope.attitudeFocus = focuses[attitudeIndex];

    // Switches the View of the web page from Visual Elements to At-A-Glance Rocket Data
    $scope.toggleAtAGlance = function() {
        var viewVisible = document.querySelector(".view-container");
        var viewHidden = document.querySelector(".view-container-hide");
        if ($scope.swapWindowsCount%2 == 1) {
            viewHidden.className = "view-container";
        } else {
            viewVisible.className = "view-container-hide";
        }
        $scope.swapWindowsCount++;
        $scope.hideAtAGlance = !$scope.hideAtAGlance;
    }

    // Rotates the position of the Launch Video, Earth Frame View, and Rocket Attitude
    $scope.swapWindows = function updateTransition() {
        // Query the values of the containers
        var main = document.querySelector(".main-container");
        var sideTop  = document.querySelector(".sideTop-container");
        var sideBottom = document.querySelector(".sideBottom-container");
        var bottom = document.querySelector(".bottom-container");

        // Rotate the assigned CSS class
        if (main && sideTop && sideBottom && bottom) {
            main.className = "main-container-hide";
            setTimeout(function() {sideTop.className = "sideTop-container-hide";}, 100);
            setTimeout(function() {sideBottom.className = "sideBottom-container-hide";}, 200);
            setTimeout(function() {bottom.className = "bottom-container-hide";}, 300);
            setTimeout(function() {main.className = "sideBottom-container"}, 800);
            setTimeout(function() {sideTop.className = "main-container"}, 1000);
            setTimeout(function() {sideBottom.className = "sideTop-container"}, 900);
            setTimeout(function() {bottom.className = "bottom-container"}, 700);
        }
    }

}]);
