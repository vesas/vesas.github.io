import { MAP_WIDTH, MAP_HEIGHT, ZONE, CANDY_COUNT, VILLAGER_COUNT, THIEF_COUNT, ANIMAL_COUNT } from '../constants.js';
import { TileType } from './TileTypes.js';

export function generateWorld(seed = 1) {
  const tileData = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;

  for (let ty = 0; ty < MAP_HEIGHT; ty++) {
    for (let tx = 0; tx < MAP_WIDTH; tx++) {
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const noise = 2 * Math.sin(tx * 0.7 + seed) * Math.cos(ty * 0.5 + seed * 1.3);
      const d = dist + noise;

      let type;
      if (d < ZONE.CANDY_MOUNTAIN_INNER)  type = TileType.CANDY_MOUNTAIN;
      else if (d < ZONE.MOUNTAIN_PEAK_OUTER) type = TileType.MOUNTAIN_PEAK;
      else if (d < ZONE.MOUNTAIN_BASE_OUTER) type = TileType.MOUNTAIN_BASE;
      else if (d < ZONE.FIELDS_OUTER)        type = TileType.FIELDS;
      else {
        // Outer plains: scatter forests and rocks with noise
        const forestNoise = Math.sin(tx * 0.3 + seed * 2) * Math.cos(ty * 0.3 + seed * 0.7);
        const rockNoise   = Math.sin(tx * 1.2 + seed * 3.1) * Math.cos(ty * 1.4 + seed * 1.5);
        if      (rockNoise   > 0.80) type = TileType.ROCKS;
        else if (forestNoise > 0.45) type = TileType.FOREST;
        else                         type = TileType.PLAINS;
      }

      tileData[ty * MAP_WIDTH + tx] = type;
    }
  }

  // Guarantee a passage south through the mountain peak ring so the player
  // (who spawns south of the house) can always exit to the plains.
  // Radius range 4–10 covers the peak zone even with max noise distortion.
  for (let r = 4; r <= 10; r++) {
    for (let w = -1; w <= 1; w++) {
      // south direction: angle = PI/2 → (cos=0, sin=1)
      // perpendicular (east/west): w offset on the x axis
      const tx = Math.round(cx + w);
      const ty = Math.round(cy + r);
      if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
        const idx = ty * MAP_WIDTH + tx;
        if (tileData[idx] === TileType.MOUNTAIN_PEAK) {
          tileData[idx] = TileType.MOUNTAIN_BASE;
        }
      }
    }
  }

  // Seeded pseudo-random helper
  let s = seed;
  function rand() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }

  function tileAt(tx, ty) {
    return tileData[ty * MAP_WIDTH + tx];
  }

  function findSpot(predicate, attempts = 500) {
    for (let i = 0; i < attempts; i++) {
      const tx = Math.floor(rand() * MAP_WIDTH);
      const ty = Math.floor(rand() * MAP_HEIGHT);
      if (predicate(tx, ty)) return { x: tx * 32 + 16, y: ty * 32 + 16 };
    }
    return null;
  }

  // Candy: PLAINS, FIELDS, or FOREST, dist > 12
  const candyPositions = [];
  for (let i = 0; i < CANDY_COUNT; i++) {
    const spot = findSpot((tx, ty) => {
      const t = tileAt(tx, ty);
      const dx = tx - cx; const dy = ty - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      return (t === TileType.PLAINS || t === TileType.FIELDS || t === TileType.FOREST) && d > 12;
    });
    if (spot) candyPositions.push(spot);
  }

  // Villagers: FIELDS
  const villagerSpawns = [];
  for (let i = 0; i < VILLAGER_COUNT; i++) {
    const spot = findSpot((tx, ty) => tileAt(tx, ty) === TileType.FIELDS);
    if (spot) villagerSpawns.push(spot);
  }

  // Thieves: PLAINS or FOREST, dist > 26
  const thiefSpawns = [];
  for (let i = 0; i < THIEF_COUNT; i++) {
    const spot = findSpot((tx, ty) => {
      const dx = tx - cx; const dy = ty - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      const t = tileAt(tx, ty);
      return (t === TileType.PLAINS || t === TileType.FOREST) && d > ZONE.THIEF_MIN_DIST;
    });
    if (spot) thiefSpawns.push(spot);
  }

  // Animals: PLAINS or FOREST, dist > 20
  const animalSpawns = [];
  for (let i = 0; i < ANIMAL_COUNT; i++) {
    const spot = findSpot((tx, ty) => {
      const dx = tx - cx; const dy = ty - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      const t = tileAt(tx, ty);
      return (t === TileType.PLAINS || t === TileType.FOREST) && d > 20;
    });
    if (spot) animalSpawns.push(spot);
  }

  return { tileData, candyPositions, villagerSpawns, thiefSpawns, animalSpawns };
}
