/*
 * config.js creates a Constant variable for the app and allows its varaibles to be injected into each directive's scope
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

"use strict";

app.constant('config', {
    // Cesium Configuration
    'launchLocation': {
        'longitude':    -120.6517673,
        'latitude':     43.7961328,
        'height':       3000
    },
    'rocketSize':       300,    // min size in pixels
    'recoveryCrewSize': 3000,   // radius

    // PSAS Packet Types
    'ADIS':         'ADIS',
    'V8A8':         'V8A8',

    // PSAS ADIS Gyro & Acc for attitude.js
    'Gyro_X':       'Gyro_X',
    'Gyro_Y':       'Gyro_Y',
    'Gyro_Z':       'Gyro_Z',
    'Acc_X':        'Acc_X',
    'Acc_Y':        'Acc_Y',
    'Acc_Z':        'Acc_Z',

    'serverSource': 'paolo215.paolov435.com', // document.domain, //

    // Vehicle Attitude Configuration
    'FOV':                  50,
    'AttitudeWidthRatio':   4.09,   // for 16:9
    'AttitudeHeightRatio':  2.15,    // for 16:9

    // Video Configuration
    'videoFeeds':   [
        'http://paolo215.paolov435.com/hls/live.m3u8',
        'http://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
        'http://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    ],
    'defaultFeed':  0,                      // The index of the default (starting) video feed
    'numFeeds':     4,
    'feedsOn':     [true,true,true,true],

    // HLS.js Video Player configuration
    'hlsConfig':   {
        'capLevelToPlayerSize': true,       // Caps resolution to video size (default: false)
        'debug': false,                     // Turn on and off debug logs on JS console (default: false)
        'initialLiveManifestSize': 1,       // Number of segments needed to start a playback of live stream (default: 1)
        'maxBufferLength': 30,              // Max buffer length in seconds (default: 30)
        'maxBufferSize': 60*1000*1000,      // Max buffer size in bytes (default 60 MB)
        'maxBufferHole': 0.5,               // Max inter-fragment buffer hole tolerance when searching for next fragment (default 0.5 sec)
        'maxSeekHole': 2,                   // Max buffer hole to jump if playback is stalled (default: 2 sec)
        'liveSyncDurationCount': 1,         // Edge of live delay. Playback starts at N-X fragments.
                                            // N is most recent fragment. Smaller number could introduce stalls (default: 3)
        'liveMaxLatencyDurationCount': 5,   // Max number of fragments the player is allowed to get behind (default: Infinity)
        'manifestLoadingMaxRetry': 2,       // Number of retries (default: 1)
        'levelLoadingMaxRetry': 4,          // (default: 4)
        'fragLoadingMaxRetry': 6,           // (default: 6)
        'abrBandWidthFactor': 1.1,          // Switch to lower bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                            // Value > 1 increases likelihood that bitrate is lowered (default: 0.8)
        'abrBandWidthUpFactor': 0.3         // Switch to higher bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                            // Value < 1 increases likelihood that bitrate is raised (default: 0.7)
    }
});
