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
        self.address = address
        self.port = port
        self.sio = sio

    def parse(self, aprs_packet):
        try:
            return aprslib.parse(aprs_packet.strip())
        except (aprslib.ParseError, aprslib.UnknownFormat) as error:
            print(error, aprs_packet)

    def listen(self):
        sock = socket.socket()
        addr = (self.address, self.port)
        sock.bind(addr)
        print("aprs ready")
        sock.listen(1)
        conn, client_addr = sock.accept()
        while True:
            data = conn.recv(1024)
            try:
                if data:
                    parsed_aprs = self.parse(data)
                    if parsed_aprs:
                        self.sio.emit("recovery", parsed_aprs, namespace="/main")
                        self.sio.sleep(0.1)
            except KeyboardInterrupt:
                return


