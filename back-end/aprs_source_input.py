import socket
import time

class AprsSourceInput:
    def __init__(self):
        fileObj = open("aprs.raw", "r")
        self.data = fileObj.read().split("\n")
        fileObj.close()
        

    def send(self):
        sock = socket.socket()
        sock.connect(("127.0.0.1", 35002))
        i = 0
        while True:
            print(i)
            for raw_aprs in self.data:
                sock.send(raw_aprs)
            time.sleep(1)
            i += 1

        sock.close()


def main():
    AprsSourceInput().send()


if __name__ == "__main__":
    main()  


