// Browser tests for index.html. The game keeps its state in globals (game, faceMode,
// startGame, ...), so tests drive it like a player and then read that state back.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const GAME_URL = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

// Opens the game and fails the test on any uncaught page error.
async function openGame(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(GAME_URL);
  return errors;
}

async function startEasyGame(page) {
  await page.evaluate(() => startGame(0));
}

test.describe('smoke', () => {
  test('loads with no errors and starts a game from the menu', async ({ page }) => {
    const errors = await openGame(page);
    await expect(page.locator('#start-screen')).toBeVisible();

    await page.getByRole('button', { name: /Too Young To Die/i }).click();

    await expect(page.locator('#start-screen')).toBeHidden();
    expect(await page.evaluate(() => game.state)).toBe('playing');
    await expect(page.locator('#hud-health')).toHaveText('200%');
    expect(errors).toEqual([]);
  });

  test('start screen fits a 1280x720 window', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openGame(page);
    const fit = await page.evaluate(() => {
      const s = document.getElementById('start-screen');
      return { content: s.scrollHeight, view: s.clientHeight };
    });
    expect(fit.content).toBeLessThanOrEqual(fit.view);
  });
});

test.describe('level and weapons', () => {
  test('blue key is reachable; the blue-door closet holds the Plasma Rifle', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    const r = await page.evaluate(() => {
      // Flood-fill from the start through floor and ordinary doors (not the blue door).
      const seen = new Set(['3,3']);
      const queue = [[3, 3]];
      while (queue.length) {
        const [x, y] = queue.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          const cell = LEVEL_MAP[ny][nx];
          if (!seen.has(k) && (cell === 0 || cell === 5)) { seen.add(k); queue.push([nx, ny]); }
        }
      }
      const key = game.entities.find(e => e.type === 'blue_key');
      const rifle = game.entities.find(e => e.type === 'plasma_pickup');
      const keyReachable = seen.has(Math.floor(key.x) + ',' + Math.floor(key.y));
      const rifleNeedsKey = !seen.has(Math.floor(rifle.x) + ',' + Math.floor(rifle.y));

      const p = game.player;
      p.x = key.x; p.y = key.y; updateEntities(1);
      p.x = rifle.x; p.y = rifle.y; updateEntities(1);
      return { keyReachable, rifleNeedsKey, hasKey: p.keys.blue, hasRifle: p.hasWeapons[4], weapon: p.currentWeapon };
    });
    expect(r).toEqual({ keyReachable: true, rifleNeedsKey: true, hasKey: true, hasRifle: true, weapon: 4 });
  });

  test('closed doors block shots, open doors let them through', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    const r = await page.evaluate(() => {
      // One target only: the level has its own zombie near this spot.
      game.entities.filter(e => SHOOTABLE_TYPES.includes(e.type)).forEach(e => { e.active = false; });
      const zombie = game.entities.find(e => e.type === 'zombie');
      Object.assign(zombie, { x: 12.5, y: 3.5, health: 100, active: true });
      castHitscan(8.5, 3.5, 1, 0, 10);            // door at (10,3) is closed
      const afterClosed = zombie.health;
      getDoorAt(10, 3).offset = 1;                // fully open
      castHitscan(8.5, 3.5, 1, 0, 10);
      return { afterClosed, afterOpen: zombie.health };
    });
    expect(r.afterClosed).toBe(100);
    expect(r.afterOpen).toBe(90);
  });

  test('barrel explosions do not re-count corpses or hurt pickups', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    const r = await page.evaluate(() => {
      const barrel = game.entities.find(e => e.type === 'barrel');
      // Keep living enemies out of the blast so only the corpse is nearby.
      game.entities.filter(e => ENEMY_TYPES.includes(e.type)).forEach(e => { e.x = 20.5; e.y = 21.5; });
      const zombie = game.entities.find(e => e.type === 'zombie');
      damageEntity(zombie, 999);
      Object.assign(zombie, { x: barrel.x + 0.5, y: barrel.y });
      const medkit = game.entities.find(e => e.type === 'medkit');
      Object.assign(medkit, { x: barrel.x, y: barrel.y + 0.5 });
      const killsBefore = game.totalKills;
      damageEntity(barrel, 999);
      return { killsBefore, killsAfter: game.totalKills, medkitState: medkit.state };
    });
    expect(r.killsAfter).toBe(r.killsBefore);
    expect(r.medkitState).toBe('idle');
  });

  test('movement speed does not depend on frame rate', async ({ page }) => {
    await openGame(page);
    const dist = await page.evaluate(() => {
      const run = (fps) => {
        startGame(0);
        game.state = 'test';
        Object.assign(game.player, { x: 2.5, y: 8.5, dirX: 1, dirY: 0, planeX: 0, planeY: 0.66 });
        game.keysDown = { KeyW: true };
        for (let i = 0; i < fps; i++) updatePlayer(60 / fps);   // one second of input
        game.keysDown = {};
        return game.player.x - 2.5;
      };
      return { at60: run(60), at144: run(144) };
    });
    expect(dist.at144).toBeCloseTo(dist.at60, 5);
    expect(dist.at60).toBeGreaterThan(3);
  });
});

