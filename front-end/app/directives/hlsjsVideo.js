/**
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict'

angular.module("rvtk").directive("hlsjsVideo", function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', function hlsjsVideoController($scope) {
            if(Hls.isSupported()) {
                var video = document.getElementById('video');
                var hls = new Hls();
                hls.loadSource('https://paolo215.paolov435.com/hls/live.m3u8');
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED,function() {
                    video.play();
                });
            }
        }],
        templateUrl: 'directives/hlsjsVideo.html'
    }
});
