'use client';

import React, { useState, useEffect } from 'react';
import { PlayerState, WorldTile, Equipment, Item, NPC, Quest, Sect, CombatEntity, TribulationState } from '@/types/game';
import { INITIAL_ITEMS, ALL_TECHNIQUES } from '@/constants/items';
import { INITIAL_NPCS, INITIAL_SECTS, generateInitialWorldGrid } from '@/constants/worldData';
import { calculateQiGain, processBreakthrough, unblockMeridian } from '@/lib/game/cultivationEngine';
import { checkAndExpandWorldGrid, toggleTileSealing, updateFogOfWar } from '@/lib/game/worldEngine';
import { generateSectQuests } from '@/lib/game/questEngine';
import { initCombatEntity, startHeavenlyTribulation } from '@/lib/game/combatEngine';

import { WorldGrid } from '@/components/map/WorldGrid';
import { CharacterScreen } from '@/components/character/CharacterScreen';
import { SectAndNpcScreen } from '@/components/social/SectAndNpcScreen';
import { CombatScreen } from '@/components/combat/CombatScreen';

import { Compass, User, Users, Swords, Save, } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'cultivation_heavenly_dao_save_v1';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'character' | 'social' | 'combat'>('map');
  const [notification, setNotification] = useState<string | null>(null);

  // Core Game State
  const [player, setPlayer] = useState<PlayerState>({
    name: 'Meng Hao',
    title: 'Mortal Being',
    gender: 'Male',
    realm: 'Mortal',
    realmLevel: 1,
    currentQi: 20,
    maxQi: 50,
    stats: {
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      spiritualPerception: 2,
      attack: 15,
      defense: 10,
      alchemySkill: 5,
      forgingSkill: 5,
      fateLuck: 10,
      comprehension: 10,
    },
    elementalAffinity: { Metal: 10, Wood: 10, Water: 10, Fire: 10, Earth: 10, Demon: 20, Lightning: 5, Chaos: 0 },
    activeTechniqueId: 'basic_strike',
    demonHexesUnlocked: ['hex_1_spatial'],
    unlockedLaws: { Metal: 5, Wood: 5, Water: 5, Fire: 5, Earth: 5, Demon: 15, Lightning: 0, Chaos: 0 },
    gold: 50,
    spiritStones: 200,
    meridiansUnblocked: 0,
    maxMeridians: 12,
    currentLocation: { x: 3, y: 3 },
    currentSectId: 'reliance_sect',
    sectContribution: 50,
  });

  const [worldTiles, setWorldTiles] = useState<WorldTile[]>(() => generateInitialWorldGrid());
  const [selectedTile, setSelectedTile] = useState<WorldTile | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [sects, setSects] = useState<Sect[]>(INITIAL_SECTS);
  const [quests, setQuests] = useState<Quest[]>(() => generateSectQuests(INITIAL_NPCS, INITIAL_ITEMS));

  const [inventory, setInventory] = useState<{ item: Item; quantity: number }[]>([
    { item: INITIAL_ITEMS[0], quantity: 5 },
    { item: INITIAL_ITEMS[1], quantity: 10 },
  ]);

  const [equipment, setEquipment] = useState<Equipment>({
    weapon: INITIAL_ITEMS.find((i) => i.id === 'weapon_wooden_sword') || null,
    armor: INITIAL_ITEMS.find((i) => i.id === 'armor_robes') || null,
    artifact: null,
  });

  // Combat / Tribulation transient states
  const [combatEnemy, setCombatEnemy] = useState<CombatEntity | null>(null);
  const [tribulationState, setTribulationState] = useState<TribulationState | null>(null);

  // Load save on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.player && typeof parsed.player === 'object' && typeof parsed.player.name === 'string') {
            setPlayer((prev) => ({ ...prev, ...parsed.player }));
          }
          if (Array.isArray(parsed.worldTiles)) setWorldTiles(parsed.worldTiles);
          if (Array.isArray(parsed.inventory)) setInventory(parsed.inventory);
          if (parsed.equipment && typeof parsed.equipment === 'object') setEquipment(parsed.equipment);
          if (Array.isArray(parsed.npcs)) setNpcs(parsed.npcs);
          if (Array.isArray(parsed.quests)) setQuests(parsed.quests);
        }
      } catch (e) {
        console.error('Failed to load save file:', e);
      }
    }
  }, []);

  // Show notification toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Save game state
  const handleSaveGame = () => {
    const saveObj = { player, worldTiles, inventory, equipment, npcs, quests };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
    showToast('💾 Dao Journey State saved to local realm!');
  };

  // Cultivate Qi Action
  const handleCultivateQi = () => {
    const currentTile = worldTiles.find(
      (t) => t.x === player.currentLocation.x && t.y === player.currentLocation.y
    );
    const qiGain = calculateQiGain(player, currentTile?.qiDensity || 1.0);
    const newQi = Math.min(player.maxQi, player.currentQi + qiGain);

    setPlayer((prev) => ({
      ...prev,
      currentQi: newQi,
    }));

    showToast(`✨ Channeled Heaven & Earth Qi! +${qiGain} Essence.`);
  };

  // Breakthrough Action
  const handleAttemptBreakthrough = () => {
    const res = processBreakthrough(player);
    if (res.triggeredTribulation) {
      const trib = startHeavenlyTribulation(player.realm);
      setTribulationState(trib);
      setActiveTab('combat');
      showToast(res.message);
      return;
    }

    if (res.success) {
      setPlayer(res.updatedPlayer);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(res.message);

      // Check if world expands
      const expandRes = checkAndExpandWorldGrid(worldTiles, res.updatedPlayer);
      if (expandRes.expanded) {
        setWorldTiles(expandRes.tiles);
        showToast(expandRes.message || 'World expanded!');
      }
    } else {
      showToast(res.message);
    }
  };

  // Unblock Meridian
  const handleUnblockMeridian = () => {
    const res = unblockMeridian(player);
    if (res.success) {
      setPlayer(res.updatedPlayer);
      confetti({ particleCount: 50, spread: 50 });
    }
    showToast(res.message);
  };

  // Move Player on Grid
  const handleMovePlayer = (x: number, y: number) => {
    const newTiles = updateFogOfWar(worldTiles, { x, y }, player.stats.spiritualPerception);
    setWorldTiles(newTiles);
    setPlayer((prev) => ({ ...prev, currentLocation: { x, y } }));

    const targetTile = newTiles.find((t) => t.x === x && t.y === y);

    // Random Encounter check on wilderness/danger
    if (targetTile && targetTile.dangerLevel > 2 && Math.random() < 0.4) {
      const beast = initCombatEntity(
        `Ancient Spirit Beast (Lvl ${targetTile.dangerLevel})`,
        'Mortal',
        targetTile.dangerLevel * 12,
        targetTile.dangerLevel * 6,
        targetTile.dangerLevel * 60
      );
      setCombatEnemy(beast);
      setActiveTab('combat');
      showToast(`⚠️ An aggressive spirit beast blocked your path at (${x},${y})!`);
    } else {
      showToast(`Traveled to grid node (${x}, ${y}) - ${targetTile?.name || 'Wilderness'}`);
    }
  };

  // Apply/Release Spatial Seal
  const handleToggleSeal = (x: number, y: number) => {
    const res = toggleTileSealing(worldTiles, x, y);
    setWorldTiles(res.tiles);
    showToast(res.message);
  };

  // Inventory & Equipment Handlers
  const handleEquipItem = (item: Item) => {
    if (!item.equippableSlot) return;
    const slot = item.equippableSlot.toLowerCase() as keyof Equipment;

    setEquipment((prev) => ({ ...prev, [slot]: item }));
    showToast(`Equipped ${item.name}!`);
  };

  const handleUnequipItem = (slot: keyof Equipment) => {
    setEquipment((prev) => ({ ...prev, [slot]: null }));
    showToast(`Unequipped ${slot}.`);
  };

  const handleUseItem = (item: Item) => {
    if (item.effects?.qiGain) {
      setPlayer((prev) => ({
        ...prev,
        currentQi: Math.min(prev.maxQi, prev.currentQi + item.effects!.qiGain!),
      }));
      showToast(`Consumed ${item.name}! Gained ${item.effects.qiGain} Qi.`);
    }
  };

  // Social & Sparring
  const handleSparNpc = (npc: NPC) => {
    const enemyEntity = initCombatEntity(
      npc.name,
      npc.realm,
      npc.realmLevel * 18,
      npc.realmLevel * 10,
      npc.realmLevel * 100
    );
    setCombatEnemy(enemyEntity);
    setActiveTab('combat');
    showToast(`Initiated friendly Dao spar with ${npc.name}!`);
  };

  const handleGiftNpc = (npcId: string, item: Item) => {
    setNpcs((prev) =>
      prev.map((npc) => (npc.id === npcId ? { ...npc, affinity: Math.min(100, npc.affinity + 15) } : npc))
    );
    showToast(`Presented ${item.name} as a gift! NPC affinity increased (+15).`);
  };

  // Combat Result Callback
  const handleCombatFinish = (playerWon: boolean, remainingHp: number) => {
    setPlayer((prev) => ({
      ...prev,
      stats: { ...prev.stats, hp: remainingHp },
      spiritStones: playerWon ? prev.spiritStones + 150 : prev.spiritStones,
    }));
    setCombatEnemy(null);
    setActiveTab('map');
    showToast(playerWon ? '🎉 Duel Won! Reward: +150 Spirit Stones.' : '💀 Retreating to recover...');
  };

  // Tribulation Result Callback
  const handleTribulationFinish = (success: boolean) => {
    if (success) {
      const res = processBreakthrough({ ...player, currentQi: player.maxQi });
      setPlayer(res.updatedPlayer);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      showToast('🌟 Tribulation Conquered! Major Realm Ascension Complete!');
    } else {
      showToast('⚡ Tribulation failed. Recover your Qi before trying again.');
    }
    setTribulationState(null);
    setActiveTab('character');
  };

  if (!hasMounted) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono text-xs">Loading Heavenly Dao Engine...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-amber-300 animate__animated animate__fadeInDown">
          {notification}
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">☯️</span>
            <div>
              <h1 className="font-extrabold text-lg text-amber-400 leading-tight">I Shall Seal the Heavens</h1>
              <p className="text-[10px] text-slate-400">Coiling Dragon Cultivation RPG</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveGame}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save Game
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Body */}
      <div className="flex-1 pb-20 lg:pb-6 pt-4">
        {activeTab === 'map' && (
          <WorldGrid
            tiles={worldTiles}
            player={player}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
            onMovePlayer={handleMovePlayer}
            onToggleSeal={handleToggleSeal}
          />
        )}

        {activeTab === 'character' && (
          <CharacterScreen
            player={player}
            equipment={equipment}
            inventory={inventory}
            onCultitateQi={handleCultivateQi}
            onAttemptBreakthrough={handleAttemptBreakthrough}
            onUnblockMeridian={handleUnblockMeridian}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onUseItem={handleUseItem}
          />
        )}

        {activeTab === 'social' && (
          <SectAndNpcScreen
            player={player}
            sects={sects}
            npcs={npcs}
            quests={quests}
            playerItems={inventory.map((i) => i.item)}
            onClaimQuestReward={(qId) => {
              setQuests((prev) => prev.map((q) => (q.id === qId ? { ...q, isClaimed: true } : q)));
              setPlayer((prev) => ({ ...prev, spiritStones: prev.spiritStones + 200 }));
              showToast('Quest claimed! +200 Spirit Stones.');
            }}
            onGiftNpc={handleGiftNpc}
            onSparNpc={handleSparNpc}
            onLearnTechniqueFromNpc={(npc, techId) => {
              showToast(`Learned new technique from ${npc.name}!`);
            }}
          />
        )}

        {activeTab === 'combat' && (
          <CombatScreen
            player={player}
            inventory={inventory}
            combatEnemy={combatEnemy}
            tribulationState={tribulationState}
            playerTechniques={ALL_TECHNIQUES}
            onCombatFinish={handleCombatFinish}
            onTribulationFinish={handleTribulationFinish}
          />
        )}
      </div>

      {/* Bottom Navigation for Mobile / Fixed Footer Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-4 py-2">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {[
            { id: 'map', label: 'World Grid', icon: Compass },
            { id: 'character', label: 'Cultivation', icon: User },
            { id: 'social', label: 'Sects & NPCs', icon: Users },
            { id: 'combat', label: 'Arena', icon: Swords },
          ].map((nav) => {
            const Icon = nav.icon;
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as "map" | "character" | "social" | "combat")}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                  isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
