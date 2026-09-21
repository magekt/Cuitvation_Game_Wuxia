import { CULTIVATION_REALMS, NEXT_REALM_ORDER } from '@/constants/realms';
import { PlayerState, RealmStage } from '@/types/game';

export function calculateQiGain(player: PlayerState, tileQiDensity: number = 1.0): number {
  const baseGain = 5;
  const realmMult = CULTIVATION_REALMS[player.realm].statMultiplier;
  const meridianBonus = 1 + player.meridiansUnblocked * 0.15;
  return Math.round(baseGain * realmMult * tileQiDensity * meridianBonus);
}

export function canAttemptBreakthrough(player: PlayerState): {
  canBreakthrough: boolean;
  isNextStage: boolean;
  nextStage?: RealmStage;
  nextLevel?: number;
  reason?: string;
} {
  const currentRealmInfo = CULTIVATION_REALMS[player.realm];

  if (player.currentQi < player.maxQi) {
    return {
      canBreakthrough: false,
      isNextStage: false,
      reason: `Insufficient Qi. Requires ${player.maxQi} Qi.`,
    };
  }

  // Check if advancing level or next major stage
  if (player.realmLevel < currentRealmInfo.maxLevel) {
    return {
      canBreakthrough: true,
      isNextStage: false,
      nextLevel: player.realmLevel + 1,
    };
  } else {
    // Attempting major stage breakthrough
    const currentIndex = NEXT_REALM_ORDER.indexOf(player.realm);
    if (currentIndex >= NEXT_REALM_ORDER.length - 1) {
      return {
        canBreakthrough: false,
        isNextStage: false,
        reason: 'You have reached the supreme apex of cultivation: Sovereign Lord Peak!',
      };
    }

    const nextStage = NEXT_REALM_ORDER[currentIndex + 1];
    return {
      canBreakthrough: true,
      isNextStage: true,
      nextStage,
      nextLevel: 1,
    };
  }
}

export function processBreakthrough(player: PlayerState): {
  updatedPlayer: PlayerState;
  success: boolean;
  triggeredTribulation: boolean;
  message: string;
} {
  const check = canAttemptBreakthrough(player);
  if (!check.canBreakthrough) {
    return {
      updatedPlayer: player,
      success: false,
      triggeredTribulation: false,
      message: check.reason || 'Cannot attempt breakthrough.',
    };
  }

  const currentRealmInfo = CULTIVATION_REALMS[player.realm];

  if (check.isNextStage && check.nextStage) {
    const nextRealmInfo = CULTIVATION_REALMS[check.nextStage];
    // Major breakthrough requires Tribulation check
    const tribulationTriggered = Math.random() < currentRealmInfo.tribulationChance;

    if (tribulationTriggered) {
      return {
        updatedPlayer: player,
        success: false,
        triggeredTribulation: true,
        message: `A terrifying Heavenly Tribulation cloud gathers above! You must survive the Lightning Strikes to achieve ${check.nextStage}!`,
      };
    }

    // Direct success if no tribulation or tribulation already passed
    const newMaxQi = Math.round(nextRealmInfo.qiRequired * (1 + (check.nextLevel! - 1) * 0.3));
    const newStats = {
      ...player.stats,
      maxHp: Math.round(player.stats.maxHp * 1.5),
      hp: Math.round(player.stats.maxHp * 1.5),
      attack: Math.round(player.stats.attack * 1.4),
      defense: Math.round(player.stats.defense * 1.4),
      spiritualPerception: player.stats.spiritualPerception + 1,
    };

    return {
      updatedPlayer: {
        ...player,
        realm: check.nextStage,
        realmLevel: 1,
        currentQi: 0,
        maxQi: newMaxQi,
        title: nextRealmInfo.title,
        stats: newStats,
      },
      success: true,
      triggeredTribulation: false,
      message: `Breakthrough Successful! You have stepped into ${check.nextStage} Realm Layer 1!`,
    };
  } else {
    // Minor level breakthrough (e.g., Layer 1 to Layer 2)
    const newLevel = check.nextLevel || player.realmLevel + 1;
    const newMaxQi = Math.round(currentRealmInfo.qiRequired * (1 + (newLevel - 1) * 0.3));
    const newStats = {
      ...player.stats,
      maxHp: Math.round(player.stats.maxHp * 1.15),
      hp: Math.round(player.stats.maxHp * 1.15),
      attack: Math.round(player.stats.attack * 1.12),
      defense: Math.round(player.stats.defense * 1.12),
    };

    return {
      updatedPlayer: {
        ...player,
        realmLevel: newLevel,
        currentQi: 0,
        maxQi: newMaxQi,
        stats: newStats,
      },
      success: true,
      triggeredTribulation: false,
      message: `Layer Breakthrough! You advanced to ${player.realm} Layer ${newLevel}!`,
    };
  }
}

