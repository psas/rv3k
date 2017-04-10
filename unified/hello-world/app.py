from flask import Flask, render_template
import socketio

sio = socketio.Server(logger=True, async_mode=None)
app = Flask(__name__)
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
app.config["SECRET_KEY"] = "secret!"
thread = None

def background_thread():
    """Example of how to send server generated events to clients."""
    while True:
        sio.sleep(1)
        sio.emit("my response", {"data": "Hello, World!"}, namespace="/test")



@app.route('/')
def index():
    global thread
    if thread is None:
        thread = sio.start_background_task(background_thread)
    return render_template("index.html")

@sio.on("connect", namespace="/test")
def test_connect(sid, environ):
    print("Client connected")

@sio.on("disconnect", namespace="/test")
def test_disconnect(sid):
    print("Client disconnected")

if __name__ == "__main__":
    # deploy with eventlet
    import eventlet
    import eventlet.wsgi
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)


