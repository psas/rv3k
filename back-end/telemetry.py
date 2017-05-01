# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from psas_packet import io
from Queue import Empty, Queue
import socket
from threading import Event, Thread

class Telemetry:
    """Listens for psas packet data via listen() and emits them via sender()
    """
    def __init__(self, address, port, sio):
        """Initializes data members of an instance of the Telemetry class"""
        self.address = address
        self.event = Event()
        self.port = port
        self.queue = Queue()
        self.sio = sio
        self.thread = Thread(target=self.sender)
    
    def listen(self):
        """Listens for incoming psas packets
        
        network.listen() returns a tuple of timestamp and data
        adds the tuple to the queue
        """
        print("The telemetry server is running.")
        self.thread.start()
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((self.address, self.port))
        network = io.Network(sock)
        while True:
            try:
                for timestamp, data in network.listen():
                    self.queue.put_nowait((timestamp, data))
            except KeyboardInterrupt:
                sock.close()
                self.event.set()
                self.thread.join()
                return
    
    def sender(self):
        """Emits a socketio event for each message that listen receives"""
        while self.event.is_set() == False:
            try:
                timestamp, data = self.queue.get_nowait()
                fourcc, data = data
                data["recv"] = timestamp
                self.sio.emit("telemetry", {fourcc: data}, namespace="/main")
            except Empty:
                pass
        return
