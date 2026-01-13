from ursina import *

class VisualLoop:
    def __init__(self, speed=0.1):
        self.speed = speed
        self.counter = 0  # Counter for execution order

    def show_step(self, x, y=None, z=None):
        """
        Function called by students.
        Automatically distinguishes 1D, 2D, 3D based on number of arguments.
        """
        self.counter += 1
        
        # Set delay based on counter to execute sequentially
        delay_time = self.counter * self.speed

        if y is None and z is None:
            # 1 argument (1D: linear/circular)
            invoke(self._create_1d, x, delay=delay_time)
        elif z is None:
            # 2 arguments (2D: plane)
            invoke(self._create_2d, x, y, delay=delay_time)
        else:
            # 3 arguments (3D: solid)
            invoke(self._create_3d, x, y, z, delay=delay_time)

    # --- Internal logic (students don't need to know) ---

    def _create_1d(self, i):
        # 1D: cubes in a row
        e = Entity(model='cube', color=color.hsv(0.6, 0.5, 0.8), scale=0.8)
        e.position = (i, 0, 0)
        e.animate_scale(0.8, duration=0.5, curve=curve.out_bounce)
        
        # Add text label (value: i)
        self._add_text(str(i), e.position, scale=4)

    def _create_2d(self, x, y):
        # 2D: floor tiles (using x, z axes)
        e = Entity(model='cube', color=color.hsv(0.3, 0.6, 0.8), scale=0.9)
        e.position = (x, 0, y)  # y argument used as z-axis (depth)
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        
        # Add text label (value: x,y) - position slightly above cube
        self._add_text(f"{x},{y}", (x, 0.6, y), scale=2)

    def _create_3d(self, x, y, z):
        # 3D: stack cubes in space
        e = Entity(model='cube', color=color.hsv(0.1, 0.7, 0.8), scale=0.9)
        e.position = (x, y, z)
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        
        # Add text label (value: x,y,z) - position slightly above cube
        self._add_text(f"{x},{y},{z}", (x, y + 0.6, z), scale=1.5)

    def _add_text(self, text_str, pos, scale=4):
        # Create text that always faces camera so it's not hidden inside cubes
        t = Text(text=text_str, position=pos, scale=scale, 
             color=color.black, billboard=True)
        
        # Set text origin to center for accurate positioning
        t.origin = (0, 0)