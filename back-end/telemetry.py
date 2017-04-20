# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from psas_packet import io
import socket

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
