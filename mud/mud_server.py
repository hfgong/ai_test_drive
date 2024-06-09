# Use the following command to run:
#  python mud_server.py
# Then open a browser and nagivate to http://localhost:8000/

import os
import http.server
import socketserver
import json
import sqlite3
from functools import partial

class Room:
    def __init__(self, id, name, description):
        self.id = id
        self.name = name
        self.description = description

class Object:
    def __init__(self, id, name, description, location_id):
        self.id = id
        self.name = name
        self.description = description
        self.location_id = location_id

class Account:
    def __init__(self, id, username, password, name, description, health, location_id):
        self.id = id
        self.username = username
        self.password = password
        self.name = name
        self.description = description
        self.health = health
        self.location_id = location_id

class Command:
    def execute(self, game, account_id, args):
        pass

class MoveCommand(Command):
    def execute(self, game, account_id, args):
        direction = args[0]
        account = game.get_account_by_id(account_id)
        current_room = game.get_room_by_id(account.location_id)
        connected_rooms = game.get_connected_rooms(current_room.id)

        if direction == 'north' and current_room.id < 5:
            new_room_id = current_room.id + 1
            game.update_account_location(account_id, new_room_id)
            return f'You moved to Room {new_room_id}.'
        elif direction == 'south' and current_room.id > 1:
            new_room_id = current_room.id - 1
            game.update_account_location(account_id, new_room_id)
            return f'You moved to Room {new_room_id}.'
        else:
            return 'Invalid direction.'

class LookCommand(Command):
    def execute(self, game, account_id, args):
        account = game.get_account_by_id(account_id)
        current_room = game.get_room_by_id(account.location_id)
        accounts_in_room = game.get_accounts_in_room(current_room.id)
        account_names = [acc.name for acc in accounts_in_room if acc.id != account_id]

        if account_names:
            accounts_message = f"Players in the room: {', '.join(account_names)}"
        else:
            accounts_message = "You are alone in the room."

        return f"{current_room.description}\n{accounts_message}"

