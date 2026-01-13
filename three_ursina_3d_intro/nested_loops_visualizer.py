import sys
from pathlib import Path

# Add workspace root to Python path for imports when running directly
workspace_root = Path(__file__).parent.parent.parent
if str(workspace_root) not in sys.path:
    sys.path.insert(0, str(workspace_root))

from ursina import *
from ursina_games_collection.visual_helper import VisualLoop


app = Ursina()
window.color = color.rgb(245, 248, 255)

# Set speed a little faster so each step is visible
visualizer = VisualLoop(speed=0.12)


def run_line():
    # Single for loop: stack cubes in a row along x-axis
    for x in range(6):
        visualizer.show_step(x)


def run_floor():
    # Nested for loop: create floor tiles
    for x in range(4):
        for y in range(4):
            visualizer.show_step(x, y)


def run_cube():
    # Triple nested for loop: create 3x3x3 cube
    for x in range(3):
        for y in range(3):
            for z in range(3):
                visualizer.show_step(x, y, z)


# Calling functions in order allows VisualLoop to provide time delay based on internal counter
run_line()
run_floor()
run_cube()

EditorCamera()
app.run()
