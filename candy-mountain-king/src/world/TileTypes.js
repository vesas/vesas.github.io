export const TileType = {
  PLAINS: 0,
  FIELDS: 1,
  MOUNTAIN_BASE: 2,
  MOUNTAIN_PEAK: 3,
  CANDY_MOUNTAIN: 4,
  FOREST: 5,
  ROCKS: 6,
};

export const TILE_TEXTURE_KEYS = {
  [TileType.PLAINS]:         'tile_plains',
  [TileType.FIELDS]:         'tile_fields',
  [TileType.MOUNTAIN_BASE]:  'tile_mountain_base',
  [TileType.MOUNTAIN_PEAK]:  'tile_mountain_peak',
  [TileType.CANDY_MOUNTAIN]: 'tile_candy_mountain',
  [TileType.FOREST]:         'tile_forest',
  [TileType.ROCKS]:          'tile_rocks',
};

export const TileConfig = {
  [TileType.PLAINS]:        { color: 0x4a7c3f, walkable: true  },
  [TileType.FIELDS]:        { color: 0xd4a017, walkable: true  },
  [TileType.MOUNTAIN_BASE]: { color: 0x7a5c3a, walkable: true  },
  [TileType.MOUNTAIN_PEAK]: { color: 0x5a3e28, walkable: false },
  [TileType.CANDY_MOUNTAIN]:{ color: 0xff69b4, walkable: true  },
  [TileType.FOREST]:        { color: 0x1a4d10, walkable: true  },
  [TileType.ROCKS]:         { color: 0x888888, walkable: false },
};
