#!/usr/bin/env python
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
import eventlet
import eventlet.wsgi
from flask import Flask, render_template
from optparse import OptionParser
import random
import socketio
import sys

# Create and configure the server socket
sio = socketio.Server(logger=True, async_mode=None)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
thread = None


# foo() is a function that was created to test how well multiple servers
# can communicate with a single front end client.
def foo(number):
    count = 0
    while True:
        sio.emit("foo", {"data": count}, namespace="/main")
        sio.sleep(random.random())
        count += 1


@app.route('/')
def index():
    global thread
    if thread is None:
        thread = sio.start_background_task(foo, 0)
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
def main(argv):
    global app
    # Adding command line option support
    parser = OptionParser()
    parser.add_option("-n", "--number", dest="number", action="store",
                      type="int")
    parser.add_option("-p", "--port", dest="port", action="store", type="int")

    # Parse command line arguments
    (options, argv) = parser.parse_args(argv)

    if options.number > 0:
        global thread
        app = socketio.Middleware(sio)
        thread = sio.start_background_task(foo, options.number)

    # Sets the server to listen on a specific port for incoming connections
    eventlet.wsgi.server(eventlet.listen(('', options.port)), app)


# Runs main()
if __name__ == "__main__":
    main(sys.argv[1:])
