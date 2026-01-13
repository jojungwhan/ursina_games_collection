from ursina import *
import os


app = Ursina()

# Set window title from environment variable if running from _run_all_samples.py
if 'URSINA_SAMPLE_NAME' in os.environ:
    window.title = os.environ['URSINA_SAMPLE_NAME']

r = 8
for i in range(1, r):
    t = i/r
    s = 4*i
    print(s)
    grid = Entity(model=Grid(s,s), scale=s, color=color.hsv(0,0,.8,lerp(.8,0,t)), rotation_x=75, y=i/1000)
    subgrid = duplicate(grid)
    subgrid.model = Grid(s*4, s*4)
    subgrid.color = color.hsv(0,0,.4,lerp(.8,0,t))

# Tilted editor camera so 그리드가 바로 보입니다.
editor_cam = EditorCamera(rotation=(35, 30, 0))

app.run()
