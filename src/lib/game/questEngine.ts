import { NPC, Quest, Item } from '@/types/game';

export function generateSectQuests(npcs: NPC[], availableItems: Item[]): Quest[] {
  const quests: Quest[] = [
    {
      id: 'quest_1_herb_gather',
      title: 'Gather Nine-Leaf Spirit Grass',
      description: 'Senior Brother Wang requires 3 Nine-Leaf Spirit Grasses for elementary alchemy.',
      type: 'GatherHerb',
      targetCount: 3,
      currentProgress: 0,
      targetItemName: 'Nine-Leaf Spirit Grass',
      rewardSpiritStones: 100,
      rewardSectContribution: 50,
      rewardItems: [availableItems.find((i) => i.id === 'pill_qi_1')!],
      isCompleted: false,
      isClaimed: false,
      giverNpcId: 'npc_meng_hao_rival',
    },
    {
      id: 'quest_2_explore_vein',
      title: 'Investigate Celestial Spirit Vein',
      description: 'Patriarch Reliance requests you explore the Celestial Dragon Spirit Vein.',
      type: 'ExploreTile',
      targetTileCoords: { x: 1, y: 1 },
      targetCount: 1,
      currentProgress: 0,
      rewardSpiritStones: 250,
      rewardSectContribution: 100,
      rewardItems: [availableItems.find((i) => i.id === 'herb_blood_lingzhi')!],
      isCompleted: false,
      isClaimed: false,
      giverNpcId: 'npc_patriarch_reliance',
    },
    {
      id: 'quest_3_spar_elder',
      title: 'Seek Dao Guidance from Elder Lin',
      description: 'Spar with Elder Lin ley to demonstrate your understanding of dragon law.',
      type: 'SparsNPC',
      targetNpcId: 'npc_beast_sovereign',
      targetCount: 1,
      currentProgress: 0,
      rewardSpiritStones: 500,
      rewardSectContribution: 200,
      rewardItems: [availableItems.find((i) => i.id === 'artifact_dragon_pendant')!],
      isCompleted: false,
      isClaimed: false,
      giverNpcId: 'npc_beast_sovereign',
    },
  ];

  return quests;
}
