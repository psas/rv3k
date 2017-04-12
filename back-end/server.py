#!/usr/bin/env python
import eventlet
import eventlet.wsgi
from flask import Flask, render_template
import socketio
import sys
from telemetry import Telemetry
from threading import Event, Thread

sio = socketio.Server(logger=True, async_mode=None)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
thread = None

def background_thread():
    event = Event()
    tel = Telemetry(sio)
    tel_thread = Thread(target=tel.listen, args=(event,))
    tel_thread.start()
    while True:
        try:
            pass
        except KeyboardInterrupt:
            event.set()
            tel_thread.join()
            sys.exit()

@app.route('/')
def index():
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    return render_template("index.html")

@sio.on("connect", namespace="/main")
def connect(sid, environ):
    print("Client connected")

@sio.on("disconnect", namespace="/main")
def disconnect(sid):
    print("Client disconnected")

if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)
