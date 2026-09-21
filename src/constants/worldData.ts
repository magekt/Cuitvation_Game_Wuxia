import { NPC, Sect, WorldTile } from '@/types/game';

export const INITIAL_SECTS: Sect[] = [
  {
    id: 'reliance_sect',
    name: 'State of Zhao - Reliance Sect',
    faction: 'Righteous',
    leaderNpcId: 'npc_patriarch_reliance',
    description: 'Located atop Mt. Reliance. Famous for the Outer Sector competition and mountain spirit secrets.',
    minRealmRequired: 'Mortal',
    reputation: 10,
    techniquesOffered: ['basic_strike', 'heavenly_healing_sutra'],
    spiritDensity: 1.5,
  },
  {
    id: 'coiling_dragon_sanctuary',
    name: 'Four Divine Beasts Alliance',
    faction: 'Neutral',
    leaderNpcId: 'npc_beast_sovereign',
    description: 'A sanctuary dedicated to the Earth, Dragon, Phoenix, and Tiger Sovereign Laws.',
    minRealmRequired: 'Foundation Establishment',
    reputation: 0,
    techniquesOffered: ['coiling_dragon_fist'],
    spiritDensity: 3.0,
  },
  {
    id: 'blood_demon_sect',
    name: 'Blood Demon Dao Sect',
    faction: 'Demonic',
    leaderNpcId: 'npc_blood_ancestor',
    description: 'Fearsome demonic sect cultivating blood arts and sinister hexes.',
    minRealmRequired: 'Core Formation',
    reputation: -20,
    techniquesOffered: ['hex_1_spatial'],
    spiritDensity: 2.5,
  },
];

export const INITIAL_NPCS: NPC[] = [
  {
    id: 'npc_patriarch_reliance',
    name: 'Patriarch Reliance',
    title: 'Turtle Demon Patriarch',
    gender: 'Male',
    avatar: '🐢',
    realm: 'Nascent Soul',
    realmLevel: 9,
    sectId: 'reliance_sect',
    role: 'Sect Master',
    affinity: 20,
    personality: 'Arrogant',
    teachableTechniqueIds: ['basic_strike'],
    dialogues: {
      greeting: 'Junior! Do you dare step onto my Mt. Reliance without bringing spirit stones?',
      highAffinity: 'Haha! You show great promise. Here, let me impart a secret Dao technique to you.',
      lowAffinity: 'Hmph! Scram before I refine you into blood pill medicine!',
      questOffer: 'Clear out the wild beasts clogging our Spirit Veins.',
    },
    favoriteItems: ['pill_qi_1', 'herb_blood_lingzhi'],
  },
  {
    id: 'npc_beast_sovereign',
    name: 'Elder Lin ley',
    title: 'Coiling Dragon Sovereign',
    gender: 'Male',
    avatar: '🐉',
    realm: 'Spirit Severing',
    realmLevel: 3,
    sectId: 'coiling_dragon_sanctuary',
    role: 'Grand Elder',
    affinity: 0,
    personality: 'Wise',
    teachableTechniqueIds: ['coiling_dragon_fist'],
    dialogues: {
      greeting: 'Greetings fellow daoist. The Elemental Laws flow endlessly through heaven and earth.',
      highAffinity: 'Your understanding of the Earth Law rivals ancient sages!',
      lowAffinity: 'You walk a dark path. Reconsider your actions.',
      questOffer: 'Gather Thousand-Year Blood Lingzhi to aid our dragon bloodline ritual.',
    },
    favoriteItems: ['artifact_dragon_pendant', 'herb_blood_lingzhi'],
  },
  {
    id: 'npc_meng_hao_rival',
    name: 'Senior Brother Wang',
    title: 'Reliance Inner Disciple',
    gender: 'Male',
    avatar: '⚔️',
    realm: 'Qi Condensation',
    realmLevel: 5,
    sectId: 'reliance_sect',
    role: 'Senior Disciple',
    affinity: 5,
    personality: 'Greedy',
    teachableTechniqueIds: ['fire_dragon_art'],
    dialogues: {
      greeting: 'Junior Brother, if you want safe passage through the mountains, hand over 50 spirit stones!',
      highAffinity: 'Ah! You truly are my most generous Junior Brother!',
      lowAffinity: 'You dare refuse me? Be careful during the next sect tournament!',
      questOffer: 'Find 3 Nine-Leaf Spirit Grasses and I will teach you Fire Dragon Art.',
    },
    favoriteItems: ['herb_spirit_grass', 'pill_qi_1'],
  },
];

