# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from psas_packet import io
import socket
import sched
import time
import threading
import copy
from Queue import Queue

class Telemetry:
    def __init__(self, address, port, sio):
        self.address = address
        self.port = port
        self.sio = sio
        self.data = {}
    
    def sender(self, Q):
        print("sender activate")
        while True:
            if Q:
                data = Q.get()
                self.sio.emit("telemetry", data, namespace="/main")


    def start(self):
        print("telemetry start")
        Q = Queue()
        sender_thread = threading.Thread(target=self.sender, args=(Q,))
        
        thread = threading.Thread(target=self.listen, args=(Q,))
        thread.start()
        sender_thread.start()

    def listen(self, Q):
        print("listening")
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((self.address, self.port))
        network = io.Network(sock)
        while True:
            collection = []
            try:
                for timestamp, data in network.listen():
                    fourcc, data = data
                    data["recv"] = timestamp
                    collection.append({fourcc : data})

                if len(collection) > 0:
                    Q.put(collection)
            except KeyboardInterrupt:
                sock.close()
                return
