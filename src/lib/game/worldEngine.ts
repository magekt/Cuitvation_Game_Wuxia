import { WorldTile, PlayerState } from '@/types/game';
import { NEXT_REALM_ORDER } from '@/constants/realms';

export function updateFogOfWar(tiles: WorldTile[], playerPos: { x: number; y: number }, visionRadius: number): WorldTile[] {
  return tiles.map((tile) => {
    const distance = Math.abs(tile.x - playerPos.x) + Math.abs(tile.y - playerPos.y);
    if (distance <= visionRadius) {
      return {
        ...tile,
        unlocked: true,
        discovered: true,
      };
    }
    return tile;
  });
}

export function checkAndExpandWorldGrid(tiles: WorldTile[], player: PlayerState): {
  tiles: WorldTile[];
  expanded: boolean;
  message?: string;
} {
  // World expands grid dimensions when player reaches higher realms (e.g. Core Formation, Nascent Soul)
  const currentMaxCoords = tiles.reduce(
    (max, t) => ({ x: Math.max(max.x, t.x), y: Math.max(max.y, t.y) }),
    { x: 0, y: 0 }
  );

  const playerRealmIndex = NEXT_REALM_ORDER.indexOf(player.realm);
  let targetSize = 7; // Default 7x7
  if (playerRealmIndex >= 3) targetSize = 9;  // Core Formation -> 9x9
  if (playerRealmIndex >= 5) targetSize = 11; // Spirit Severing -> 11x11
  if (playerRealmIndex >= 7) targetSize = 13; // Immortal Ascension -> 13x13

  if (currentMaxCoords.x + 1 >= targetSize) {
    return { tiles, expanded: false };
  }

  // Generate new grid rim tiles
  const newTiles: WorldTile[] = [...tiles];
  const existingMap = new Set(tiles.map((t) => `${t.x},${t.y}`));

  for (let x = 0; x < targetSize; x++) {
    for (let y = 0; y < targetSize; y++) {
      const key = `${x},${y}`;
      if (!existingMap.has(key)) {
        const isOuter = x === 0 || y === 0 || x === targetSize - 1 || y === targetSize - 1;
        const danger = Math.min(10, 3 + Math.floor(Math.random() * 5));
        
        newTiles.push({
          x,
          y,
          type: isOuter && Math.random() > 0.5 ? 'SecretRealm' : 'Wilderness',
          name: isOuter ? `Outer Domain (${x},${y})` : `Wilderness (${x},${y})`,
          description: 'A newly unveiled spatial domain revealed through your heightened spiritual perception.',
          qiDensity: 2.0 + Math.random() * 4.0,
          dangerLevel: danger,
          unlocked: false,
          discovered: false,
          sealed: false,
          fengShuiRating: Math.random() > 0.7 ? 'Auspicious' : 'Neutral',
          associatedNpcIds: [],
          resourceDropRate: 0.5,
        });
      }
    }
  }

  return {
    tiles: newTiles,
    expanded: true,
    message: `The world boundary has expanded to a ${targetSize}x${targetSize} Grid! New ancient realms unveiled!`,
  };
}

export function toggleTileSealing(tiles: WorldTile[], x: number, y: number): {
  tiles: WorldTile[];
  sealedState: boolean;
  message: string;
} {
  let newlySealed = false;
  const updated = tiles.map((tile) => {
    if (tile.x === x && tile.y === y) {
      newlySealed = !tile.sealed;
      return {
        ...tile,
        sealed: newlySealed,
      };
    }
    return tile;
  });

  return {
    tiles: updated,
    sealedState: newlySealed,
    message: newlySealed
      ? `Demon Sealing Hex applied! Spatial tile (${x},${y}) has been sealed into isolation.`
      : `Spatial Seal released at (${x},${y})! Spatial flow restored.`,
  };
}

export interface ExplorationEncounter {
  type: 'SpiritStoneDeposit' | 'AncientMonument' | 'HerbPatch' | 'FengShuiBlessing';
  title: string;
  description: string;
  rewardStones?: number;
  rewardLawComprehension?: number;
  rewardQi?: number;
}

export function triggerTileExplorationEncounter(tile: WorldTile, player: PlayerState): {
  encounter: ExplorationEncounter | null;
  updatedPlayer: PlayerState;
  message: string;
} {
  // 30% chance to trigger an encounter on non-sealed tiles
  if (tile.sealed || Math.random() > 0.3) {
    return { encounter: null, updatedPlayer: player, message: '' };
  }

  const roll = Math.random();
  const updated = { ...player };

  if (roll < 0.35) {
    const stones = 20 + tile.dangerLevel * 15;
    updated.spiritStones += stones;
    return {
      encounter: {
        type: 'SpiritStoneDeposit',
        title: 'Uncovered Spirit Stone Vein',
        description: `Discovered a exposed spirit stone vein in ${tile.name}! Found ${stones} Spirit Stones.`,
        rewardStones: stones,
      },
      updatedPlayer: updated,
      message: `Discovered ${stones} Spirit Stones at (${tile.x},${tile.y})!`,
    };
  } else if (roll < 0.70) {
    const qiGain = 50 + tile.dangerLevel * 20;
    updated.currentQi = Math.min(updated.maxQi, updated.currentQi + qiGain);
    return {
      encounter: {
        type: 'HerbPatch',
        title: 'Concentrated Qi Spring',
        description: `Stumbled upon a natural Qi spring in ${tile.name}. Restored ${qiGain} Qi.`,
        rewardQi: qiGain,
      },
      updatedPlayer: updated,
      message: `Absorbed natural Qi spring at (${tile.x},${tile.y})! (+${qiGain} Qi)`,
    };
  } else {
    const lawGain = 5;
    const elem = tile.fengShuiRating === 'Heavenly blessed' ? 'Chaos' : 'Earth';
    updated.unlockedLaws = {
      ...updated.unlockedLaws,
      [elem]: Math.min(100, (updated.unlockedLaws[elem] || 0) + lawGain),
    };
    return {
      encounter: {
        type: 'AncientMonument',
        title: 'Ancient Dao Stele',
        description: `Contemplated a weathered Dao Stele in ${tile.name}. Deepened ${elem} Law comprehension by ${lawGain}%.`,
        rewardLawComprehension: lawGain,
      },
      updatedPlayer: updated,
      message: `Gained +${lawGain}% ${elem} Law comprehension from ancient stele!`,
    };
  }
}
