# doom-ai-tribute

[![Tests](https://github.com/IbrahimSobh/doom-ai-tribute/actions/workflows/tests.yml/badge.svg)](https://github.com/IbrahimSobh/doom-ai-tribute/actions/workflows/tests.yml)

🎮 A fully playable tribute to **DOOM**, built from scratch with AI in a **single HTML file** 💥

No engines, no libraries, no assets: just pure **JavaScript**, **HTML5 Canvas**, and the **Web Audio API**.

### ▶️ [Play it now in your browser](https://ibrahimsobh.github.io/doom-ai-tribute/)

[![Gameplay](screenshots/gameplay.png)](https://ibrahimsobh.github.io/doom-ai-tribute/)

## ✨ Features

### 🕹️ Engine & Graphics
- Raycasting engine with textured walls, floors, and ceilings
- Classic enemies: **Zombieman** and **Pinky Demon**
- Glowing pickups: medkits, armor, ammo, and more

### ⚔️ Weapons
Five classic weapons, with muzzle flashes and blood splatter:

| # | Weapon |
|---|--------|
| 1 | Fist |
| 2 | Pistol |
| 3 | Shotgun |
| 4 | Chaingun |
| 5 | Plasma Rifle |

### 🔊 Sound & Music
All sound effects and music are synthesized in real time with the Web Audio API. There are no audio files.

### 📟 Interactive Extras
- Animated Doomguy face in the HUD that looks around
- Swap Doomguy for the author's face (press `F`, or click the face or the FACE button), with 12 pixel-art expressions that react to the game: happy, evil grin, sad, angry, ouch, hurt, god mode, and more
- Minimap
- Sliding doors and secret push-walls
- Toxic floor hazards

## 🚀 How to Play
- **Online:** open the [GitHub Pages link](https://ibrahimsobh.github.io/doom-ai-tribute/).
- **Offline:** clone or download this repo and open `index.html` in a modern browser.

Then pick a difficulty and rip and tear. 🔥

![Start screen](screenshots/menu.png)

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move & strafe |
| Mouse | Aim & look around |
| Left click / Ctrl | Fire |
| 1–5 / Mouse wheel | Switch weapon |
| E / Space | Open doors & secret walls |
| M | Toggle minimap |
| Shift | Run |
| F / Click the face | Swap Doomguy ↔ author's face |

### 🕹️ Cheat Codes
Type these during play, just like the original:

| Code | Effect |
|------|--------|
| `IDDQD` | God mode (toggle) |
| `IDKFA` | All weapons, full ammo, full armor, all keys |

## 🧪 Tests
Browser tests ([Playwright](https://playwright.dev)) run on every push and pull request via GitHub Actions. They load the game in Chromium, play it with real key presses, and check gameplay, cheats and the face swap. To run them locally (uses your installed Google Chrome):

```bash
npm install
npm test
```

## 🎯 Why This Project?
AI-assisted coding has reached an impressive level of fidelity. It works well for rapid prototyping and complex interactive simulations like a game engine.

Doom also matters to me personally. I used it during my PhD research in **Deep Learning, Computer Vision, and Reinforcement Learning**, so rebuilding it with AI felt like coming full circle. 🧑‍🎓

## 🤖 Built With AI
The game was developed and then updated by three AI models, in this order:

1. **Gemini Flash 3.7**: built the original game from scratch.
2. **Claude Sonnet 5**: continued development and updates.
3. **Claude Opus 5.5**: fixed gameplay bugs (unreachable blue keycard, Plasma Rifle pickup, frame-rate-independent speed, door and hitscan fixes), added the swappable author face with 12 expressions, and updated the screenshots and this README.

## 📄 License
Released under the [MIT License](LICENSE).
