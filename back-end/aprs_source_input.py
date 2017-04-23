# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

import socket
import time

class AprsSourceInput:
    def __init__(self):
        """
        Sets up source inputs for the APRS server.
        """
        fileObj = open("aprs.raw", "r")
        self.data = fileObj.read().split("\n")
        fileObj.close()
        

    def send(self):
        """
        Sends all raw APRS data to the APRS server.

        :return:
        """

        # set up socket and connect to sever
        sock = socket.socket()
        sock.connect(("127.0.0.1", 35002))

        i = 0

        while True:
            print(i)

            for raw_aprs in self.data:
                sock.send(raw_aprs.encode())
            time.sleep(1)
            i += 1
        sock.close()


def main():
    AprsSourceInput().send()


if __name__ == "__main__":
    main()  


