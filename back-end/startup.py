#!/usr/bin/env python
# startup.py is a startup script for the various back-end servers.
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
    parser.add_argument("-t", "--test", action="store_true")
    parser.add_argument("-A", "--aprs", action="store_true")
    parser.add_argument("-T", "--telemetry", action="store_true")
    # parser.add_argument("-V", "--video", action="store_true")

    args = parser.parse_args()
    if True not in vars(args).values():
        parser.print_help()
        return

    # The testing flag is only applied to the telemetry server. This is
    # appropriate because the test webpage only supports the telemetry server.
    tel_args = ["python2", "server.py", "-T"]
    if args.test:
        tel_args = ["python2", "server.py", "-t", "-T"]
    if args.aprs:
        a_pid = Popen(["python2", "server.py", "-A"])
    if args.telemetry:
        t_pid = Popen(tel_args)
    # if args.video:
    #     v_pid = Popen(["python2", "server.py", "-V"])

    try:
        # This loop checks if each subprocess is still running. If any of the
        # subprocesses have stopped, then they're restarted.
        while True:
            if args.aprs:
                if a_pid.poll() is not None:
                    a_pid = Popen(["python2", "server.py", "-A"])
            if args.telemetry:
                if t_pid.poll() is not None:
                    t_pid = Popen(tel_args)
            # if args.video:
            #     if v_pid.poll() is not None:
            #         v_pid = Popen(["python2", "server.py", "-V"])
    except KeyboardInterrupt:
        if args.aprs:
            a_pid.terminate()
        if args.telemetry:
            t_pid.terminate()
        # if args.video:
        #     v_pid.terminate()
        return

if __name__ == "__main__":
    main()
