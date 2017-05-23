#!/usr/bin/env python
# server.py initializes a socketio server for the selected back-end module.
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from aprs import AprsReceiver
from argparse import ArgumentParser
from ConfigParser import ConfigParser
import eventlet
import eventlet.wsgi
from flask import Flask, render_template
import socketio
import threading
from threading import Lock
from telemetry import Telemetry


# Create and configure the server socket
sio = socketio.Server(logger=False, async_mode="threading")
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
lock = Lock()
log = open("telemetry.log", "w")
threads = []


@app.route('/')
def index():
    return render_template("index.html")


# Connection handler for incoming client connections
@sio.on("connect", namespace="/main")
def connect(sid, environ):
    print("Client connected")


# Connection handler for disconnecting client connections
@sio.on("disconnect", namespace="/main")
def disconnect(sid):
    print("Client disconnected")



# main() takes a number and a port as command line arguments
# and based on the arguments from the command line will create a
# back ground thread that runs the foo()
def main():

    # parser is an object that holds the command line argument
    # options
    parser = ArgumentParser()
    parser.add_argument("-t", "--test", action="store_true")

    # The group object holds a special set of options that 
    # need to be mutually exclusive.  This ensures that a server
    # will only be instantiated as either an APRS server, a
    # telemetry server or a video server

    # Note that the test option ("-t") is not part of the mutually
    # exclusive group. This is because we want to allow any
    # type of server instance to have testing options
    #group = parser.add_mutually_exclusive_group(required=True)
    parser.add_argument("-A", "--aprs", action="store_true")
    parser.add_argument("-T", "--telemetry", action="store_true")

    # Parse command line arguments
    args = parser.parse_args()

    config = ConfigParser()
    config.read("config.cfg")

    # Creating the port and server variables with the 'global'
    # keyword brings them into the scope of execution here
    global port, server, threads

    if args.aprs:
        aprs_rx = int(config.get("Ports", "aprs_rx"))
        port = int(config.get("Ports", "aprs_tx"))
        server = AprsReceiver("127.0.0.1", aprs_rx, sio, lock, log)
        thread = threading.Thread(target=server.listen)
        thread.daemon = True
        threads.append(thread)
        
    if args.telemetry:
        telemetry_rx = int(config.get("Ports", "telemetry_rx"))
        port = int(config.get("Ports", "telemetry_tx"))
        server = Telemetry("127.0.0.1", telemetry_rx, sio, lock, log)
        thread = threading.Thread(target=server.listen)
        thread.daemon = True
        threads.append(thread)


    
    # Use socketio as middleware is test flag is false
    if args.test == False:
        global app
        app = socketio.Middleware(sio)

    # Start up all servers
    for thread in threads:
        thread.start()

    try:
        # Sets the server to listen on a specific port for incoming
        # connections
        eventlet.wsgi.server(eventlet.listen(('', 8080)), app, log=None, log_output=False)
    except KeyboardInterrupt:
        log.close()
        for thread in threads:
            thread.join() 
        return

# Runs main()
if __name__ == "__main__":
    main()
