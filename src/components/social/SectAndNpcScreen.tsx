'use client';

import React, { useState } from 'react';
import { NPC, Quest, Sect, PlayerState, Item } from '@/types/game';
import { Users, Scroll, Shield, Swords, Gift, BookOpen, Award, CheckCircle } from 'lucide-react';

interface SectAndNpcScreenProps {
  player: PlayerState;
  npcs: NPC[];
  sects: Sect[];
  quests: Quest[];
  playerItems: Item[];
  onSparNpc: (npc: NPC) => void;
  onGiftNpc: (npcId: string, item: Item) => void;
  onLearnTechniqueFromNpc: (npc: NPC, techniqueId: string) => void;
  onClaimQuestReward: (questId: string) => void;
}

export const SectAndNpcScreen: React.FC<SectAndNpcScreenProps> = ({
  player,
  npcs,
  sects,
  quests,
  playerItems,
  onSparNpc,
  onGiftNpc,
  onLearnTechniqueFromNpc,
  onClaimQuestReward,
}) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'questboard' | 'sects'>('npcs');
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(npcs[0] || null);

  const getAffinityBadge = (affinity: number) => {
    if (affinity >= 50) return { label: 'Sworn Ally', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' };
    if (affinity >= 10) return { label: 'Friendly', color: 'text-cyan-400 bg-cyan-950 border-cyan-800' };
    if (affinity <= -50) return { label: 'Mortal Enemy', color: 'text-red-400 bg-red-950 border-red-800' };
    if (affinity <= -10) return { label: 'Hostile', color: 'text-amber-400 bg-amber-950 border-amber-800' };
    return { label: 'Neutral', color: 'text-slate-400 bg-slate-900 border-slate-800' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'npcs', label: 'Roving Cultivators & Elders', icon: Users },
          { id: 'questboard', label: 'Sect Quest Board', icon: Scroll },
          { id: 'sects', label: 'World Sects & Factions', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "npcs" | "questboard" | "sects")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: NPCs */}
      {activeTab === 'npcs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NPC List Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 px-2">
              Cultivators Nearby ({npcs.length})
            </h3>
            <div className="space-y-2">
              {npcs.map((npc) => {
                const badge = getAffinityBadge(npc.affinity);
                const isSelected = selectedNpc?.id === npc.id;
                return (
                  <button
                    key={npc.id}
                    onClick={() => setSelectedNpc(npc)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/80 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{npc.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{npc.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {npc.title} • {npc.realm}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                      {npc.affinity > 0 ? `+${npc.affinity}` : npc.affinity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NPC Interaction Panel */}
          {selectedNpc ? (
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedNpc.avatar}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">{selectedNpc.name}</h2>
                      <p className="text-xs text-amber-400 font-semibold">{selectedNpc.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Realm: {selectedNpc.realm} Layer {selectedNpc.realmLevel} | Role: {selectedNpc.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold ${
                        getAffinityBadge(selectedNpc.affinity).color
                      }`}
                    >
                      {getAffinityBadge(selectedNpc.affinity).label} ({selectedNpc.affinity})
                    </span>
                  </div>
                </div>

                {/* Dialogue Box */}
                <div className="my-4 p-4 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-xs italic leading-relaxed">
                  &quot;{selectedNpc.affinity >= 20 ? selectedNpc.dialogues.highAffinity : selectedNpc.dialogues.greeting}&quot;
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => onSparNpc(selectedNpc)}
                    className="py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <Swords className="w-4 h-4" /> Friendly Dao Spar / Battle
                  </button>

                  {selectedNpc.teachableTechniqueIds.length > 0 && (
                    <button
                      onClick={() => onLearnTechniqueFromNpc(selectedNpc, selectedNpc.teachableTechniqueIds[0])}
                      className="py-3 px-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <BookOpen className="w-4 h-4" /> Request Technique Guidance
                    </button>
                  )}
                </div>

                {/* Gift Giving Section */}
                <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
                  <h4 className="font-bold text-xs text-slate-300 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-400" /> Present Gift to Increase Affinity
                  </h4>
                  {playerItems.length === 0 ? (
                    <p className="text-xs text-slate-500">No gift items in inventory.</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {playerItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onGiftNpc(selectedNpc.id, item)}
                          className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs whitespace-nowrap"
                        >
                          <span className="font-bold text-amber-300">{item.name}</span>
                          <span className="block text-[10px] text-slate-500">Gift Item</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Sect Quest Board */}
      {activeTab === 'questboard' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-400" /> Global Sect Quest Board
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Complete quests assigned by elders and sect leaders to earn Spirit Stones, Sect Contribution, and Rare
                Pills.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Sect Contribution</span>
              <span className="text-lg font-bold text-cyan-400">✨ {player.sectContribution} Pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((quest) => {
              const giverNpc = npcs.find((n) => n.id === quest.giverNpcId);
              return (
                <div
                  key={quest.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-100 text-sm">{quest.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                        {quest.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{quest.description}</p>
                    {giverNpc && (
                      <p className="text-[11px] text-cyan-400 mt-1">
                        Issued by: {giverNpc.avatar} {giverNpc.name} ({giverNpc.role})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Rewards:</span>
                      <span className="text-amber-300 font-bold">
                        💎 {quest.rewardSpiritStones} Stones | +{quest.rewardSectContribution} Sect Pts
                      </span>
                    </div>

                    {quest.isClaimed ? (
                      <div className="py-2 bg-slate-900 text-center text-xs text-slate-500 font-bold rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Quest Completed & Claimed
                      </div>
                    ) : (
                      <button
                        onClick={() => onClaimQuestReward(quest.id)}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1"
                      >
                        <Award className="w-4 h-4" /> Claim Quest Reward
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: World Sects */}
      {activeTab === 'sects' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Famous Sects & Sacred Sanctuaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sects.map((sect) => (
              <div key={sect.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-200 text-base">{sect.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      sect.faction === 'Righteous'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : sect.faction === 'Demonic'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {sect.faction}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{sect.description}</p>
                <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-900">
                  <div>Min Realm: {sect.minRealmRequired}</div>
                  <div>Spirit Density: {sect.spiritDensity}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