test.describe('face and cheats', () => {
  test('F toggles between Doomguy and the author face', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    expect(await page.evaluate(() => faceMode)).toBe('classic');
    await page.keyboard.press('f');
    expect(await page.evaluate(() => faceMode)).toBe('author');
    await expect(page.locator('#btn-face')).toContainText('IBRAHIM');
    await page.keyboard.press('f');
    expect(await page.evaluate(() => faceMode)).toBe('classic');
  });

  test('IDKFA gives everything without swapping the face', async ({ page }) => {
    const errors = await openGame(page);
    await startEasyGame(page);
    await page.keyboard.type('idkfa');
    const r = await page.evaluate(() => ({
      weapons: game.player.hasWeapons, armor: game.player.armor, blueKey: game.player.keys.blue, face: faceMode,
    }));
    expect(r).toEqual({ weapons: [true, true, true, true, true], armor: 200, blueKey: true, face: 'classic' });
    expect(errors).toEqual([]);
  });

  test('IDDQD toggles god mode', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    await page.keyboard.type('iddqd');
    expect(await page.evaluate(() => game.player.godMode)).toBe(true);
    await page.keyboard.type('iddqd');
    expect(await page.evaluate(() => game.player.godMode)).toBe(false);
  });

  test('author face picks expressions from game events', async ({ page }) => {
    await openGame(page);
    await startEasyGame(page);
    const r = await page.evaluate(() => {
      const p = game.player;
      setFaceMode('author');
      const frame = () => authorFaceFrame();
      p.faceState = 'normal'; p.health = 150; p.weaponTimer = 0;
      const out = { normal: frame() };
      p.health = 60; out.hurt = frame();
      p.health = 30; out.badlyHurt = frame();
      p.health = 150; p.faceState = 'ouch'; out.ouch = frame();
      p.faceState = 'normal'; p.godMode = true; out.god = frame();
      p.godMode = false;
      // Real events: medkit pickup -> happy, locked blue door -> sad.
      p.health = 100;
      const medkit = game.entities.find(e => e.type === 'medkit');
      p.x = medkit.x; p.y = medkit.y; updateEntities(1);
      out.medkit = p.faceState;
      p.x = 21.5; p.y = 4.5; p.faceTimer = 0; tryInteract();
      out.lockedDoor = p.faceState;
      return out;
    });
    expect(r).toEqual({
      normal: 'normal', hurt: 'hurt', badlyHurt: 'badly_hurt', ouch: 'ouch', god: 'god', medkit: 'happy', lockedDoor: 'sad',
    });
  });
});
