from psas_packet import io
import socket
import socketio
from threading import Event

class Telemetry:
    def __init__(self, sio):
        self.sio = sio
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind(("127.0.0.1", 35001))
        self.network = io.Network(self.socket)
    
    def listen(self, event):
        while event.is_set() == False:
            for timestamp, data in self.network.listen():
                fourcc, data = data
                data["recv"] = timestamp
                self.sio.emit("telemetry", {fourcc: data}, namespace="/main")
            self.sio.sleep(0.001)
        return
