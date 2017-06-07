/*
 * config.js creates a Constant variable for the app and allows its varaibles to be injected into each directive's scope
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
    'offline': false,           // set to true if using cesium offline
    'launchLocation': {
        'longitude':    -120.6517673,
        'latitude':     43.7961328,
        'altitude':     3000
    },
    'cesiumTerrain':    true,   // model cesium map with terrain
    'cesiumRTLighting': true,   // turn real time lighting off and on (recommended for terrain)
    'cesiumRocket':     false,  // use rocket model in cesium
    'rocketSize':       500,    // min size in pixels
    'rocketScale':      100,    // max scale when at a distance
    'recoveryCrewSize': 3000,   // radius

    // PSAS Packet Types
    'ADIS':         'ADIS',
    'V8A8':         'V8A8',
    'BMP1':         'BMP1',
    'JGPS':         'JGPS',
    'SEQN':         'SEQN',
    'ROLL':         'ROLL',

    // PSAS Packet Keys
    'Gyro_X':       'Gyro_X',
    'Gyro_Y':       'Gyro_Y',
    'Gyro_Z':       'Gyro_Z',
    'Acc_X':        'Acc_X',
    'Acc_Y':        'Acc_Y',
    'Acc_Z':        'Acc_Z',
    'ECEF_VX':      'ECEF_VX',
    'ECEF_VY':      'ECEF_VY',
    'ECEF_VZ':      'ECEF_VZ',
    'Latitude':     'Latitude',
    'Longitude':    'Longitude',
    'MSL_Altitude': 'MSL_Altitude',
    'Ellipsoid_Altitude':   'Ellipsoid_Altitude',
    'Callsign':     'Callsign',
    'timestamp':    'timestamp',
    'recv':         'recv',

    'serverSource': document.domain, // 'paolo215.paolov435.com', //

    // Telemetry Graphs Configuration
    'numPointsADIS':        150,    // approx. # of data points expected per min
    'numPointsV8A8':        15,
    'showTooltips':         false,  // turn off or on the Chart.js tooltips for mouse over

    // Vehicle Attitude Configuration
    'FOV':                  50,

    // Video Configuration
    'videoFeeds':   [
        'http://meg-murry.ddns.net:3586/hls/lava.m3u8',
        'http://paolo215.paolov435.com/hls/live.m3u8',
        'http://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
        'http://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    ],
    'defaultFeed':  0,                          // The index of the default (starting) video feed
    'feedsOn':     [true,false,true,true,true], // Keep the urls you like in the videoFeeds array but turn them off and on here

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
