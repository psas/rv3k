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
import socketio
from telemetry import Telemetry

sio = socketio.Server(logger=True, async_mode=None)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
thread = None

@app.route('/')
def index():
    global thread
    if thread is None:
        tel = Telemetry("127.0.0.1", 35001, sio)
        thread = sio.start_background_task(tel.listen)
    return render_template("index.html")

@sio.on("connect", namespace="/main")
def connect(sid, environ):
    print("Client connected")

@sio.on("disconnect", namespace="/main")
def disconnect(sid):
    print("Client disconnected")

if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)
