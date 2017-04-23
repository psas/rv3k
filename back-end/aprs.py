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
import aprslib
import socket

"""
# Experiment

API_KEY = "99303.dKx67VHTL2LPi"
APRS_FI_API = "https://api.aprs.fi/api/get?apikey=" + API_KEY + "&what=loc&"


def get(name):
	url = APRS_FI_API + "name=" + name + "&format=json"
	print(url)
	return requests.get(url)


def main():
	response = get("CW6028")
	print(response.json())
"""


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
        sock = socket.socket()
        addr = (self.address, self.port)

        # Binds address to this socket
        sock.bind(addr)
        print("aprs ready")

        # Listen for connection and accept
        sock.listen(1)
        conn, client_addr = sock.accept()

        # Start receiving data
        while True:
            data = conn.recv(1024)
            try:
                if data:
                    parsed_aprs = self.parse(data)

                    # Send parsed APRS data to front-end
                    if parsed_aprs:
                        self.sio.emit("recovery", parsed_aprs, namespace="/main")
                        self.sio.sleep(0.1)
            except KeyboardInterrupt:
                return None





