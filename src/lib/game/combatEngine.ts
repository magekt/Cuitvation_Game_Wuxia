import { CombatEntity, CombatLogEntry, PlayerState, Technique, TribulationState } from '@/types/game';
import { CULTIVATION_REALMS } from '@/constants/realms';

export function initCombatEntity(
  name: string,
  realm: any,
  attack: number,
  defense: number,
  hp: number,
  element: any = 'Metal'
): CombatEntity {
  return {
    name,
    realm,
    hp,
    maxHp: hp,
    qi: 200,
    maxQi: 200,
    attack,
    defense,
    element,
    techniques: [],
    isNpcOrMonster: true,
  };
}

export function executeCombatTurn(
  player: PlayerState,
  playerEntity: CombatEntity,
  enemyEntity: CombatEntity,
  selectedTechnique: Technique | null,
  turnNumber: number
): {
  updatedPlayerEntity: CombatEntity;
  updatedEnemyEntity: CombatEntity;
  logs: CombatLogEntry[];
  combatEnded: boolean;
  playerWon: boolean | null;
} {
  const logs: CombatLogEntry[] = [];
  let pEntity = { ...playerEntity };
  let eEntity = { ...enemyEntity };

  // Player Attack
  if (selectedTechnique && pEntity.qi >= selectedTechnique.qiCost) {
    pEntity.qi -= selectedTechnique.qiCost;
    let baseDamage = pEntity.attack * selectedTechnique.powerMultiplier;

    if (selectedTechnique.effects.damage) {
      baseDamage += selectedTechnique.effects.damage;
    }

    const actualDamage = Math.max(10, Math.round(baseDamage - eEntity.defense * 0.4));
    eEntity.hp = Math.max(0, eEntity.hp - actualDamage);

    logs.push({
      turn: turnNumber,
      attackerName: player.name,
      actionName: selectedTechnique.name,
      damage: actualDamage,
      message: `${player.name} unleashed [${selectedTechnique.name}]! Dealt ${actualDamage} elemental damage to ${eEntity.name}.`,
      type: 'skill',
    });

    if (selectedTechnique.effects.healHp) {
      const heal = selectedTechnique.effects.healHp;
      pEntity.hp = Math.min(pEntity.maxHp, pEntity.hp + heal);
      logs.push({
        turn: turnNumber,
        attackerName: player.name,
        actionName: selectedTechnique.name,
        damage: 0,
        message: `${player.name} restored ${heal} HP through divine sutra!`,
        type: 'heal',
      });
    }
  } else {
    // Normal basic attack
    const actualDamage = Math.max(5, Math.round(pEntity.attack - eEntity.defense * 0.5));
    eEntity.hp = Math.max(0, eEntity.hp - actualDamage);
    logs.push({
      turn: turnNumber,
      attackerName: player.name,
      actionName: 'Basic Qi Strike',
      damage: actualDamage,
      message: `${player.name} struck ${eEntity.name} with raw Qi energy for ${actualDamage} damage.`,
      type: 'attack',
    });
  }

  // Check if enemy defeated
  if (eEntity.hp <= 0) {
    logs.push({
      turn: turnNumber,
      attackerName: player.name,
      actionName: 'Victory',
      damage: 0,
      message: `🎉 Victory! ${eEntity.name} was defeated!`,
      type: 'system',
    });
    return {
      updatedPlayerEntity: pEntity,
      updatedEnemyEntity: eEntity,
      logs,
      combatEnded: true,
      playerWon: true,
    };
  }

  // Enemy Attack
  const enemyDamage = Math.max(8, Math.round(eEntity.attack - pEntity.defense * 0.5));
  pEntity.hp = Math.max(0, pEntity.hp - enemyDamage);
  logs.push({
    turn: turnNumber,
    attackerName: eEntity.name,
    actionName: 'Vicious Strike',
    damage: enemyDamage,
    message: `${eEntity.name} retaliated against ${player.name} for ${enemyDamage} damage!`,
    type: 'attack',
  });

  // Check if player defeated
  if (pEntity.hp <= 0) {
    logs.push({
      turn: turnNumber,
      attackerName: eEntity.name,
      actionName: 'Defeat',
      damage: 0,
      message: `💀 Defeat! ${player.name} succumbed to internal injuries. Retreating to recuperate...`,
      type: 'system',
    });
    return {
      updatedPlayerEntity: pEntity,
      updatedEnemyEntity: eEntity,
      logs,
      combatEnded: true,
      playerWon: false,
    };
  }

  // Regen small Qi
  pEntity.qi = Math.min(pEntity.maxQi, pEntity.qi + 15);

  return {
    updatedPlayerEntity: pEntity,
    updatedEnemyEntity: eEntity,
    logs,
    combatEnded: false,
    playerWon: null,
  };
}

export function startHeavenlyTribulation(targetRealm: any): TribulationState {
  const totalStrikes = 3;
  const powerMap: Record<string, number> = {
    'Foundation Establishment': 150,
    'Core Formation': 400,
    'Nascent Soul': 1000,
    'Spirit Severing': 2500,
    'Dao Seeking': 6000,
    'Immortal Ascension': 15000,
    'Sovereign Lord': 50000,
  };

  return {
    active: true,
    lightningStrikesRemaining: totalStrikes,
    totalStrikes,
    currentStrikePower: powerMap[targetRealm] || 200,
    targetRealm,
    success: null,
    log: [`⚡ Heavenly Tribulation clouds gather! ${totalStrikes} Heavenly Lightning Bolts will descend!`],
  };
}

export function withstandTribulationStrike(
  player: PlayerState,
  tribulation: TribulationState,
  shieldPower: number = 0
): {
  updatedPlayer: PlayerState;
  updatedTribulation: TribulationState;
  logMessage: string;
} {
  const rawPower = tribulation.currentStrikePower;
  const netDamage = Math.max(10, Math.round(rawPower - player.stats.defense * 0.8 - shieldPower));

  const newHp = Math.max(0, player.stats.hp - netDamage);
  const strikesLeft = tribulation.lightningStrikesRemaining - 1;

  let success = tribulation.success;
  let active = tribulation.active;
  let msg = `⚡ Lightning Strike #${tribulation.totalStrikes - strikesLeft} blasted down! You took ${netDamage} damage. (HP: ${newHp}/${player.stats.maxHp})`;

  if (newHp <= 0) {
    active = false;
    success = false;
    msg = `💀 You failed to withstand the Tribulation Lightning! Your Dao foundation fractured.`;
  } else if (strikesLeft <= 0) {
    active = false;
    success = true;
    msg = `🌟 You endured all Heavenly Lightning Strikes! The Dao rewards your courage! Major Breakthrough Achieved!`;
  }

  const nextStrikePower = Math.round(rawPower * 1.25);

  return {
    updatedPlayer: {
      ...player,
      stats: {
        ...player.stats,
        hp: newHp,
      },
    },
    updatedTribulation: {
      ...tribulation,
      active,
      lightningStrikesRemaining: strikesLeft,
      currentStrikePower: nextStrikePower,
      success,
      log: [...tribulation.log, msg],
    },
    logMessage: msg,
  };
}
