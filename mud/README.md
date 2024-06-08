# A Python and Web based MUD game engine.

There two versions, both generated using Claude AI.

 * demo_server.py - Functions based implementation.
 * mud_server.py - Classes based implementation.

## Prompt list

 * I would like to develop a Python based MUD game engine, help me first list the basic functionalities I must support
 * Let's use Python simple HTTP as the backend and browser as the front end, to further simplify it, we use SQLite which is already built into recent Python releases as database to store the player and object information. Help me write the code outline.
 * Create a simple demo server, with five demo rooms with mock descriptions properly connected, allow 1 predefined player to connect and move in room, with one object in one of the room, some demo properties of player
 * Could you help me add a web UI?
 * Add a look command to show the description of the room
 * Could you make it support multiple players? Add three users with passwords, add login support, allow multiple users to present in the same room and look at each other.
 * Now let's make the code more organized. Could you help me make each of the concept a class with instances. For example, we have Room class and a couple of Room instances for each room, also make commands into Classes with a base class. For reference, I put the whole Python code below, with some minor modifications by me.

## Notes
Omitted some bug fixes prompts.
