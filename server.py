import socket 
from threading import Thread

class Server:

    Mails = []
    Conversations = []

    def __init__(self, HOST, PORT):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind((HOST, PORT))
        self.socket.listen(5)
        print('[+] Server waiting for connection...')

    def listen(self):
        while True:
            client, addr = self.socket.accept()
            print(f"[+] Connection from {str(addr)}")

            email = client.recv(1024).decode()
            if not any(user['email'] == email for user in Server.Mails):
                Server.Mails.append({'email': email, 'socket': client})
            else:
                client.send("Email already exists".encode())
                client.close()
                return

            client.send("Enter the email of the person you want to talk to: ".encode())
            reciver_email = client.recv(1024).decode()
            reciver = {}
            for i in Server.Mails:
                if i['email'] == reciver_email:
                    reciver = i
                    break
            if reciver == {}:
                client.send("Enter the exist user".encode())
                client.close()
                return
                        
            Server.Conversations.append({
                'sender': {'email': email, 'socket': client},
                'reciver': reciver,
                'messages': [],
                'is_open': True
            })
            Thread(target=self.handle_conversation, args=({'email': email, 'socket': client},)).start()
        
    def handle_conversation(self, client):
        while True:
            email = client['email']
            socket = client['socket']
            reciver_email = ""
            reciver_socket = ""

            for conversation in Server.Conversations:
                if conversation['is_open'] == True and conversation['reciver']['email'] == email and conversation['reciver']['socket'] == socket or conversation['sender']['email'] == email and conversation['sender']['socket'] == socket:
                    reciver_email = conversation['reciver']['email']
                    reciver_socket = conversation['reciver']['socket']
                    break
            
            while True:
                client_message = client.recv(1024).decode()
                if client_message.split(":")[1].strip() == "q" or not client_message.strip():
                    for conversation in Server.Conversations:
                        if (conversation['sender']['email'] == email and conversation['sender']['socket'] == socket) or \
                        (conversation['reciver']['email'] == email and conversation['reciver']['socket'] == socket):
                            conversation['is_open'] = False
                            break

                    self.send_message(self, client = {"email": email, "socket": socket}, message = "The conversation has been closed by the sender", reciver_email = {"email": reciver_email, "socket": reciver_socket})
                    Server.Mails.remove({"email": email, "socket": socket})
                    Server.Conversations.remove(conversation)
                    socket.close()
                    break
                else:
                    self.send_message(self, client = {"email": email, "socket": socket}, message = client_message, reciver_email = {"email": reciver_email, "socket": reciver_socket})
    
    def send_message(self, client, message, reciver_email):
        for conversation in Server.Conversations:
            if conversation['is_open'] == True and conversation['reciver']['email'] == client['email'] and conversation['reciver']['socket'] == client['socket'] or conversation['sender']['email'] == client['email'] and conversation['sender']['socket'] == client['socket']:
                conversation['messages'].append(message)
                reciver_email['socket'].send(message.encode())
                break
                

if __name__ == "__main__":
    server = Server("127.0.0.1", 12345)
    server.listen()