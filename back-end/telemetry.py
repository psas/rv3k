import socketio
import socket
from psas_packet import io

class Telemetry:
    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind(('127.0.0.1', 35001))
        self.net = io.Network(self.sock)


    def run(self, sio):
        sequence = 90501
        while sequence < 93251:
            for d in self.net.listen():
                timestamp, values = d
                fourcc, values = values
                sio.emit('my response', {fourcc : dict({"recv" : timestamp}, **values)}, namespace='/test')
                sio.sleep(0.100)
                sequence += 1
