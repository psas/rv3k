# This file is responsible for receiving raw/parsed APRS and sends
# a parsed APRS data (in JSON format) to the front-end.
#
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

import json
import socket
import aprs_source_input
import aprslib
import time
from psas_packet import messages



is_parsed = aprs_source_input.is_parsed

class AprsReceiver:
    def __init__(self, address, port, sio, lock=None, log=None, error_log=None):
        """
        This class is responsible for receiving and parsing raw APRS data

        :param address: ip address (str)
        :param port: port number (int)
        :param sio: socketio (object)
        """
        self.address = address
        self.port = port
        self.sio = sio
        self.lock = lock
        self.log = log
        self.error_log = error_log

    def parse(self, aprs_packet):
        """
        Takes in a raw APRS packet and returns a parsed APRS data

        :param aprs_packet:  Raw APRS data (str)
        :return: Parsed APRS data (dict)
        """

        try:
            return aprslib.parse(aprs_packet.strip())
        except (aprslib.ParseError, aprslib.UnknownFormat) as error:
            print(error, aprs_packet) # TODO: log error or print in std err


    def listen(self):
        """
        - Listens for socket connections
        - Receives raw APRS data and parses it
        - Sends parsed APRS data to front-end
        :return: None
        """

        print("APRS Server running")
        # Set up socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        addr = (self.address, self.port)

        # Binds address to this socket
        sock.bind(addr)


        # Start receiving data
        while True:
            # Receive data from the socket. Returns data in string format
            # and address of the socket sending the data
            data_received, address = sock.recvfrom(1024)
            data = {}
            timestamp = time.time()
            try:
                # Expecting data received is in JSON format is 
                # is_parsed is true
                if data_received and is_parsed:
                    data_received = json.loads(data_received.decode('utf-8'))
                    data["Callsign"] = data_received["callsign"]

                # Expecting data received is a raw APRS if is_parsed is false
                elif data_received:
                    data_received = self.parse(data_received)
                    if not data_received:
                        continue
                    data["Callsign"] = data_received["from"]
                else:
                    continue


                data["Latitude"] = float(data_received["latitude"])
                data["Longitude"] = float(data_received["longitude"])
                data["Altitude"] = float(data_received["altitude"])
                fourcc_message = messages.MESSAGES["APRS"]
                encoded_data = fourcc_message.encode(data)
                if self.lock and self.log:
                    self.lock.acquire()
                    self.log.write(messages.HEADER.encode(fourcc_message, int(timestamp)))
                    self.log.write(encoded_data)
                    self.lock.release()
                data["recv"] = timestamp
                # Stdout log

                # Send parsed APRS data to front-end in JSON format
                self.sio.emit("recovery", data, namespace="/main")
                self.sio.sleep(0.1)
            except KeyboardInterrupt:
                return None





