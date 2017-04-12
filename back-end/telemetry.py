from psas_packet import io
import socket
import socketio

class Telemetry:
    def __init__(self, sio):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(("127.0.0.1", 35001))
        net = io.Network(sock)
    
    def listen():
        while True:
            for timestamp, data in net.listen():
                #sio.emit("my response", {"data": ""}, namespace="/main")
