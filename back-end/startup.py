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

    # create a ArgumentParser and add command line arguments to it
    parser = ArgumentParser()
    parser.add_argument("-t", "--test", action="store_true")
    parser.add_argument("-A", "--aprs", action="store_true")
    parser.add_argument("-T", "--telemetry", action="store_true")

    # if an invalid command line argument is found, print the help
    # message
    args = parser.parse_args()
    if True not in vars(args).values():
        parser.print_help()
        return
    
    # Build the command to start server.py with the appropriate 
    # options
    command = ["python2", "server.py"]

    if args.test:
        command.append("-t")
    if args.aprs:
        command.append("-A")
    if args.telemetry:
        command.append("-T")

    if not any([args.aprs, args.telemetry]):
        parser.error("At least one of the arguments (-A | -T) is required")
        return

    # this command runs server.py with its arguments
    proc = Popen(command)

    try:
        # This loop checks if subprocess is still running. If the
        # subprocess have stopped, then it is restarted.
        while True:
            if proc.poll() is not None:
                proc = Popen(command)
    except KeyboardInterrupt:
        proc.terminate()
        return


if __name__ == "__main__":
    main()
