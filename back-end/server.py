async_mode = None

import time
from flask import Flask, render_template
from psas_packet import io
import socket
import socketio
import telemetry as tel

sio = socketio.Server(logger=True, async_mode=async_mode)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config['SECRET_KEY'] = 'secret!'
thread = None

def background_thread():
    """Example of how to send server generated events to clients."""
    telemetry = tel.Telemetry()
    telemetry.run(sio)

@app.route('/')
def index():
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    return render_template('index.html')

@sio.on('connect', namespace='/test')
def test_connect(sid, environ):
    print('Client connected')

@sio.on('disconnect', namespace='/test')
def test_disconnect(sid):
    print('Client disconnected')

if __name__ == '__main__':
    # deploy with eventlet
    import eventlet
    import eventlet.wsgi
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)