export function unblockMeridian(player: PlayerState): {
  updatedPlayer: PlayerState;
  success: boolean;
  message: string;
} {
  if (player.meridiansUnblocked >= player.maxMeridians) {
    return {
      updatedPlayer: player,
      success: false,
      message: 'All 12 Major Qi Meridians are already fully opened!',
    };
  }

  const cost = (player.meridiansUnblocked + 1) * 100;
  if (player.spiritStones < cost) {
    return {
      updatedPlayer: player,
      success: false,
      message: `Requires ${cost} Spirit Stones to unblock meridian #${player.meridiansUnblocked + 1}.`,
    };
  }

  return {
    updatedPlayer: {
      ...player,
      spiritStones: player.spiritStones - cost,
      meridiansUnblocked: player.meridiansUnblocked + 1,
      stats: {
        ...player.stats,
        maxQi: Math.round(player.stats.maxQi * 1.1),
        comprehension: player.stats.comprehension + 5,
      },
    },
    success: true,
    message: `Successfully unblocked Meridian #${player.meridiansUnblocked + 1}! Qi flow increased by 15%.`,
  };
}

export interface Recipe {
  id: string;
  name: string;
  type: 'Alchemy' | 'Forging';
  outputItem: import('@/types/game').Item;
  requiredHerbName?: string;
  requiredMaterialName?: string;
  requiredQuantity: number;
  requiredSkill: number;
  baseSuccessRate: number; // e.g. 0.7 = 70%
}

export function craftItem(
  player: PlayerState,
  inventory: import('@/types/game').InventoryItem[],
  recipe: Recipe
): {
  updatedPlayer: PlayerState;
  updatedInventory: import('@/types/game').InventoryItem[];
  success: boolean;
  message: string;
} {
  const isAlchemy = recipe.type === 'Alchemy';
  const skill = isAlchemy ? player.stats.alchemySkill : player.stats.forgingSkill;

  if (skill < recipe.requiredSkill) {
    return {
      updatedPlayer: player,
      updatedInventory: inventory,
      success: false,
      message: `Your ${isAlchemy ? 'Alchemy' : 'Forging'} skill (${skill}) is too low for ${recipe.name}. Requires skill ${recipe.requiredSkill}.`,
    };
  }

  // Check ingredient requirement
  const reqName = recipe.requiredHerbName || recipe.requiredMaterialName;
  const ingredient = inventory.find((inv) => inv.item.name === reqName && inv.quantity >= recipe.requiredQuantity);

  if (!ingredient) {
    return {
      updatedPlayer: player,
      updatedInventory: inventory,
      success: false,
      message: `Missing ingredients! Requires ${recipe.requiredQuantity}x ${reqName}.`,
    };
  }

  // Deduct ingredient
  const nextInventory = inventory.map((inv) => {
    if (inv.item.name === reqName) {
      return { ...inv, quantity: inv.quantity - recipe.requiredQuantity };
    }
    return inv;
  }).filter((inv) => inv.quantity > 0);

  // Calculate success rate based on base rate + skill bonus + fate luck
  const skillBonus = (skill - recipe.requiredSkill) * 0.02;
  const luckBonus = (player.stats.fateLuck || 0) * 0.01;
  const successChance = Math.min(0.95, recipe.baseSuccessRate + skillBonus + luckBonus);

  const roll = Math.random();
  const isSuccess = roll < successChance;

  let skillIncrease = 1;
  if (isSuccess) skillIncrease = 2;

  const updatedPlayer: PlayerState = {
    ...player,
    stats: {
      ...player.stats,
      alchemySkill: isAlchemy ? player.stats.alchemySkill + skillIncrease : player.stats.alchemySkill,
      forgingSkill: !isAlchemy ? player.stats.forgingSkill + skillIncrease : player.stats.forgingSkill,
    },
  };

  if (!isSuccess) {
    return {
      updatedPlayer,
      updatedInventory: nextInventory,
      success: false,
      message: `Crafting failed! The furnace overheated and ingredients turned to ash. (+${skillIncrease} Skill)`,
    };
  }

  // Add output item to inventory
  const existingOutput = nextInventory.find((inv) => inv.item.id === recipe.outputItem.id);
  let finalInventory: import('@/types/game').InventoryItem[];

  if (existingOutput) {
    finalInventory = nextInventory.map((inv) =>
      inv.item.id === recipe.outputItem.id ? { ...inv, quantity: inv.quantity + 1 } : inv
    );
  } else {
    finalInventory = [...nextInventory, { item: recipe.outputItem, quantity: 1 }];
  }

  return {
    updatedPlayer,
    updatedInventory: finalInventory,
    success: true,
    message: `Crafting successful! Created 1x ${recipe.outputItem.name}. (+${skillIncrease} ${isAlchemy ? 'Alchemy' : 'Forging'} Skill)`,
  };
}
