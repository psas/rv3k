/*
 * hljsVideo.js will initialize a hls.js video player to play streaming video from a video server url that is compatible with the html5 <video> tag
 * It will allow for the toggleVideo to stop the current feed and start a new feed with a new url from outside the directive
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

angular.module("rvtk").directive("hlsjsVideo", function() {
    return {
        restrict: 'E',
        transclude: false,  // Allows scope outside the directive to use directive variables and functions
        controller: ['$scope', function hlsjsVideoController($scope) {
            $scope.videoUrl = [
                'http://paolo215.paolov435.com/hls/live.m3u8',
                'http://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
                'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
                'http://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
            ];
            $scope.currentFeed = 0;
            $scope.numberOfFeeds = 4;

            // Video Player Config
            var config = {
                capLevelToPlayerSize: true,     // Caps resolution to video size (default: false)
                debug: false,                   // Turn on and off debug logs on JS console (default: false)
                initialLiveManifestSize: 1,     // Number of segments needed to start a playback of live stream (default: 1)
                maxBufferLength: 15,            // Max buffer length in seconds (default: 30)
                maxBufferSize: 60*1000*1000,    // Max buffer size in bytes (default 60 MB)
                maxBufferHole: 0.5,             // Max inter-fragment buffer hole tolerance when searching for next fragment (default 0.5 sec)
                maxSeekHole: 2,                 // Max buffer hole to jump if playback is stalled (default: 2 sec)
                liveSyncDurationCount: 1,       // Edge of live delay. Playback starts at N-X fragments.
                                                // N is most recent fragment. Smaller number could introduce stalls (default: 3)
                liveMaxLatencyDurationCount: 5, // Max number of fragments the player is allowed to get behind (default: Infinity)
                manifestLoadingMaxRetry: 2,     // Number of retries (default: 1)
                levelLoadingMaxRetry: 4,        // (default: 4)
                fragLoadingMaxRetry: 6,         // (default: 6)
                abrBandWidthFactor: 1.1,        // Switch to lower bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                                // Value > 1 increases likelihood that bitrate is lowered (default: 0.8)
                abrBandWidthUpFactor: 0.3,      // Switch to higher bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                                // Value < 1 increases likelihood that bitrate is raised (default: 0.7)
            };

            // The video player is initialized and the default video is loaded
            // and played
            if(Hls.isSupported()) {
                $scope.video = document.getElementById('video');
                $scope.hls = new Hls(config);
                $scope.hls.attachMedia($scope.video);
                $scope.hls.on(Hls.Events.MEDIA_ATTACHED,function() {
                    $scope.hls.loadSource($scope.videoUrl[$scope.currentFeed]);
                    $scope.hls.on(Hls.Events.MANIFEST_PARSED, function() {
                        video.play();
                    });
                });
            }

            // This function loads a new video feed url from the array of feeds
            // It is called in index.html from outer scope because this directive
            // is set to transclude: false without overriding scope = {}
            $scope.toggleVideo = function () {
                $scope.hls.destroy();
                $scope.hls = new Hls(config);
                $scope.hls.attachMedia($scope.video);
                $scope.hls.on(Hls.Events.MEDIA_ATTACHED,function() {
                    $scope.hls.loadSource($scope.videoUrl[++$scope.currentFeed%$scope.numberOfFeeds]);
                    $scope.hls.on(Hls.Events.MANIFEST_PARSED, function() {
                        video.play();
                    });
                });
            };

        }],
        templateUrl: 'directives/hlsjsVideo.html'
    }
});
