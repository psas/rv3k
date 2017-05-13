#!/usr/bin/env python
# This file is a work in progress...
# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.
from argparse import ArgumentParser
from subprocess import Popen


def main():
    parser = ArgumentParser()
    parser.add_argument("-A", "--aprs", action="store_true")
    parser.add_argument("-T", "--telemetry", action="store_true")
    #parser.add_argument("-V", "--video", action="store_true")

    args = parser.parse_args()

    if args.aprs:
        a_pid = Popen(["python", "server.py", "-A"])
    if args.telemetry:
        t_pid = Popen(["python", "server.py", "-T"])
    #if args.video:
    #    v_pid = Popen(["python", "server.py", "-V"])

    try:
        while True:
            pass
    except KeyboardInterrupt:
        a_pid.terminate()
        t_pid.terminate()
        #v_pid.terminate()
        return

if __name__ == "__main__":
    main()
