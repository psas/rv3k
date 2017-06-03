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
import logging
import traceback
import sys


is_parsed = aprs_source_input.is_parsed

class AprsReceiver:
    def __init__(self, address, port, sio, lock=None, log=None):
        """
        This class is responsible for receiving and parsing raw APRS data

        :param address: ip address (str)
        :param port: port number (int)
        :param sio: socketio (object)
        """
        self.address = address
        self.port = port
        self.sio = sio

        # Sets up lock and log for synchronized logging (APRS + Telemetry)
        self.lock = lock
        self.log = log

        # error_log is a logging object that logs any error messages thrown
        # in aprs.py to aprs_error.log
        self.error_log = logging.getLogger('aprs')
        fh = logging.FileHandler('aprs_error.log', mode='w')
        self.error_log.addHandler(fh)


    def parse(self, aprs_packet):
        """
        Takes in a raw APRS packet and returns a parsed APRS data

        :param aprs_packet:  Raw APRS data (str)
        :return: Parsed APRS data (dict)
        """

        try:
            return aprslib.parse(aprs_packet.strip())
        except (aprslib.ParseError, aprslib.UnknownFormat) as error:
            self.error_log.error(traceback.format_exc())
            traceback.print_exc(file=sys.stdout)


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
            values = {}
            timestamp = time.time()
            try:
                # Expecting data received is in JSON format if 
                # is_parsed is true
                if data_received and is_parsed:
                    data_received = json.loads(data_received.decode('utf-8'))
                    values["Callsign"] = data_received["callsign"]

                # Expecting data received is a raw APRS if is_parsed is false
                elif data_received:
                    data_received = self.parse(data_received)
                    if not data_received:
                        continue
                    values["Callsign"] = data_received["from"]
                else:
                    continue


                values["Latitude"] = float(data_received["latitude"])
                values["Longitude"] = float(data_received["longitude"])
                values["Altitude"] = float(data_received["altitude"])

                if self.lock and self.log:
                    # Obtain MESSAGES information for APRS fourcc
                    fourcc_message = messages.MESSAGES["APRS"]

                    # Encode values
                    encoded_values = fourcc_message.encode(values)
                
                    # Synchronously log binary data to the file
                    self.lock.acquire()
                    self.log.write(messages.HEADER.encode(fourcc_message, int(timestamp)))
                    self.log.write(encoded_values)
                    self.lock.release()
                values["recv"] = timestamp

                # Send parsed APRS data to front-end in JSON format
                self.sio.emit("recovery", values, namespace="/main")
            except KeyError:
                self.error_log.error(traceback.format_exc())
                traceback.print_exc(file=sys.stdout)
            except KeyboardInterrupt:
                return None





