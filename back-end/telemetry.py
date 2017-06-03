# telemetry.py listens for psas packets and sends them to the front-end.
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

from psas_packet import io
from psas_packet import messages
from Queue import Empty, Queue
import socket
from threading import Event, Thread
import logging
import traceback
import sys

class Telemetry:
    """Listens for psas packet data via listen() and emits them via sender()
    """

    def __init__(self, address, port, sio, lock=None, log=None):
        """Initializes data members of an instance of the Telemetry class"""
        self.address = address
        self.event = Event()
        self.port = port
        # From the Docs: (https://docs.python.org/2/library/queue.html)
        # "It is especially useful in threaded programming when information
        # must be exchanged safely between multiple threads. The Queue class
        # in this module implements all the required locking semantics."
        self.queue = Queue()
        self.queue_log = Queue()
        self.sio = sio
        # Instantiates the sender thread.
        self.thread = Thread(target=self.sender)
        self.thread.daemon = True


        self.loggerThread = Thread(target=self.log)
        self.loggerThread.daemon = True

        self.lock = lock
        self.log = log
        
        #error_log is a logging object that logs any error messages thrown in
        #telemetry.py to telemery_error.log
        self.error_log = logging.getLogger('telemetry')
        fh = logging.FileHandler('telemetry_error.log', mode='w')
        self.error_log.addHandler(fh)

    def listen(self):
        """Listens for incoming psas packets
        
        network.listen() returns a tuple of timestamp and data
        adds the tuple to the queue
        """
        print("The telemetry server is running.")
        # Starts the sender thread.
        self.thread.start()
        self.loggerThread.start()
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((self.address, self.port))
        network = io.Network(sock)
        while True:
            try:
                collection = []
                for timestamp, data in network.listen():
                    fourcc, values = data
                    if not fourcc in messages.MESSAGES:
                        continue
                    collection.append((fourcc, values, timestamp))

                # Enqueues (timestamp, data) without blocking.
                if len(collection) > 0:
                    self.queue.put_nowait(collection)


            except KeyboardInterrupt:
                sock.close()
                # Sets the shared event (breaks the sender thread's loop).
                self.event.set()
                # Waits until the sender thread terminates.
                self.thread.join()
                return

    def sender(self):
        """Emits a socketio event for each message that listen receives"""
        while self.event.is_set() == False:
            try:
                if self.queue:
                    send_data = {}
                    collection = self.queue.get_nowait()
                    for fourcc, values, timestamp in collection:
                        values["recv"] = timestamp
                        send_data[fourcc] = values
                    
                        # For performance testing
                        if fourcc == "SEQN":
                            print(values["Sequence"])
                    self.sio.emit("telemetry", send_data, namespace="/main")
                    self.queue_log.put_nowait(collection)
            except Empty:
                # This exception is raised every time the while loop does another pass
                # with no telemetry data is being received
                
                # self.error_log.error(traceback.format_exc())  # logs erro to file
                # traceback.print_exc(file=sys.stdout)
                pass
            except KeyError:
                self.error_log.error(traceback.format_exc())
                traceback.print_exc(file=sys.stdout)
                pass
            except ValueError:
                self.error_log.error(traceback.format_exc())
                traceback.print_exc(file=sys.stdout)
                pass
            except KeyboardInterrupt:
                return None
        return



    def log(self):
       while True:
            try:
                collection = self.queue_log.get_nowait()
                if self.lock and self.log:
                    for fourcc, values, timestamp in collection:
                        fourcc_message = messages.MESSAGES[fourcc]
                        encoded_values = fourcc_message.encode(values)
                        self.lock.acquire()
                        self.log.write(messages.HEADER.encode(fourcc_message, int(timestamp)))
                        self.log.write(encoded_values)
                        self.lock.release()

            except Empty:
                pass

            except KeyboardInterrupt:
                return None

