'use client';

import React, { useState } from 'react';
import { PlayerState, Item, Equipment, ElementType } from '@/types/game';
import { CULTIVATION_REALMS } from '@/constants/realms';
import { Sparkles, Shield, Flame, Zap, Award, BookOpen, Layers, Heart, Activity } from 'lucide-react';

interface CharacterScreenProps {
  player: PlayerState;
  equipment: Equipment;
  inventory: { item: Item; quantity: number }[];
  onCultitateQi: () => void;
  onAttemptBreakthrough: () => void;
  onUnblockMeridian: () => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onUseItem: (item: Item) => void;
}

export const CharacterScreen: React.FC<CharacterScreenProps> = ({
  player,
  equipment,
  inventory,
  onCultitateQi,
  onAttemptBreakthrough,
  onUnblockMeridian,
  onEquipItem,
  onUnequipItem,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = useState<'realm' | 'meridians' | 'laws' | 'equipment' | 'inventory'>('realm');

  const realmInfo = CULTIVATION_REALMS[player.realm];
  const qiPercent = Math.min(100, Math.round((player.currentQi / player.maxQi) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🧙‍♂️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">{player.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold">
                {player.title}
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-semibold mt-0.5">
              {player.realm} — Layer {player.realmLevel} / {realmInfo.maxLevel}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Health</span>
            <span className="text-sm font-bold text-red-400 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-red-400" />
              {player.stats.hp} / {player.stats.maxHp}
            </span>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attack Power</span>
            <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {player.stats.attack}
            </span>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Defense</span>
            <span className="text-sm font-bold text-blue-400 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {player.stats.defense}
            </span>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Spirit Stones</span>
            <span className="text-sm font-bold text-yellow-300 flex items-center justify-center gap-1">
              💎 {player.spiritStones}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'realm', label: 'Cultivation & Qi', icon: Sparkles },
          { id: 'meridians', label: '12 Meridians', icon: Activity },
          { id: 'laws', label: 'Laws & Demon Hexes', icon: Zap },
          { id: 'equipment', label: 'Artifacts & Gear', icon: Award },
          { id: 'inventory', label: 'Inventory & Pills', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border-t-2 border-amber-400 text-amber-400 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Cultivation & Breakthrough */}
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

      {/* Tab Content 2: 12 Meridians */}
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

      {/* Tab Content 3: Laws & Demon Hexes */}
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

      {/* Tab Content 4: Equipment */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-100">Equipped Spiritual Treasures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['weapon', 'armor', 'artifact'] as const).map((slot) => {
              const item = equipment[slot];
              return (
                <div
                  key={slot}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-40"
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

      {/* Tab Content 5: Inventory & Pills */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Inventory Items ({inventory.length} Types)</h3>
          {inventory.length === 0 ? (
            <p className="text-xs text-slate-500">Your spatial ring is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map(({ item, quantity }) => (
                <div key={item.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
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
    </div>
  );
};
