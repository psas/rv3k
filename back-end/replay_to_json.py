#!/usr/bin/env python
# replay_to_json.py is a script that dumps telemetry data into sent.txt.
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
import json
from psas_packet import io, messages
import socket


def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("127.0.0.1", 35001))
    network = io.Network(sock)
    collections = []
    while True:
        try:
            collection = {}
            for timestamp, data in network.listen():
                fourcc, values = data
                if fourcc not in messages.MESSAGES:
                    continue
                values["recv"] = timestamp
                collection[fourcc] = values
            if len(collection) > 0:
                collections.append(collection)
        except KeyboardInterrupt:
            sock.close()
            file = open("sent.txt", 'w')
            # Lines 40-65 format the output strings to match the JavaScript
            # formatting. Here are the formatting differences I observed.
            # 1. Python includes a space after each colon and comma.
            # 2. JavaScript converts "simple" floats into ints (ex: 0.0 -> 0).
            # 3. JavaScript: 0.0000015 Python: 1.5e-06
            # 4. JavaScript: 1.5e-7 Python: 1.5e-07
            for collection in collections:
                if "ADIS" in collection:
                    for key in ["Magn_X", "Magn_Y", "Magn_Z"]:
                        if key in collection["ADIS"]:
                            value = collection["ADIS"][key]
                            if value != 0:
                                if int(repr(value)[-1]) < 7:
                                    if '.' in repr(value):
                                        if value < 0:
                                            dps = (len(repr(value)) - 7) + \
                                                  int(repr(value)[-1])
                                        else:
                                            dps = (len(repr(value)) - 6) + \
                                                  int(repr(value)[-1])
                                    else:
                                        dps = int(repr(value)[-1])
                                    collection["ADIS"][key] = format(value, ('.' + str(dps) + 'f'))
                for key in collection:
                    output = "{\"" + key + "\": "
                    output += json.dumps(collection[key]) + '}'
                    output = output.replace(' ', '')
                    output = output.replace(".0,", ',')
                    output = output.replace(".0}", '}')
                    output = output.replace(":\"", ':')
                    output = output.replace("\",", ',')
                    output = output.replace("e-0", "e-")
                    file.write(output + '\n')
            file.close()
            return


if __name__ == "__main__":
    main()
