# Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva,
# Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael
# Ohl, Matthew Tighe
# ALL RIGHTS RESERVED
# [This program is licensed under the "GNU General Public License"]
# Please see the file COPYING in the source distribution of this
# software for license terms.

from aprs import AprsReceiver
import socketio
import unittest

sio = socketio.Server(logger=True, async_mode="threading")

# A raw APRS data
rawData = 'M0XER-4>APRS64,TF3RPF,WIDE2*,qAR,TF3SUT-2:!/.(M4I^C,O `DXa/A=040849|#B>@\"v90!+|UB9HDK-1>APRS,TCPXX*,qAX,CWOP-3:@200324z5628.98N/08457.00E_.../000g000t040r000p006P000h50b10067L....DsIP'


# TestAPRS inherit from the unittest, it instance the AprsReceiver
# and test the parse method with altitude, latitude, and longitude.
class TestAPRS(unittest.TestCase):
    def setUp(self):
        arps_Rec = AprsReceiver("127.0.0.1", 35002, sio)
        self.message = arps_Rec.parse(rawData.strip())

    def test_parsing_altitude(self):
        self.assertEqual(self.message['altitude'], 12450.7752)

    def test_parsing_latitude(self):
        self.assertEqual(self.message['latitude'], 64.11987367625208)

    def test_parsing_longitude(self):
        self.assertEqual(self.message['longitude'], -19.070654142799384)


if __name__ == '__main__':
    unittest.main()
