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
import os
from threading import Lock
from telemetry import Telemetry


# Create and configure the server socket
sio = socketio.Server(logger=False, async_mode="threading", ping_timeout=3600)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"


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

    # parser is an object that holds the command line argument options
    parser = ArgumentParser()


    # Enables to serve test web page for back-end. 
    parser.add_argument("-t", "--test", action="store_true")

    # Enables to boot up the APRS server
    parser.add_argument("-A", "--aprs", action="store_true")

    # Enables to boot up the telemetry server
    parser.add_argument("-T", "--telemetry", action="store_true")

    # Parse command line arguments
    args = parser.parse_args()


    # Read configuration file
    config = ConfigParser()
    config.read("config.cfg")


    # Lock for synchronized logging
    lock = Lock()

    # Prevents from overwriting existing files
    log_num = 0
    while os.path.exists("telemetry-%03d.log" % log_num):
        log_num += 1

    log = open("telemetry-%03d.log" % log_num, "w")
    error_log = open("error.log", "w")

    threads = []

    if args.aprs:
        aprs_rx = int(config.get("Ports", "aprs_rx"))
        server = AprsReceiver("127.0.0.1", aprs_rx, sio, lock, log, error_log)
        thread = threading.Thread(target=server.listen)
        thread.daemon = True
        threads.append(thread)
        
    if args.telemetry:
        telemetry_rx = int(config.get("Ports", "telemetry_rx"))
        server = Telemetry("127.0.0.1", telemetry_rx, sio, lock, log, error_log)
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

    port = int(config.get("Ports", "main_tx"))

    try:
        # Sets the server to listen on a specific port for incoming
        # connections
        eventlet.wsgi.server(eventlet.listen(('', port)), app)
    except KeyboardInterrupt:
        pass

    log.close()
    error_log.close()
    print("end")
    return
# Runs main()
if __name__ == "__main__":
    main()
