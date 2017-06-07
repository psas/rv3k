# Front End Information
This directory contains the webserver and front-end rendering components for rv3k
## Requirements
- Nodejs v.6.x.x (LTS)

_Note_: Debian-based Linux package managers don't have the latest version of Nodejs. Instead of using apt-get, download and install the latest LTS version from https://nodejs.org/

## Setup
1. Create and navigate to a convenient working directory then clone the repository using command `git clone https://github.com/patter5/rv3k.git`.
Alternatively, use GitHub desktop or some other tool to clone to your local machine. A bash-like shell is recommended.
2. navigate to `<path-to>/rv3k/front-end`
3. use command `npm install`. This will install dependencies specified in package.json and bower.json. This could take several minutes. 

### Running the Rocket View 3000 web server
1. use command `npm start`
2. open a browser and navigate to `localhost:8000/index.html`

### Configuring Rocket View 3000
Rocket View 3000 is configurable through the configuration file __config.js__ found in the front-end/app directory
1. Cesium Configuration
- Offline: Cesium can be used offline with lower resolution tilemaps by setting 'offline' to true. For higher fidelity tilemaps, follow the instructions at https://github.com/AnalyticalGraphicsInc/cesium/wiki/Offline-Guide to download the full set of offline tiles and place them in the app/bower_components/cesium.js/dist/Assets/Textures/ folder, overwriting the current NaturalEarthII folder.
- Launch Location: The launch location can be set through the 'launchLocation' parameters.
- Terrain Modeling: Cesium can model terrain by setting 'cesiumTerrain' to true.
- Real Time Lighting: Cesium can use a real-time lighting engine that is recommended while Terrain Modeling is active. If using Rocket View 3000 offline, it is recommended that cesiumRTLighting be set to false to improve contrast of the lower resolution tiles available.
- Rocket Position Modeling: The position of the rocket can be modeled with a blue sphere or a model rocket depending on the setting of 'cesiumRocket'.
- Model/RecoveryCrew Size: The size of the model rocket and recovery crews can also be set
2. PSAS Packet Configuration
- If the PSAS packet is modified to contain alternate naming, Rocket View 3000 can be configured to accept different identifiers in place of older PSAS Packet identifier values in the PSAS Packet Types and Keys sections
3. Server Configuration
- The url location of the backend server can be modified through 'serverSource'
4. Telemetry Graph Configuration
- The Telemetry Graphs can be configured to the anticipated received data values per approximate minute
5. Vehicle Attitude Configuration
- The Vehicle Attitude Display FOV (field of view) can be configured by degrees with the 'FOV' value.
6. HLS Video Player Configuration
- The HLS Video player can be configured to switch between multiple video feeds. Simply add the server url that will stream the video to array 'videoFeeds'. Set the default feed to the desired array element with 'default feed', and enable and disable feeds through the 'numFeeds' value and 'feedsOn' array. The player itself is also configurable to system needs. Options are available to restrict buffer size on a system with limited RAM as well as set latency and bandwidth values to increase syncronization or performance of the video player. Each option is commented, explaining its function and default value.
#### Configuring outbound address 
Configure outbound port address as a value for the "start" key in package.json.
