import socket
from threading import Thread
import os

class Client:

    def __init__(self, HOST, PORT):
        self.socket = socket.socket()
        self.socket.connect((HOST, PORT))
        self.email = input("Enter your email: ")
        self.socket.send(self.email.encode())
        self.reciver_email = input("Enter the email of the person you want to talk to: ")
        self.socket.send(self.reciver_email.encode())
        self.talk_to_server()

    def talk_to_server(self):
        Thread(target=self.receive_message).start()
        self.send_message()

    def send_message(self):
        while True:
            client_input = input("")
            if client_input.strip().lower() == "q":
                self.socket.send(f"{self.email}: q".encode())
                os._exit(0)
            client_message = f"{self.email}: {client_input}"
            self.socket.send(client_message.encode())

    def receive_message(self):
        while True:
            try:
                server_message = self.socket.recv(1024).decode()
                if not server_message.strip():
                    os._exit(0)
                print("\033[1;31;40m" + server_message + "\033[0m")
            except:
                os._exit(0)

if __name__ == '__main__':
    Client('127.0.0.1', 12345)
