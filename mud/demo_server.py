# Use the following command to run:
#  python demo_server.py
# Then open a browser and nagivate to http://localhost:8000/

import os
import http.server
import socketserver
import json
import sqlite3

# Database setup
def setup_database():
    conn = sqlite3.connect('demo_game.db')
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

def get_player_info_by_account(account_id):
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    c.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
    player = c.fetchone()
    conn.close()
    return player

def update_player_location(account_id, location_id):
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    c.execute("UPDATE accounts SET location_id = ? WHERE id = ?", (location_id, account_id))
    conn.commit()
    conn.close()

# Room-related functions
def get_players_in_room(room_id):
    print(f"Getting players in room {room_id}")
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    query = "SELECT * FROM accounts WHERE location_id = ?"
    print(f"Executing query: {query} with room_id: {room_id}")
    c.execute(query, (room_id,))
    players = c.fetchall()
    conn.close()
    return players

def get_connected_rooms(room_id):
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

def get_room_info(room_id):
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    c.execute("SELECT * FROM rooms WHERE id = ?", (room_id,))
    room = c.fetchone()
    conn.close()
    return room

# Object-related functions
def get_objects_in_room(room_id):
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    c.execute("SELECT * FROM objects WHERE location_id = ?", (room_id,))
    objects = c.fetchall()
    conn.close()
    return objects

def authenticate_user(username, password):
    conn = sqlite3.connect('mud_game.db')
    c = conn.cursor()
    c.execute("SELECT id FROM accounts WHERE username = ? AND password = ?", (username, password))
    account = c.fetchone()
    conn.close()
    return account[0] if account else None

# HTTP request handler
class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        elif self.path == '/login.html':
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        elif self.path.startswith('/api/player'):
            account_id = int(self.path.split('=')[-1])
            player = get_player_info_by_account(account_id)
            # player = get_player_info(player_id)
            response = {
                'id': player[0],
                'name': player[1],
                'description': player[2],
                'health': player[3],
                'location_id': player[4]
            }
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        elif self.path.startswith('/api/rooms'):
            room_id = int(self.path.split('/')[-1])
            room = get_room_info(room_id)
            connected_rooms = get_connected_rooms(room_id)
            objects = get_objects_in_room(room_id)
            response = {
                'id': room[0],
                'name': room[1],
                'description': room[2],
                'connected_rooms': connected_rooms,
                'objects': objects
            }
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode()
            login_data = json.loads(post_data)
            username = login_data['username']
            password = login_data['password']
            account_id = authenticate_user(username, password)
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

            if command.startswith('move'):
                direction = command.split(' ')[1]
                player = get_player_info_by_account(account_id)
                current_room_id = int(player[6])  # Convert current_room_id to an integer
                connected_rooms = get_connected_rooms(current_room_id)

                if direction == 'north' and current_room_id < 5:
                    new_room_id = current_room_id + 1
                    update_player_location(account_id, new_room_id)
                    response = {'message': f'You moved to Room {new_room_id}.'}
                elif direction == 'south' and current_room_id > 1:
                    new_room_id = current_room_id - 1
                    update_player_location(account_id, new_room_id)
                    response = {'message': f'You moved to Room {new_room_id}.'}
                else:
                    response = {'message': 'Invalid direction.'}
            elif command == 'look':
                player = get_player_info_by_account(account_id)
                current_room_id = int(player[6])
                room = get_room_info(current_room_id)
                players_in_room = get_players_in_room(current_room_id)
                print(f"Players in room {current_room_id}: {players_in_room}")
                player_names = [p[3] for p in players_in_room if p[0] != account_id]
                print(f"Player names: {player_names}")
                if player_names:
                    players_message = f"Players in the room: {', '.join(player_names)}"
                else:
                    players_message = "You are alone in the room."
                response = {'message': f"{room[2]}\n{players_message}"}
            else:
                response = {'message': 'Invalid command.'}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

# Server setup
def start_server(port):
    httpd = socketserver.TCPServer(("", port), RequestHandler)
    print(f"Server running on port {port}")
    httpd.serve_forever()

# Main function
def main():
    if not os.path.exists('demo_game.db'):
        setup_database()
    start_server(8000)

if __name__ == "__main__":
    main()