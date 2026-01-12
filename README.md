# Ursina Games Collection

A collection of Python games and examples built with the [Ursina Engine](https://www.ursinaengine.org/).

## Requirements

- Python 3.12 or higher
- Ursina Engine
- Perlin Noise (for minecraft_tut)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/ursina_games_collection.git
cd ursina_games_collection
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Games Included

### Root Directory Games

| Game | Description | How to Run |
|------|-------------|------------|
| `breakout.py` | Classic Breakout/Brick Breaker game | `python breakout.py` |
| `bullet_hell.py` | Bullet hell shooter with particle effects | `python bullet_hell.py` |
| `column_graph.py` | Interactive 3D column graph visualization | `python column_graph.py` |
| `fps.py` | First-person shooter with enemies and shooting mechanics | `python fps.py` |
| `inventory.py` | Drag-and-drop inventory system demo | `python inventory.py` |
| `platformer.py` | 2D platformer with smooth movement | `python platformer.py` |
| `digging_game.py` | 2D digging/mining game | `python digging_game.py` |
| `slow_motion.py` | FPS demo with slow motion effect (press Tab) | `python slow_motion.py` |
| `shooter.py` | First-person shooting gallery with moving targets | `python shooter.py` |
| `maze.py` | 3D maze game with countdown timer | `python maze.py` |
| `volumetric_cube.py` | Volumetric cube rendering demo | `python volumetric_cube.py` |
| `world_grid.py` | World grid visualization | `python world_grid.py` |

### Minecraft Tutorial

A Minecraft-style voxel world builder located in the `minecraft_tut/` folder.

```bash
# Basic version
cd minecraft_tut
python main.py

# Version with items (poppy flower, etc.)
python main_with_items.py
```

**Controls for minecraft_tut:**
- WASD: Move
- Mouse: Look around
- Left Click: Place block
- Right Click: Remove block
- 1, 2, 3: Select block type (grass, dirt, stone)

## Controls

Most games use standard controls:
- **WASD** or **Arrow Keys**: Movement
- **Mouse**: Look around / Aim
- **Left Click**: Shoot / Interact
- **Space**: Jump (in platformers)
- **Tab**: Toggle slow motion (in slow_motion.py)
- **Escape**: Exit game

## Credits

- Games built with [Ursina Engine](https://github.com/pokepetter/ursina)
- minecraft_tut assets: [Low poly 3D blocks](https://devilsworkshop.itch.io/essential-low-poly-isometric-3d-block-and-hex-pack)

## License

MIT License - See LICENSE file for details.
