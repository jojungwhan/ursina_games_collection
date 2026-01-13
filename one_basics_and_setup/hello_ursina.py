from ursina import *

# Create the game window
app = Ursina()

# Variables - store information
my_name = "Student"
cube_size = 2
cube_color = color.red

# Print to console
print("Hello, Ursina!")
print(f"My name is {my_name}")

# Create a 3D cube
my_cube = Entity(
    model='cube',
    color=cube_color,
    scale=cube_size
)

# Run the game
app.run()
