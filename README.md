# rv3k  [![Build Status](https://travis-ci.org/patter5/rv3k.svg?branch=dev)](https://travis-ci.org/patter5/rv3k)


Software repository for winter-spring capstone project: Rocket View 3000

## Directory Structure

```
rv3k
│   .gitignore
│   COPYING
│   LICENSE
│   README.md
│
├───back-end
│   │   aprs.parsed
│   │   aprs.py
│   │   aprs.raw
│   │   aprs_source_input.py
│   │   config.cfg
│   │   README.md
│   │   replaylog.sh
│   │   replay_to_json.py
│   │   requirements.txt
│   │   server.py
│   │   startup.py
│   │   telemetry.py
│   │   TEL_TEST.md
│   │   test_aprs.py
│   │   VIDEO.md
│   │
│   └───templates
│           index.html
│           test.html
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
    │   bower.json
    │   package.json
    │   README.md
    │
    └───app
        │   app.css
        │   app.js
        │   config.js
        │   favicon.ico
        │   index.html
        │
        ├───assets
        │       basic_background.jpg
        │       menu.svg
        │       PSASLaunch.png
        │       PSASLogo.png
        │       PSASLogo2.png
        │       rocket.gltf
        │       rocket_final_obj.js
        │       rocket_model2.js
        │
        ├───controllers
        │       main-controller.js
        │
        └───directives
                atAGlance.html
                atAGlance.js
                attitude.html
                attitude.js
                earthFrameView.html
                earthFrameView.js
                hlsjsVideo.html
                hlsjsVideo.js
                telemetryCharts.html
                telemetryCharts.js
```
