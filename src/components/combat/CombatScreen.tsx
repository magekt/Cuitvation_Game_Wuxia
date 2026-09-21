'use client';

import React, { useState } from 'react';
import { CombatEntity, CombatLogEntry, PlayerState, Technique, TribulationState } from '@/types/game';
import { executeCombatTurn, withstandTribulationStrike } from '@/lib/game/combatEngine';
import { Swords, Shield, Zap, Sparkles, Heart, Activity } from 'lucide-react';

interface CombatScreenProps {
  player: PlayerState;
  combatEnemy: CombatEntity | null;
  tribulationState: TribulationState | null;
  playerTechniques: Technique[];
  onCombatFinish: (playerWon: boolean, remainingHp: number) => void;
  onTribulationFinish: (success: boolean) => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({
  player,
  combatEnemy,
  tribulationState,
  playerTechniques,
  onCombatFinish,
  onTribulationFinish,
}) => {
  // Local combat state
  const [playerCombatEntity, setPlayerCombatEntity] = useState<CombatEntity>({
    name: player.name,
    realm: player.realm,
    hp: player.stats.hp,
    maxHp: player.stats.maxHp,
    qi: player.currentQi,
    maxQi: player.maxQi,
    attack: player.stats.attack,
    defense: player.stats.defense,
    element: 'Metal',
    techniques: playerTechniques,
    isNpcOrMonster: false,
  });

  const [enemy, setEnemy] = useState<CombatEntity | null>(combatEnemy);
  const [tribulation, setTribulation] = useState<TribulationState | null>(tribulationState);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [turn, setTurn] = useState<number>(1);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  // Handle combat turn
  const handleTurn = (tech: Technique | null) => {
    if (!enemy) return;

    const result = executeCombatTurn(player, playerCombatEntity, enemy, tech, turn);
    setPlayerCombatEntity(result.updatedPlayerEntity);
    setEnemy(result.updatedEnemyEntity);
    setCombatLogs((prev) => [...prev, ...result.logs]);
    setTurn((t) => t + 1);

    if (result.combatEnded) {
      setTimeout(() => {
        onCombatFinish(!!result.playerWon, result.updatedPlayerEntity.hp);
      }, 1500);
    }
  };

  // Handle tribulation lightning strike
  const handleTribulationStrike = () => {
    if (!tribulation) return;

    const result = withstandTribulationStrike(player, tribulation, 50); // 50 base defensive barrier
    setTribulation(result.updatedTribulation);

    if (!result.updatedTribulation.active) {
      setTimeout(() => {
        onTribulationFinish(!!result.updatedTribulation.success);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Tribulation Mode */}
      {tribulation && (
        <div className="bg-slate-900/90 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 text-center animate__animated animate__fadeIn">
          <div className="space-y-2">
            <span className="text-4xl animate-bounce inline-block">⚡</span>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-red-400">
              Heavenly Lightning Tribulation
            </h2>
            <p className="text-xs text-slate-300">
              Target Realm Breakthrough: <span className="text-amber-400 font-bold">{tribulation.targetRealm}</span>
            </p>
          </div>

          {/* Strikes Counter */}
          <div className="flex justify-center gap-4 my-4">
            {Array.from({ length: tribulation.totalStrikes }).map((_, i) => {
              const strikeDone = i < tribulation.totalStrikes - tribulation.lightningStrikesRemaining;
              return (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${
                    strikeDone
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  ⚡
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-amber-200">
            {tribulation.log.map((entry, idx) => (
              <p key={idx}>{entry}</p>
            ))}
          </div>

          {tribulation.active && (
            <button
              onClick={handleTribulationStrike}
              className="py-4 px-8 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl text-base shadow-xl transition-all animate-pulse"
            >
              ⚡ Withstand Heavenly Lightning Strike! (Power: {tribulation.currentStrikePower})
            </button>
          )}
        </div>
      )}

      {/* Standard Tactical Combat Mode */}
      {enemy && !tribulation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" /> Tactical Dao Combat (Turn {turn})
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-cyan-300 font-mono">
              Elemental Encounter
            </span>
          </div>

          {/* Combatants Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Player Side */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{playerCombatEntity.name}</h3>
                  <span className="text-xs text-cyan-400">{playerCombatEntity.realm}</span>
                </div>
                <span className="text-3xl">🧙‍♂️</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> HP
                  </span>
                  <span>
                    {playerCombatEntity.hp} / {playerCombatEntity.maxHp}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${(playerCombatEntity.hp / playerCombatEntity.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* VS Divider / Enemy Side */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🐉</span>
                <div className="text-right">
                  <h3 className="font-bold text-slate-100 text-base">{enemy.name}</h3>
                  <span className="text-xs text-red-400">{enemy.realm}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> HP
                  </span>
                  <span>
                    {enemy.hp} / {enemy.maxHp}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Combat Logs Window */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-40 overflow-y-auto space-y-2 text-xs font-mono">
            {combatLogs.length === 0 ? (
              <p className="text-slate-600 italic">Select an action or martial technique to begin the duel...</p>
            ) : (
              combatLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-1.5 rounded ${
                    log.type === 'skill'
                      ? 'bg-cyan-950/60 text-cyan-200 border-l-2 border-cyan-400'
                      : log.type === 'heal'
                      ? 'bg-emerald-950/60 text-emerald-200 border-l-2 border-emerald-400'
                      : log.type === 'system'
                      ? 'bg-amber-950/60 text-amber-200 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 mr-2">[Turn {log.turn}]</span>
                  {log.message}
                </div>
              ))
            )}
          </div>

          {/* Action / Technique Bar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unleash Divine Ability</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleTurn(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700"
              >
                Basic Qi Palm Strike
              </button>

              {playerTechniques.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleTurn(tech)}
                  className="py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-between"
                >
                  <span>{tech.name}</span>
                  <span className="text-[10px] text-cyan-200 bg-cyan-950 px-1.5 py-0.5 rounded">
                    {tech.qiCost} Qi
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
