from psas_packet import io
import socket
import socketio

class Telemetry:
    def __init__(self, address, port, sio):
        self.address = address
        self.port = port
        self.sio = sio
    
    def listen(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((self.address, self.port))
        network = io.Network(sock)
        while True:
            try:
                for timestamp, data in network.listen():
                    fourcc, data = data
                    data["recv"] = timestamp
                    self.sio.emit("telemetry", {fourcc: data},
                                  namespace="/main")
                self.sio.sleep(0.001)
            except KeyboardInterrupt:
                sock.close()
                return
