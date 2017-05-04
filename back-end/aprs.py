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
        print("aprs ready")

        # Listen for connection and accept

        # Start receiving data
        while True:
            data, address = sock.recvfrom(1024)
            try:
                if data:
                    # Send parsed APRS data to front-end
                    data = json.loads(data.decode('utf-8'))
                    print(data) 
                    self.sio.emit("recovery", data, namespace="/main")
                    self.sio.sleep(0.1)
            except KeyboardInterrupt:
                return None





