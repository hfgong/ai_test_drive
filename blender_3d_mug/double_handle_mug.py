import bpy
import math

# Delete the default cube
if "Cube" in bpy.data.objects:
    bpy.data.objects["Cube"].select_set(True)
    bpy.ops.object.delete()

# Create a new cylinder for the mug body
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.1, location=(0, 0, 0))
mug_body = bpy.context.active_object

# Create a new cylinder for the inner part of the mug body
bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.1, location=(0, 0, 0))
inner_mug_body = bpy.context.active_object

# Subtract the inner part from the mug body
bool_modifier = mug_body.modifiers.new(name='Boolean', type='BOOLEAN')
bool_modifier.operation = 'DIFFERENCE'
bool_modifier.object = inner_mug_body
bpy.context.view_layer.objects.active = mug_body
bpy.ops.object.modifier_apply(modifier=bool_modifier.name)

# Delete the inner mug body object
bpy.ops.object.select_all(action='DESELECT')
inner_mug_body.select_set(True)
bpy.ops.object.delete()

# Create a new torus for the mug rim
bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.01, location=(0, 0, 0.05))
mug_rim = bpy.context.active_object

# Create a new torus for the left handle
bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.005, location=(-0.05, 0, 0.0))
left_handle = bpy.context.active_object

# Rotate the left handle by 90 degrees
left_handle.rotation_euler[0] = math.radians(90)

# Delete the right half of the vertices of the left handle
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.object.mode_set(mode='OBJECT')
for vert in left_handle.data.vertices:
    if vert.co.x > 0:
        vert.select = True
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.delete(type='VERT')
bpy.ops.object.mode_set(mode='OBJECT')

# Create a new torus for the right handle
bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.005, location=(0.05, 0, 0.0))
right_handle = bpy.context.active_object

# Rotate the right handle by 90 degrees
right_handle.rotation_euler[0] = math.radians(90)

# Delete the left half of the vertices of the right handle
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.object.mode_set(mode='OBJECT')
for vert in right_handle.data.vertices:
    if vert.co.x < 0:
        vert.select = True
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.delete(type='VERT')
bpy.ops.object.mode_set(mode='OBJECT')

# Join the mug body, rim, and handles
bpy.ops.object.select_all(action='DESELECT')
mug_body.select_set(True)
mug_rim.select_set(True)
left_handle.select_set(True)
right_handle.select_set(True)
bpy.context.view_layer.objects.active = mug_body
bpy.ops.object.join()

# Rename the final object
mug_body.name = "Coffee Mug"

# Center the mug in the viewer
bpy.ops.object.select_all(action='DESELECT')
mug_body.select_set(True)

# Set the context to the 3D viewport
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for region in area.regions:
            if region.type == 'WINDOW':
                override = {'area': area, 'region': region}
                bpy.ops.view3d.view_selected(override)
                break
