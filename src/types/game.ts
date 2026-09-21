export type RealmStage = 
  | 'Mortal'
  | 'Qi Condensation'
  | 'Foundation Establishment'
  | 'Core Formation'
  | 'Nascent Soul'
  | 'Spirit Severing'
  | 'Dao Seeking'
  | 'Immortal Ascension'
  | 'Sovereign Lord';

export interface RealmInfo {
  stage: RealmStage;
  level: number; // 1-9 (1st Layer to Peak/9th Layer)
  maxLevel: number;
  qiRequired: number;
  statMultiplier: number;
  title: string;
  tribulationChance: number;
}

export type ElementType = 'Metal' | 'Wood' | 'Water' | 'Fire' | 'Earth' | 'Demon' | 'Lightning' | 'Chaos';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  qi: number;
  maxQi: number;
  spiritualPerception: number; // Controls grid vision / vision radius
  attack: number;
  defense: number;
  alchemySkill: number;
  forgingSkill: number;
  fateLuck: number;
  comprehension: number; // Speeds up law & technique learning
}

export interface PlayerState {
  name: string;
  title: string;
  gender: 'Male' | 'Female' | 'Non-Binary';
  realm: RealmStage;
  realmLevel: number; // 1 - 9
  currentQi: number;
  maxQi: number;
  stats: PlayerStats;
  elementalAffinity: Record<ElementType, number>;
  activeTechniqueId: string | null;
  demonHexesUnlocked: string[];
  unlockedLaws: Record<ElementType, number>; // Law comprehension % (0-100)
  gold: number;
  spiritStones: number;
  meridiansUnblocked: number; // 0-12
  maxMeridians: number; // 12
  currentLocation: { x: number; y: number };
  currentSectId: string | null;
  sectContribution: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'Pill' | 'Herb' | 'Weapon' | 'Armor' | 'Artifact' | 'CraftingMaterial' | 'Manual';
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // Tier matching realms
  description: string;
  element?: ElementType;
  value: number; // spirit stones
  effects?: {
    qiGain?: number;
    hpGain?: number;
    statBoost?: Partial<PlayerStats>;
    lawGain?: { element: ElementType; amount: number };
    techniqueId?: string;
  };
  equippableSlot?: 'Weapon' | 'Armor' | 'Artifact';
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  artifact: Item | null;
}

export interface Technique {
  id: string;
  name: string;
  type: 'Cultivation' | 'Martial' | 'DemonHex' | 'LawSpell' | 'DivineArt';
  element: ElementType;
  description: string;
  qiCost: number;
  powerMultiplier: number;
  requiredRealm: RealmStage;
  requiredComprehension: number;
  effects: {
    damage?: number;
    buffDefense?: number;
    healHp?: number;
    debuffEnemy?: string;
  };
}

export type TileType = 
  | 'Wilderness'
  | 'SpiritVein'
  | 'Sect'
  | 'SecretRealm'
  | 'AncientRuins'
  | 'AuctionHouse'
  | 'AlchemistTower'
  | 'TribulationPeak'
  | 'DemonForbiddenZone'
  | 'AbyssVoid';

export interface WorldTile {
  x: number;
  y: number;
  type: TileType;
  name: string;
  description: string;
  qiDensity: number; // Multiplier for cultivation gain (1.0x to 10.0x)
  dangerLevel: number; // 1-10
  unlocked: boolean;
  discovered: boolean;
  sealed: boolean; // Dynamic collapsing/sealing behavior
  fengShuiRating: 'Auspicious' | 'Neutral' | 'Ominous' | 'Heavenly blessed';
  associatedNpcIds: string[];
  associatedSectId?: string;
  resourceDropRate: number;
}

export interface Sect {
  id: string;
  name: string;
  faction: 'Righteous' | 'Demonic' | 'Neutral' | 'Ancient Clan';
  leaderNpcId: string;
  description: string;
  minRealmRequired: RealmStage;
  reputation: number; // Player's affinity with sect (-100 to +100)
  techniquesOffered: string[];
  spiritDensity: number;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  gender: 'Male' | 'Female';
  avatar: string;
  realm: RealmStage;
  realmLevel: number;
  sectId: string | null;
  role: 'Sect Master' | 'Grand Elder' | 'Inner Elder' | 'Senior Disciple' | 'Rival Cultivator' | 'Roving Immortal' | 'Demon Sovereign';
  affinity: number; // -100 (Hate) to +100 (Sworn Ally/Dao Companion)
  personality: 'Arrogant' | 'Benevolent' | 'Ruthless' | 'Mysterious' | 'Wise' | 'Greedy';
  teachableTechniqueIds: string[];
  dialogues: {
    greeting: string;
    highAffinity: string;
    lowAffinity: string;
    questOffer: string;
  };
  favoriteItems: string[]; // item IDs or types
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'KillMonster' | 'GatherHerb' | 'CraftPill' | 'SparsNPC' | 'ExploreTile';
  targetTileCoords?: { x: number; y: number };
  targetCount: number;
  currentProgress: number;
  targetItemName?: string;
  targetNpcId?: string;
  rewardSpiritStones: number;
  rewardSectContribution: number;
  rewardItems: Item[];
  isCompleted: boolean;
  isClaimed: boolean;
  giverNpcId: string;
}

export interface CombatEntity {
  name: string;
  realm: RealmStage;
  hp: number;
  maxHp: number;
  qi: number;
  maxQi: number;
  attack: number;
  defense: number;
  element: ElementType;
  techniques: Technique[];
  isNpcOrMonster: boolean;
}

export interface CombatLogEntry {
  turn: number;
  attackerName: string;
  actionName: string;
  damage: number;
  message: string;
  type: 'attack' | 'skill' | 'heal' | 'tribulation' | 'system';
}

export interface TribulationState {
  active: boolean;
  lightningStrikesRemaining: number;
  totalStrikes: number;
  currentStrikePower: number;
  targetRealm: RealmStage;
  success: boolean | null;
  log: string[];
}
