export const TILE_SIZE = 32;
export const MAP_WIDTH = 80;   // tiles
export const MAP_HEIGHT = 80;  // tiles
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;   // 2560
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE; // 2560

// Zone radii (in tiles from center)
export const ZONE = {
  CANDY_MOUNTAIN_INNER: 6,
  MOUNTAIN_PEAK_OUTER: 8,
  MOUNTAIN_BASE_OUTER: 12,
  FIELDS_OUTER: 24,
  THIEF_MIN_DIST: 26,
};

// Spawn counts
export const CANDY_COUNT = 40;
export const VILLAGER_COUNT = 8;
export const THIEF_COUNT = 6;
export const ANIMAL_COUNT = 10;
