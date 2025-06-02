import socket
import threading
import sys

class ChatClient:
    def __init__(self, host, port):
        self.server_host = host
        self.server_port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        try:
            self.socket.connect((self.server_host, self.server_port))
        except Exception as e:
            print(f"[!] Connection failed: {e}")
            sys.exit(1)

        self.email = input("[+] Enter your email: ").strip()
        self.send_to_server(self.email)

        response = self.receive_from_server()
        # print(response)

        self.partner_email = input("[+] Enter the email of the person you want to talk to: ").strip()
        self.send_to_server(self.partner_email)

        self.start_chat()

    def send_to_server(self, message):
        try:
            self.socket.send(message.encode())
        except Exception as e:
            print(f"[!] Failed to send message: {e}")
            sys.exit(1)

    def receive_from_server(self):
        try:
            return self.socket.recv(1024).decode()
        except Exception as e:
            print(f"[!] Failed to receive data: {e}")
            sys.exit(1)

    def start_chat(self):
        print("[+] Chat started. Type your messages below. Type ':q' to quit.")
        threading.Thread(target=self.receive_messages, daemon=True).start()

        while True:
            try:
                message = input("")
                if message.strip() == ":q":
                    self.send_to_server(message)
                    print("[!] Exiting chat...")
                    self.socket.close()
                    sys.exit(0)

                self.send_to_server(message)

            except (KeyboardInterrupt, EOFError):
                print("\n[!] Disconnected by user.")
                self.socket.close()
                sys.exit(0)

    def receive_messages(self):
        while True:
            try:
                message = self.receive_from_server()
                if not message:
                    print("[!] Server closed the connection.")
                    self.socket.close()
                    sys.exit(0)
                print(f"\033[1;36m{message}\033[0m")  # cyan colored message
            except:
                print("[!] Connection lost.")
                sys.exit(1)

if __name__ == "__main__":
    ChatClient("127.0.0.1", 12346)
