# rv3k  [![Build Status](https://travis-ci.org/patter5/rv3k.svg?branch=dev)](https://travis-ci.org/patter5/rv3k)


Software repository for winter-spring capstone project: Rocket View 3000

## Installation and setup
- For back-end instructions, see [back-end/README.md](https://github.com/patter5/rv3k/tree/dev/back-end#back-end-directory)
- For front-end instructions, see [front-end/README.md](https://github.com/patter5/rv3k/tree/dev/front-end#front-end-preliminary-directory)

## Directory Structure

```
rv3k
│   .gitignore
│   .travis.yml                         --> Configuration for continuous integration
│   COPYING
│   LICENSE
│   README.md
│
├───back-end
│   │   aprs.parsed                     --> Small collection of pre-parsed APRS signals
│   │   aprs.py                         --> Serves APRS data to server.py
│   │   aprs.raw                        --> Small collection of unparsed APRS signals
│   │   aprs_source_input.py            --> Script used for testing that simulates incoming APRS data
│   │   config.cfg                      --> Allows the configuration of which ports server.py uses
│   │   README.md
│   │   replaylog.sh                    --> Script used for testing that replays Launch-12 telemetry data
│   │   replay_to_json.py               --> Script used for testing that converts recieved telemetry data to json objects
│   │   requirements.txt                --> List of required libraries
│   │   server.py                       --> Runs the APRS and Telemetry servers, listens for incoming data and sends it to the front end
│   │   startup.py                      --> Runs server.py with the proper command line arguments to start the whole back-end system
│   │   telemetry.py                    --> Serves telemetry data to server.py
│   │   TEL_TEST.md
│   │   test_aprs.py                    --> A suite of test cases for the APRS module
│   │   VIDEO.md
│   │
│   └───templates
│           index.html                  --> A webpage used for testing back-end server functionality
│           test.html                   --> Generates a text file which can be compared with Launch-12 telemetry data
│
├───docs
│   │   README.md
│   │
│   ├───license-agreement
│   │       lic-agr.pdf
│   │       README.md
│   │
│   └───SRS
│           README.md
│           srs.pdf
│
└───front-end
    │   .bowerrc        
    │   .jshintrc
    │   bower.json                      --> installs the bower dependancies into the bower_components directory              
    │   package.json                    --> defines npm commands and installs node dependancies into the node_modules directory
    │   README.md                       --> INSTRUCTIONS: how to install and run rv3k front-end 
    │
    └───app
        │   app.css                     --> all stylesheets 
        │   app.js                      --> main application module, defines app variable
        │   config.js                   --> centeral place for rv3k configuration
        │   favicon.ico
        │   index.html                  --> layout file - this holds all layout
        │
        ├───assets                      --> all images and models need for the application
        │       basic_background.jpg
        │       menu.svg
        │       PSASLaunch.png
        │       PSASLogo.png
        │       PSASLogo2.png
        │       rocket.gltf             
        │       rocket_final_obj.js     --> vehicle model for the vehicle attitude module
        │       rocket_model2.js        --> old vehicle model 
        │
        ├───controllers
        │       main-controller.js      --> controller logic for the main page
        │
        └───directives                  --> defines custom html tags
                atAGlance.html          --> layout/html for at a glance 
                atAGlance.js            --> logic and data connection for at a glance
                attitude.js             --> logic, data connection and rendering for attitude
                earthFrameView.html     --> layout/html for the 3D map
                earthFrameView.js       --> logic and data connection for the 3D map
                hlsjsVideo.html         --> layout/html for the video player
                hlsjsVideo.js           --> logic and data connection for video
                telemetryCharts.html    --> layout/html for graphs
                telemetryCharts.js      --> logic and data connection for graphs
```
