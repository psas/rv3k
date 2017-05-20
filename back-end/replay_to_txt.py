#!/usr/bin/env python
# This file is a work in progress...
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from psas_packet import io
import socket

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("127.0.0.1", 35001))
    network = io.Network(sock)
    packets = []
    while True:
        try:
            for timestamp, data in network.listen():
                fourcc, data = data
                data["recv"] = timestamp
                packets.append({fourcc: data})
        except KeyboardInterrupt:
            sock.close()
            file = open("foo.txt", 'w')
            for packet in packets:
                file.write(str(packet) + '\n')
            file.close()
            return

if __name__ == "__main__":
    main()
