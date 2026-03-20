// Tile type indices — order matches the tileset strip in TextureFactory
export const TileType = {
  PLAINS: 0,
  FIELDS: 1,
  MOUNTAIN_BASE: 2,
  MOUNTAIN_PEAK: 3,
  CANDY_MOUNTAIN: 4,
};

export const TileConfig = {
  [TileType.PLAINS]:        { color: 0x4a7c3f, walkable: true  },
  [TileType.FIELDS]:        { color: 0xd4a017, walkable: true  },
  [TileType.MOUNTAIN_BASE]: { color: 0x7a5c3a, walkable: true  },
  [TileType.MOUNTAIN_PEAK]: { color: 0x5a3e28, walkable: false },
  [TileType.CANDY_MOUNTAIN]:{ color: 0xff69b4, walkable: true  },
};