// Initial 7x7 Grid map centered at (3,3)
export function generateInitialWorldGrid(): WorldTile[] {
  const tiles: WorldTile[] = [];
  const size = 7;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const distance = Math.abs(x - 3) + Math.abs(y - 3);
      let type: WorldTile['type'] = 'Wilderness';
      let name = `Wilderness (${x}, ${y})`;
      let description = 'Uncharted mountains and valleys teeming with natural spiritual aura.';
      let qiDensity = 1.0 + Math.floor(Math.random() * 5) * 0.2;
      let dangerLevel = Math.max(1, distance * 2);
      let fengShuiRating: WorldTile['fengShuiRating'] = 'Neutral';
      let associatedNpcIds: string[] = [];
      let associatedSectId: string | undefined = undefined;

      if (x === 3 && y === 3) {
        type = 'Sect';
        name = 'Mt. Reliance Sect Main Peak';
        description = 'The heart of Reliance Sect. A place rich in Qi and disciple quarters.';
        qiDensity = 3.0;
        dangerLevel = 1;
        fengShuiRating = 'Heavenly blessed';
        associatedSectId = 'reliance_sect';
        associatedNpcIds = ['npc_patriarch_reliance', 'npc_meng_hao_rival'];
      } else if (x === 1 && y === 1) {
        type = 'SpiritVein';
        name = 'Celestial Dragon Spirit Vein';
        description = 'A underground dragon spirit vein gushing with concentrated spiritual Qi.';
        qiDensity = 4.5;
        dangerLevel = 2;
        fengShuiRating = 'Auspicious';
      } else if (x === 5 && y === 2) {
        type = 'Sect';
        name = 'Coiling Dragon Sanctuary';
        description = 'Ancient shrine carved into a dragon mountain peak.';
        qiDensity = 3.5;
        dangerLevel = 3;
        fengShuiRating = 'Heavenly blessed';
        associatedSectId = 'coiling_dragon_sanctuary';
        associatedNpcIds = ['npc_beast_sovereign'];
      } else if (x === 2 && y === 5) {
        type = 'AuctionHouse';
        name = 'Heavenly Treasure Pavilion';
        description = 'Grand auction hall where cultivators trade pills, artifacts, and manuals.';
        qiDensity = 1.8;
        dangerLevel = 1;
        fengShuiRating = 'Auspicious';
      } else if (x === 6 && y === 6) {
        type = 'SecretRealm';
        name = 'Eighth Demon Sealer Realm';
        description = 'Ancient realm sealed by legendary Demon Sealers. Contains grand opportunities and terrifying trials.';
        qiDensity = 6.0;
        dangerLevel = 7;
        fengShuiRating = 'Ominous';
      } else if (x === 0 && y === 4) {
        type = 'AlchemistTower';
        name = 'Nine-Cauldron Alchemy Peak';
        description = 'Sacred alchemy ground where legendary pills are refined day and night.';
        qiDensity = 2.5;
        dangerLevel = 2;
      } else if (x === 6 && y === 0) {
        type = 'DemonForbiddenZone';
        name = 'Blood Sea Forbidden Zone';
        description = 'Terrifying crimson fog and demonic aura. Only powerful experts dare enter.';
        qiDensity = 5.0;
        dangerLevel = 8;
        fengShuiRating = 'Ominous';
        associatedSectId = 'blood_demon_sect';
      }

      tiles.push({
        x,
        y,
        type,
        name,
        description,
        qiDensity,
        dangerLevel,
        unlocked: distance <= 2, // Center tiles unlocked by default
        discovered: distance <= 2,
        sealed: false,
        fengShuiRating,
        associatedNpcIds,
        associatedSectId,
        resourceDropRate: 0.3 + dangerLevel * 0.1,
      });
    }
  }

  return tiles;
}