class Game:
    def __init__(self):
        self.rooms = []
        self.objects = []
        self.accounts = []
        self.commands = {
            'move': MoveCommand(),
            'look': LookCommand()
        }

    def setup_database(self):
      conn = sqlite3.connect('mud_game.db')
      c = conn.cursor()

      # Create tables
      c.execute('''CREATE TABLE IF NOT EXISTS rooms
                  (id INTEGER PRIMARY KEY,
                    name TEXT,
                    description TEXT)''')

      c.execute('''CREATE TABLE IF NOT EXISTS objects
                  (id INTEGER PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    location_id INTEGER,
                    FOREIGN KEY (location_id) REFERENCES rooms (id))''')


      # Insert demo data
      c.execute("INSERT OR IGNORE INTO rooms VALUES (1, 'Room 1', 'You are in a small, cozy room.')")
      c.execute("INSERT OR IGNORE INTO rooms VALUES (2, 'Room 2', 'You enter a dimly lit room.')")
      c.execute("INSERT OR IGNORE INTO rooms VALUES (3, 'Room 3', 'You find yourself in a spacious hall.')")
      c.execute("INSERT OR IGNORE INTO rooms VALUES (4, 'Room 4', 'You are in a narrow corridor.')")
      c.execute("INSERT OR IGNORE INTO rooms VALUES (5, 'Room 5', 'You step into a grand chamber.')")

      c.execute("INSERT OR IGNORE INTO objects VALUES (1, 'Key', 'A rusty old key.', 2)")

      # Create the accounts table with player information
      c.execute('''CREATE TABLE IF NOT EXISTS accounts
                  (id INTEGER PRIMARY KEY,
                    username TEXT UNIQUE,
                    password TEXT,
                    name TEXT,
                    description TEXT,
                    health INTEGER,
                    location_id INTEGER,
                    FOREIGN KEY (location_id) REFERENCES rooms (id))''')

      # Insert three user accounts with player information
      c.execute("INSERT OR IGNORE INTO accounts VALUES (1, 'player1', 'password1', 'Player 1', 'A brave adventurer.', 100, 1)")
      c.execute("INSERT OR IGNORE INTO accounts VALUES (2, 'player2', 'password2', 'Player 2', 'A cunning explorer.', 100, 1)")
      c.execute("INSERT OR IGNORE INTO accounts VALUES (3, 'player3', 'password3', 'Player 3', 'A wise sage.', 100, 1)")


      conn.commit()
      conn.close()

    def get_account_by_id(self, account_id):
        for account in self.accounts:
            if account.id == account_id:
                return account
        return None

    def get_room_by_id(self, room_id):
        for room in self.rooms:
            if room.id == room_id:
                return room
        return None

    def get_accounts_in_room(self, room_id):
        return [account for account in self.accounts if account.location_id == room_id]

    def get_connected_rooms(self, room_id):
      try:
          # Convert room_id to an integer
          room_id = int(room_id)
          
          # Rest of the function code remains the same
          connected_rooms = []
          if room_id > 1:
              connected_rooms.append(room_id - 1)
          if room_id < 5:
              connected_rooms.append(room_id + 1)
          return connected_rooms
      except ValueError:
          # Handle the case when room_id cannot be converted to an integer
          print(f"Invalid room_id: {room_id}")
          return []

    def update_account_location(self, account_id, location_id):
        account = self.get_account_by_id(account_id)
        if account:
            account.location_id = location_id

    def authenticate_user(self, username, password):
        for account in self.accounts:
            if account.username == username and account.password == password:
                return account.id
        return None

    def handle_command(self, account_id, command_text):
        parts = command_text.split(' ')
        command_name = parts[0]
        args = parts[1:]

        if command_name in self.commands:
            command = self.commands[command_name]
            return command.execute(self, account_id, args)
        else:
            return 'Invalid command.'

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.game = kwargs.pop('game')
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('index.html', 'rb') as file:
                self.wfile.write(file.read())
        elif self.path == '/login.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('login.html', 'rb') as file:
                self.wfile.write(file.read())
        elif self.path.startswith('/api/player'):
            account_id = int(self.path.split('=')[-1])
            account = self.game.get_account_by_id(account_id)
            if account:
                response = {
                    'id': account.id,
                    'name': account.name,
                    'description': account.description,
                    'health': account.health,
                    'location_id': account.location_id
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_error(404, 'Account not found')
        elif self.path.startswith('/api/rooms'):
            room_id = int(self.path.split('/')[-1])
            room = self.game.get_room_by_id(room_id)
            if room:
                connected_rooms = self.game.get_connected_rooms(room_id)
                objects = [obj for obj in self.game.objects if obj.location_id == room_id]
                response = {
                    'id': room.id,
                    'name': room.name,
                    'description': room.description,
                    'connected_rooms': connected_rooms,
                    'objects': [{'id': obj.id, 'name': obj.name, 'description': obj.description} for obj in objects]
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_error(404, 'Room not found')
        else:
            self.send_error(404, 'Not Found')

    def do_POST(self):
        if self.path == '/api/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode()
            login_data = json.loads(post_data)
            username = login_data['username']
            password = login_data['password']
            account_id = self.game.authenticate_user(username, password)
            if account_id:
                response = {'message': 'Login successful', 'account_id': account_id}
            else:
                response = {'message': 'Invalid username or password'}
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/api/command':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode()
            command_data = json.loads(post_data)
            command = command_data['command']
            account_id = int(command_data['account_id'])
            response_message = self.game.handle_command(account_id, command)
            response = {'message': response_message}
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404, 'Not Found')

def start_server(port, game):
    handler = partial(RequestHandler, game=game)
    httpd = socketserver.TCPServer(("", port), handler)
    print(f"Server running on port {port}")
    httpd.serve_forever()

def main():
    game = Game()
    if not os.path.exists('mud_game.db'):
        game.setup_database()

    # Add rooms, objects, and accounts to the game
    game.rooms = [
        Room(1, 'Room 1', 'You are in a small, cozy room.'),
        Room(2, 'Room 2', 'You enter a dimly lit room.'),
        Room(3, 'Room 3', 'You find yourself in a spacious hall.'),
        Room(4, 'Room 4', 'You are in a narrow corridor.'),
        Room(5, 'Room 5', 'You step into a grand chamber.')
    ]

    game.objects = [
        Object(1, 'Key', 'A rusty old key.', 2)
    ]

    game.accounts = [
        Account(1, 'player1', 'password1', 'Player 1', 'A brave adventurer.', 100, 1),
        Account(2, 'player2', 'password2', 'Player 2', 'A cunning explorer.', 100, 1),
        Account(3, 'player3', 'password3', 'Player 3', 'A wise sage.', 100, 1)
    ]

    start_server(8000, game)

if __name__ == "__main__":
    main()