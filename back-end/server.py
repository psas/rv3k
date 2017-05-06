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
import eventlet
import eventlet.wsgi
from flask import Flask, render_template
import socketio
import threading
from telemetry import Telemetry

# Create and configure the server socket
sio = socketio.Server(logger=False, async_mode="threading")
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
port = None
server = None
thread = None

# foo() is a function that was created to test how well multiple servers
# can communicate with a single front end client.
# def foo(number):
#     count = 0
#     while True:
#         sio.emit("foo", {"data": count}, namespace="/main")
#         sio.sleep(random.random())
#         count += 1



@app.route('/')
def index():
    global thread
    if thread is None:
        # thread = sio.start_background_task(server.listen)
        thread = threading.Thread(target=server.listen)
        thread.daemon = True
        thread.start()


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
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("-A", "--aprs", action="store_true")
    group.add_argument("-T", "--telemetry", action="store_true")
    group.add_argument("-V", "--video", action="store_true")

    # Parse command line arguments
    args = parser.parse_args()

    # Creating the port and server variables with the 'global'
    # keyword brings them into the scope of execution here
    global port, server

    # Choose which type of server to instantiate based on
    # the command line arguments 
    if args.aprs:
        port = 8081
        server = AprsReceiver("127.0.0.1", 35002, sio)
    elif args.telemetry:
        port = 8080
        server = Telemetry("127.0.0.1", 35001, sio)
    else:
        pass  # Instantiate video server here!

    if args.test == False:
        global app, thread
        app = socketio.Middleware(sio)
        #thread = sio.start_background_task(server.listen)
        thread = threading.Thread(target=server.listen)
        thread.daemon = True
        thread.start()

    # Sets the server to listen on a specific port for incoming connections
    eventlet.wsgi.server(eventlet.listen(('', port)), app)

# Runs main()
if __name__ == "__main__":
    main()
