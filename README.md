# Chat Application

A real-time chat application built with a hybrid architecture using Python, Node.js, and MongoDB.

## Architecture

The application consists of three main components:

1. **Python Socket Server** (`server.py`)
   - Handles real-time messaging
   - Manages client connections
   - Uses Python's socket library for communication

2. **Python Client** (`client.py`)
   - Provides the client interface
   - Connects to the socket server
   - Handles sending and receiving messages

3. **Node.js Server** (`server/`)
   - Manages the backend API
   - Handles data persistence with MongoDB
   - Provides RESTful endpoints for the application

## Technologies Used

- **Backend**:
  - Python (Socket Programming)
  - Node.js
  - MongoDB (Database)
  - WebSocket (Real-time Communication)

## Setup Instructions

1. **Install Dependencies**
   - Python requirements:
     ```bash
     pip install socket
     ```
   - Node.js requirements:
     ```bash
     cd server
     npm install
     ```

2. **Database Setup**
   - Install and start MongoDB
   - Configure MongoDB connection in the Node.js server

3. **Running the Application**
   - Start the Node.js server:
     ```bash
     cd server
     npm start
     ```
   - Start the Python socket server:
     ```bash
     python server.py
     ```
   - Run the client:
     ```bash
     python client.py
     ```

## Project Structure

```
Message/
├── README.md
├── client.py          # Python socket client
├── server.py          # Python socket server
└── server/            # Node.js backend server
    ├── package.json
    └── node_modules/
    └── app.js
    └── app
      └── models
      └── routes
      └── controller
      └── config
      └── middleware
```

## Features

- Real-time messaging
- Message persistence using MongoDB
- Multiple client support
- Hybrid architecture combining Python and Node.js
