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
