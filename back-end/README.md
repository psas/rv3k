# Back End Directory
This directory contains the Socket.IO server and supporting server modules for rv3k.

## Requirements
- Python 2.7

## Setup
1. Clone the rv3k repository to a convenient working directory. (ex: `git clone https://github.com/patter5/rv3k.git`)
2. Navigate to the back-end directory. (ex: `cd <path-to>/rv3k/back-end`)
3. Install the dependencies for Telemetry and APRS modules specified in requirements.txt. (ex: `pip install -r requirements.txt`)
4. Setup back-end video streaming by following the instructions in `VIDEO.md` 

### Running the Rocket View 3000 Socket.IO server
`python server.py -T -A`
 - -T enables telemetry data processing
 - -A enables aprs data processing

### Logging
Telemetry data and APRS data are logged synchronously in binary format to rv3k/back-end/telemetry.log

### Testing notes
Including the flag `-t` tells server.py to serve the testing webpage.
- Server Testing Address: http://0.0.0.0:8080

### Telemetry Replay instructions
1. Navigate to the `back-end` directory
1. Clone Launch-12 to your home directory. `pushd ~/ && git clone https://github.com/psas/Launch-12` then `popd` to return to your working directory.
1. Ensure that python 2.7 is the default for the current environment, else explicitly call python 2.7 using `python2.7 <program.py>` in place of any python commands below. Better yet use a virtual environment.
1. Open another terminal window: One terminal for replay, and another terminal for the server.
1. In one terminal type `python server.py -t -T`
1. In the other terminal type `bash replaylog.sh`
1. Open a browser to `localhost:8080`


### APRS simulation instructions
1. Navigate to the `back-end` directory
1. Ensure that python 2.7 is the default for the current environment, else explicitly call python 2.7 using python 2.7 <script.py> in the place of any python commands below.
1. Open another terminal window: One terminal for simulation, and another terminal for the server.
1. In one terminal type `python server.py -t -A`
1. In another terminal type `python aprs_source_input.py`
1. Open a browser to `localhost:8080`



