import socket
from threading import Thread

class Client:
    def __init__(self, email, socket):
        self.email = email
        self.socket = socket

class Conversation:
    def __init__(self, sender: Client, receiver: Client):
        self.sender = sender
        self.receiver = receiver
        self.messages = []
        self.is_open = True

    def involves(self, client: Client):
        return self.sender.email == client.email or self.receiver.email == client.email

    def get_partner(self, client: Client):
        return self.receiver if self.sender.email == client.email else self.sender

class Server:
    def __init__(self, host, port):
        self.clients = []
        self.conversations = []
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((host, port))
        self.server_socket.listen(5)
        print("[+] Server started, waiting for connections...")

    def start(self):
        while True:
            client_socket, addr = self.server_socket.accept()
            print(f"[+] Connection from {addr}")
            Thread(target=self.register_client, args=(client_socket,)).start()

    def register_client(self, client_socket):
        try:
            email = client_socket.recv(1024).decode().strip()
            if any(c.email == email for c in self.clients):
                print(f"[!] Email already in use: {email}")
                client_socket.send("Email already in use. Connection closing.".encode())
                client_socket.close()
                return

            new_client = Client(email=email, socket=client_socket)
            self.clients.append(new_client)
            print(f"[+] Registered client: {email}")

            client_socket.send("Enter the email of the person you want to talk to: ".encode())
            receiver_email = client_socket.recv(1024).decode().strip()

            receiver = next((c for c in self.clients if c.email == receiver_email), None)
            if not receiver:
                client_socket.send("User not found. Connection closing.".encode())
                client_socket.close()
                self.clients.remove(new_client)
                return

            conversation = self.find_or_create_conversation(new_client, receiver)
            Thread(target=self.handle_conversation, args=(new_client, conversation)).start()

        except Exception as e:
            print(f"[!] Error registering client: {e}")
            client_socket.close()

    def find_or_create_conversation(self, sender, receiver):
        for conv in self.conversations:
            if ((conv.sender.email == sender.email and conv.receiver.email == receiver.email) or
                (conv.sender.email == receiver.email and conv.receiver.email == sender.email)):
                conv.is_open = True
                return conv

        conv = Conversation(sender=sender, receiver=receiver)
        self.conversations.append(conv)
        return conv

    def handle_conversation(self, client, conversation):
        partner = conversation.get_partner(client)

        try:
            while True:
                message = client.socket.recv(1024).decode().strip()
                if not message:
                    break

                if message.endswith(":q"):
                    conversation.is_open = False
                    self.send_to_client(partner, f"[{client.email}] has ended the conversation.")
                    break

                formatted = f"[{client.email}] {message}"
                conversation.messages.append(formatted)
                self.send_to_client(partner, formatted)

        except Exception as e:
            print(f"[!] Error in conversation: {e}")

        finally:
            print(f"[-] Conversation closed for {client.email}")
            client.socket.close()
            self.clients = [c for c in self.clients if c.email != client.email]
            self.conversations = [c for c in self.conversations if c.is_open]

    def send_to_client(self, client, message):
        try:
            client.socket.send(message.encode())
        except:
            print(f"[!] Failed to send message to {client.email}")

if __name__ == "__main__":
    server = Server("127.0.0.1", 12346)
    server.start()
