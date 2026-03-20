import { MAP_WIDTH, MAP_HEIGHT, ZONE, CANDY_COUNT, VILLAGER_COUNT, THIEF_COUNT } from '../constants.js';
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
      else                                   type = TileType.PLAINS;

      tileData[ty * MAP_WIDTH + tx] = type;
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

  // Candy: PLAINS or FIELDS, dist > 12
  const candyPositions = [];
  for (let i = 0; i < CANDY_COUNT; i++) {
    const spot = findSpot((tx, ty) => {
      const t = tileAt(tx, ty);
      const dx = tx - cx; const dy = ty - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      return (t === TileType.PLAINS || t === TileType.FIELDS) && d > 12;
    });
    if (spot) candyPositions.push(spot);
  }

  // Villagers: FIELDS
  const villagerSpawns = [];
  for (let i = 0; i < VILLAGER_COUNT; i++) {
    const spot = findSpot((tx, ty) => tileAt(tx, ty) === TileType.FIELDS);
    if (spot) villagerSpawns.push(spot);
  }

  // Thieves: PLAINS, dist > 26
  const thiefSpawns = [];
  for (let i = 0; i < THIEF_COUNT; i++) {
    const spot = findSpot((tx, ty) => {
      const dx = tx - cx; const dy = ty - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      return tileAt(tx, ty) === TileType.PLAINS && d > ZONE.THIEF_MIN_DIST;
    });
    if (spot) thiefSpawns.push(spot);
  }

  return { tileData, candyPositions, villagerSpawns, thiefSpawns };
}
