# This file is responsible for sending sample APRS data to the APRS 
# back-end server (see aprs.py).
#
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

import socket
import os
import sys
import time
import aprslib
import json

is_parsed = True
filename = "aprs.parsed"

# NOTES (terms used): 
# Raw APRS data: see aprs.fi/?c=raw for example.
# Parsed APRS data: data obtained after decoding and parsed raw APRS data.


class AprsSourceInput:
    def __init__(self, filename):
        """
        Sets up source inputs for the APRS server.
        """
        fileObj = open(filename, "r")

        # Splits up contents of the file per line
        self.data = [f for f in fileObj.read().split("\n") if f]
        fileObj.close()


    def filter(self):
        """
        Parses each parsed APRS data and converts it to a JSON object.
        
        :return:
        """
        self.filteredAprs = []
        for line in self.data:
            if line:
                message = {} 
                data = line
                if is_parsed:
                    parsedData = line.strip().split(",")
                    message["callsign"] = parsedData[0]
                    message["altitude"] = parsedData[3]
                    message["latitude"] = parsedData[1]
                    message["longitude"] = parsedData[2]
                    data = json.dumps(message).encode("utf-8")
                        
                self.filteredAprs.append(data)


    def send(self):
        """
        Sends all raw APRS data to the APRS server.

        :return:
        """

        # set up UDP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        address = ("127.0.0.1", 35002) 
        if is_parsed:
            self.filter()
            self.data = self.filteredAprs

        # Continously send data to the server
        try:        
            while True:
                for aprs in self.data:
                    print(aprs)
                    sock.sendto(aprs, address)
                    time.sleep(2)
                time.sleep(3)
        except KeyboardInterrupt:
            pass
        finally:
            print("closing socket")
            sock.close()
   

def main():
    AprsSourceInput(filename).send()


if __name__ == "__main__":
    main()  


