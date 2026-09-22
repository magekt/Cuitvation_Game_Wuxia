'use client';

import React, { useState } from 'react';
import { PlayerState, InventoryItem, Equipment, Item } from '@/types/game';
import { CULTIVATION_REALMS } from '@/constants/realms';
import { CRAFTING_RECIPES } from '@/constants/recipes';
import { craftItem, Recipe } from '@/lib/game/cultivationEngine';
import { Sparkles, Shield, Swords, Heart, Zap, Layers, Activity, Flame, Info } from 'lucide-react';

interface CharacterScreenProps {
  player: PlayerState;
  inventory: InventoryItem[];
  equipment: Equipment;
  onCultitateQi: () => void;
  onAttemptBreakthrough: () => void;
  onUnblockMeridian: () => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: 'weapon' | 'armor' | 'artifact') => void;
  onUseItem: (item: Item) => void;
  onUpdatePlayerAndInventory?: (updatedPlayer: PlayerState, updatedInventory: InventoryItem[], msg: string) => void;
}

export const CharacterScreen: React.FC<CharacterScreenProps> = ({
  player,
  inventory,
  equipment,
  onCultitateQi,
  onAttemptBreakthrough,
  onUnblockMeridian,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  onUpdatePlayerAndInventory,
}) => {
  const [activeTab, setActiveTab] = useState<'realm' | 'meridians' | 'crafting' | 'laws' | 'equipment' | 'inventory'>('realm');
  const [craftingType, setCraftingType] = useState<'Alchemy' | 'Forging'>('Alchemy');
  const [showStatsModal, setShowStatsModal] = useState(false);

  const currentRealmInfo = CULTIVATION_REALMS[player.realm];
  const qiPercent = Math.min(100, Math.round((player.currentQi / player.maxQi) * 100));

  const handleCraft = (recipe: Recipe) => {
    const result = craftItem(player, inventory, recipe);
    if (onUpdatePlayerAndInventory) {
      onUpdatePlayerAndInventory(result.updatedPlayer, result.updatedInventory, result.message);
    }
  };

  // Helper calculation for equipment bonus breakdown
  const getEquipmentBonus = () => {
    let attack = 0;
    let defense = 0;
    let maxHp = 0;
    let comp = 0;
    Object.values(equipment).forEach((item) => {
      if (item?.effects?.statBoost) {
        attack += item.effects.statBoost.attack || 0;
        defense += item.effects.statBoost.defense || 0;
        maxHp += item.effects.statBoost.maxHp || 0;
        comp += item.effects.statBoost.comprehension || 0;
      }
    });
    return { attack, defense, maxHp, comp };
  };

  const eqBonus = getEquipmentBonus();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Character Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-100 tracking-wide">{player.name}</h2>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                {player.title}
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-semibold flex items-center gap-2">
              <span>{player.realm} Realm</span>
              <span className="text-slate-500">•</span>
              <span>Layer {player.realmLevel} / {currentRealmInfo.maxLevel}</span>
            </p>
          </div>

          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 shadow-md transition-all"
          >
            <Info className="w-4 h-4 text-cyan-400" /> Stats Breakdown
          </button>
        </div>

        {/* Core Stats Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Health Points</p>
              <p className="text-sm font-extrabold text-slate-200">{player.stats.hp} / {player.stats.maxHp}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Swords className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Attack Power</p>
              <p className="text-sm font-extrabold text-slate-200">{player.stats.attack}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Defense Shield</p>
              <p className="text-sm font-extrabold text-slate-200">{player.stats.defense}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Spirit Stones</p>
              <p className="text-sm font-extrabold text-cyan-300">{player.spiritStones}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'realm', label: 'Cultivation & Breakthrough', icon: Sparkles },
          { id: 'crafting', label: 'Alchemy & Forging', icon: Flame },
          { id: 'meridians', label: '12 Meridians', icon: Activity },
          { id: 'laws', label: 'Laws & Hexes', icon: Zap },
          { id: 'equipment', label: 'Equipped Treasures', icon: Shield },
          { id: 'inventory', label: 'Spatial Ring', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "realm" | "meridians" | "crafting" | "laws" | "equipment" | "inventory")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cultivation & Breakthrough */}
      {activeTab === 'realm' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Cultivation Qi Accumulation</span>
              <span className="text-cyan-400 font-extrabold">{qiPercent}% Full</span>
            </div>
            <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                style={{ width: `${qiPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-right">
              {player.currentQi} / {player.maxQi} Qi Essence Required
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onCultitateQi}
              className="py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all text-base flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-5 h-5 animate-spin-slow" /> Gather Heaven & Earth Qi
            </button>

            <button
              onClick={onAttemptBreakthrough}
              disabled={player.currentQi < player.maxQi}
              className={`py-4 px-6 font-bold rounded-xl shadow-lg transition-all text-base flex items-center justify-center gap-2 ${
                player.currentQi >= player.maxQi
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 animate-pulse active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Layers className="w-5 h-5" /> Attempt Realm Breakthrough
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Crafting (Alchemy & Forging) */}
      {activeTab === 'crafting' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" /> Immortals Crafting Furnace
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Refine gathered herbs into powerful breakthrough pills or forge raw iron ores into lethal artifacts.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCraftingType('Alchemy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  craftingType === 'Alchemy' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Alchemy (Skill: {player.stats.alchemySkill})
              </button>
              <button
                onClick={() => setCraftingType('Forging')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  craftingType === 'Forging' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Forging (Skill: {player.stats.forgingSkill})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRAFTING_RECIPES.filter((r) => r.type === craftingType).map((recipe) => {
              const reqName = recipe.requiredHerbName || recipe.requiredMaterialName;
              const hasIngredient = inventory.find((inv) => inv.item.name === reqName && inv.quantity >= recipe.requiredQuantity);

              return (
                <div key={recipe.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{recipe.name}</h4>
                      <p className="text-xs text-slate-400">Target: {recipe.outputItem.name}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 font-mono font-bold">
                      Req Skill: {recipe.requiredSkill}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Required Ingredient:</span>
                      <span className={hasIngredient ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {recipe.requiredQuantity}x {reqName}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Base Success Rate:</span>
                      <span className="text-cyan-300">{Math.round(recipe.baseSuccessRate * 100)}%</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCraft(recipe)}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold rounded-lg text-xs shadow transition-all"
                  >
                    Ignite Furnace & Craft
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: 12 Meridians */}
      {activeTab === 'meridians' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              12 Heavenly Qi Meridians ({player.meridiansUnblocked} / 12 Unblocked)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Unblocking meridians permanently amplifies Qi cultivation speed (+15% per meridian) and boosts Law
              Comprehension.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, index) => {
              const isUnblocked = index < player.meridiansUnblocked;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isUnblocked
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-xl mb-1">{isUnblocked ? '✨' : '🔒'}</div>
                  <div className="font-bold text-xs">Meridian #{index + 1}</div>
                  <div className="text-[10px] mt-1">{isUnblocked ? '+15% Qi Flow' : 'Blocked'}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onUnblockMeridian}
            disabled={player.meridiansUnblocked >= 12}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md"
          >
            Unblock Next Meridian (Cost: {(player.meridiansUnblocked + 1) * 100} Spirit Stones)
          </button>
        </div>
      )}

      {/* Tab 4: Laws & Demon Hexes */}
      {activeTab === 'laws' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Elemental Law Comprehension & Demon Hexes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deepen your mastery over Heaven Laws and unlock the legendary Eight Demon Sealing Hexes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(player.unlockedLaws).map(([element, percentage]) => (
              <div key={element} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{element} Sovereign Law</span>
                  <span className="text-cyan-400">{percentage}% Comprehension</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Equipment */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-100">Equipped Spiritual Treasures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['weapon', 'armor', 'artifact'] as const).map((slot) => {
              const item = equipment[slot];
              return (
                <div
                  key={slot}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-44 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{slot}</span>
                      <h4 className="font-bold text-slate-200 text-sm">{item ? item.name : 'Empty Slot'}</h4>
                    </div>
                    <span className="text-2xl">{slot === 'weapon' ? '⚔️' : slot === 'armor' ? '🛡️' : '🔮'}</span>
                  </div>
                  {item ? (
                    <div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                      <button
                        onClick={() => onUnequipItem(slot)}
                        className="mt-2 w-full py-1 bg-red-900/50 hover:bg-red-800/60 text-red-300 font-bold rounded text-xs border border-red-700/50"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">No item equipped in this slot.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Inventory & Pills */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Inventory Items ({inventory.length} Types)</h3>
          {inventory.length === 0 ? (
            <p className="text-xs text-slate-500">Your spatial ring is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                        Tier {item.tier} {item.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded">
                      x{quantity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{item.description}</p>
                  <div className="flex gap-2 pt-1">
                    {item.equippableSlot && (
                      <button
                        onClick={() => onEquipItem(item)}
                        className="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs"
                      >
                        Equip
                      </button>
                    )}
                    {(item.type === 'Pill' || item.type === 'Manual') && (
                      <button
                        onClick={() => onUseItem(item)}
                        className="flex-1 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs"
                      >
                        Consume / Learn
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Breakdown Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-amber-400 border-b border-slate-800 pb-2">
              Comprehensive Attributes Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Base HP:</span>
                <span className="font-bold">{player.stats.maxHp - eqBonus.maxHp} (Equip: +{eqBonus.maxHp})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Attack Power:</span>
                <span className="font-bold">{player.stats.attack - eqBonus.attack} (Equip: +{eqBonus.attack})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Defense Shield:</span>
                <span className="font-bold">{player.stats.defense - eqBonus.defense} (Equip: +{eqBonus.defense})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Law Comprehension:</span>
                <span className="font-bold">{player.stats.comprehension - eqBonus.comp}% (Equip: +{eqBonus.comp}%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Spiritual Perception:</span>
                <span className="font-bold">{player.stats.spiritualPerception} Grid Radius</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Alchemy / Forging Skill:</span>
                <span className="font-bold">{player.stats.alchemySkill} / {player.stats.forgingSkill}</span>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs text-white"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
