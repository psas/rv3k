# Back End Preliminary Directory
This directory contains the Socket.IO server and supporting server modules for rv3k.

## Requirements
- Python 3.5+

## Setup
1. Clone the rv3k repository to a convenient working directory. (ex: `git clone https://github.com/patter5/rv3k.git`)
2. Navigate to the back-end directory. (ex: `cd <path-to>/rv3k/back-end`)
3. Install the dependencies specified in requirements.txt. (ex: `pip install -r requirements.txt`)

### Running the Rocket View 3000 Socket.IO server
- APRS Mode: `python server.py -A`
- Telemetry Mode: `python server.py -T`
- Video Mode: `python server.py -V`

### Testing notes
Including the flag `-t` tells server.py to serve the testing webpage.
- APRS Testing Address: http://0.0.0.0:8081
- Telemetry Testing Address: http://0.0.0.0:8080
- Video Testing Address: http://0.0.0.0:8082

### Telemetry Replay instructions
1. Navigate to the `back-end directory`
1. Clone Launch-12 to your home directory. `pushd ~/ && git clone https://github.com/psas/Launch-12` then `popd` to return to your working directory.
1. Ensure that python 3 is the default for the current environment, else explicitly call python 3 using `python3 <program.py>` in place of any python commands below.
1. Open another terminal window: One terminal for replay, and another terminal for the server.
1. In one terminal type `python server.py -t -T`
1. In the other terminal type `bash replaylog.sh`
1. Open a browser to `localhost:8080`
