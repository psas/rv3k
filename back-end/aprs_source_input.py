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



class AprsSourceInput:
    def __init__(self, filename, is_parsed=False):
        """
        Sets up source inputs for the APRS server.
        """
        fileObj = open(filename, "r")
        self.data = fileObj.read().split("\n")
        fileObj.close()
        self.is_parsed = is_parsed

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


    def filter(self):
        self.filteredAprs = []
        counter = 1
        for line in self.data:
            if line:
                message = {} 
                name = "callsign" + str(counter)
                if not self.is_parsed:
                    parsedData = self.parse(line.strip())
                    message["altitude"] = parsedData["altitude"]
                    message["latitude"] = parsedData["latitude"]
                    message["longitude"] = parsedData["longitude"]
                else:
                    parsedData = line.strip().split(",")
                    name = parsedData[0]
                    message["altitude"] = parsedData[3]
                    message["latitude"] = parsedData[1]
                    message["longitude"] = parsedData[2]
                        
                self.filteredAprs.append({name : message})
                counter += 1


    def send(self):
        """
        Sends all raw APRS data to the APRS server.

        :return:
        """

        # set up socket and connect to sever
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        #sock.connect(("127.0.0.1", 35002))
        address = ("127.0.0.1", 35002) 

        try:        
            while True:
                self.filter()
                for aprs in self.filteredAprs:
                    print(aprs)
                    sock.sendto(json.dumps(aprs).encode("utf-8"), address)
                    time.sleep(3)
                time.sleep(5)

        finally:
            print("closing socket")
            sock.close()
   

def main():
    AprsSourceInput("aprs.parsed", True).send()


if __name__ == "__main__":
    main()  


