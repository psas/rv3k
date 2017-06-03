# Telemetry Testing Instructions
1. Navigate to the back-end directory. (ex: `cd <path-to>/rv3k/back-end`)
2. Run replay_to_json.py. (ex: `python replay_to_json.py`)
3. Open a second terminal.
4. Navigate to the scripts directory. (ex: `cd <path-to>/psas_packet/scripts`)
5. Run the replaylog script. (ex: `./replaylog ../../Launch-12/data/LAUNCH/flightcomputer.log`)
6. When the replay finishes, use Ctrl-C in the first terminal.
7. Navigate to the templates directory. (ex: `cd templates`)
8. Rename index.html. (ex: `mv index.html temp.html`)
9. Rename test.html to index.html. (ex: `mv test.html index.html`)
10. Return to the back-end directory. (ex: `cd ..`)
11. Run the telemetry server. (ex: `python server.py -t -T`)
12. Repeat steps 3-5.
13. When the replay finishes, save the download link as received.txt (in the back-end directory).
14. Enter this command in the first terminal: `diff <(sed -r 's/"recv":[0-9]+\.[0-9]+/RECV/' sent.txt) <(sed -r 's/"recv":[0-9]+\.[0-9]+/RECV/' received.txt)`
- PASS: diff outputs zero differences
- FAIL: diff outputs one or more differences
