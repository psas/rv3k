# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

import sys
import os
import json
import socket
import aprs_source_input
import aprslib



is_parsed = aprs_source_input.is_parsed

class AprsReceiver:
    def __init__(self, address, port, sio):
        """
        This class is responsible for receiving and parsing raw APRS data

        :param address: ip address (str)
        :param port: port number (int)
        :param sio: socketio (object)
        """
        self.address = address
        self.port = port
        self.sio = sio

    def parse(self, aprs_packet):
        """
        Takes in a raw APRS packet and returns a parsed APRS data

        :param aprs_packet:  Raw APRS data (str)
        :return: Parsed APRS data (dict)
        """

        try:
            return aprslib.parse(aprs_packet.strip())
        except (aprslib.ParseError, aprslib.UnknownFormat) as error:
            print(error, aprs_packet) # TODO: Log error instead of print out


    def listen(self):
        """
        - Listens for socket connections
        - Receives raw APRS data and parses it
        - Sends parsed APRS data to front-end
        :return: None
        """

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
            print("==")
            data = {}
            try:
                if data_received and is_parsed:
                    # Send parsed APRS data to front-end in JSON format
                    data_received = json.loads(data_received.decode('utf-8'))
                    data["callsign"] = data_received["callsign"]
                else:
                    data_received = self.parse(data_received)
                    if not data_received:
                        continue
                    data["callsign"] = data_received["from"]
                # Stdout log

                data["latitude"] = data_received["latitude"]
                data["longitude"] = data_received["longitude"]
                data["altitude"] = data_received["altitude"]

                print(data) 
                self.sio.emit("recovery", data, namespace="/main")
                self.sio.sleep(0.1)
            except KeyboardInterrupt:
                return None





