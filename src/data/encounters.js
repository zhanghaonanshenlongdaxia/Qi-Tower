/**
 * 遭遇配置系统 - Encounters
 * 定义游戏中的战斗遭遇
 */

export const Encounters = {
  // ========== 第一区域：云麓山麓 ==========
  area1: {
    name: '云麓山麓',
    description: '初入修行之地，妖兽出没',
    encounters: [
      // 普通遭遇 - 单怪
      {
        id: 'a1_normal_1',
        weight: 30,
        enemies: [
          { enemyId: 'slime', level: 1 }
        ],
        reward: { gold: [5, 10], cards: 1 }
      },
      {
        id: 'a1_normal_2',
        weight: 25,
        enemies: [
          { enemyId: 'goblin_scout', level: 1 }
        ],
        reward: { gold: [5, 12], cards: 1 }
      },
      {
        id: 'a1_normal_3',
        weight: 20,
        enemies: [
          { enemyId: 'wolf', level: 1 }
        ],
        reward: { gold: [8, 15], cards: 1 }
      },
      
      // 普通遭遇 - 双怪
      {
        id: 'a1_normal_4',
        weight: 15,
        enemies: [
          { enemyId: 'slime', level: 1 },
          { enemyId: 'slime', level: 1 }
        ],
        reward: { gold: [10, 18], cards: 1 }
      },
      {
        id: 'a1_normal_5',
        weight: 10,
        enemies: [
          { enemyId: 'goblin_scout', level: 1 },
          { enemyId: 'goblin_scout', level: 1 }
        ],
        reward: { gold: [12, 20], cards: 1 }
      },
      
      // 精英遭遇
      {
        id: 'a1_elite_1',
        weight: 50,
        type: 'elite',
        enemies: [
          { enemyId: 'ogre', level: 2 }
        ],
        reward: { gold: [25, 40], cards: 2, relic: 1 }
      },
      {
        id: 'a1_elite_2',
        weight: 40,
        type: 'elite',
        enemies: [
          { enemyId: 'dark_mage', level: 2 },
          { enemyId: 'goblin_scout', level: 1 }
        ],
        reward: { gold: [30, 45], cards: 2, relic: 1 }
      },
      
      // Boss 遭遇
      {
        id: 'a1_boss_1',
        weight: 100,
        type: 'boss',
        enemies: [
          { enemyId: 'mountain_king', level: 3 }
        ],
        reward: { gold: [80, 120], cards: 3, relic: 1, bossRelic: true }
      }
    ]
  },
  
  // ========== 第二区域：幽冥秘境 ==========
  area2: {
    name: '幽冥秘境',
    description: '阴气弥漫，亡灵横行',
    encounters: [
      // 普通遭遇
      {
        id: 'a2_normal_1',
        weight: 30,
        enemies: [
          { enemyId: 'skeleton', level: 3 }
        ],
        reward: { gold: [10, 18], cards: 1 }
      },
      {
        id: 'a2_normal_2',
        weight: 25,
        enemies: [
          { enemyId: 'zombie', level: 3 }
        ],
        reward: { gold: [12, 20], cards: 1 }
      },
      {
        id: 'a2_normal_3',
        weight: 20,
        enemies: [
          { enemyId: 'ghost', level: 3 }
        ],
        reward: { gold: [15, 25], cards: 1 }
      },
      
      // 普通遭遇 - 多怪
      {
        id: 'a2_normal_4',
        weight: 15,
        enemies: [
          { enemyId: 'skeleton', level: 3 },
          { enemyId: 'skeleton', level: 3 }
        ],
        reward: { gold: [18, 30], cards: 1 }
      },
      {
        id: 'a2_normal_5',
        weight: 10,
        enemies: [
          { enemyId: 'zombie', level: 3 },
          { enemyId: 'ghost', level: 3 }
        ],
        reward: { gold: [20, 35], cards: 1 }
      },
      
      // 精英遭遇
      {
        id: 'a2_elite_1',
        weight: 50,
        type: 'elite',
        enemies: [
          { enemyId: 'lich', level: 4 }
        ],
        reward: { gold: [40, 60], cards: 2, relic: 1 }
      },
      {
        id: 'a2_elite_2',
        weight: 40,
        type: 'elite',
        enemies: [
          { enemyId: 'death_knight', level: 4 }
        ],
        reward: { gold: [45, 65], cards: 2, relic: 1 }
      },
      
      // Boss 遭遇
      {
        id: 'a2_boss_1',
        weight: 100,
        type: 'boss',
        enemies: [
          { enemyId: 'bone_dragon', level: 5 }
        ],
        reward: { gold: [100, 150], cards: 3, relic: 1, bossRelic: true }
      }
    ]
  },
  
  // ========== 第三区域：天穹仙域 ==========
  area3: {
    name: '天穹仙域',
    description: '仙境之巅，强者云集',
    encounters: [
      // 普通遭遇
      {
        id: 'a3_normal_1',
        weight: 30,
        enemies: [
          { enemyId: 'celestial_guard', level: 5 }
        ],
        reward: { gold: [20, 35], cards: 1 }
      },
      {
        id: 'a3_normal_2',
        weight: 25,
        enemies: [
          { enemyId: 'phoenix_spawn', level: 5 }
        ],
        reward: { gold: [25, 40], cards: 1 }
      },
      {
        id: 'a3_normal_3',
        weight: 20,
        enemies: [
          { enemyId: 'dragon_whelp', level: 5 }
        ],
        reward: { gold: [30, 45], cards: 1 }
      },
      
      // 精英遭遇
      {
        id: 'a3_elite_1',
        weight: 50,
        type: 'elite',
        enemies: [
          { enemyId: 'immortal', level: 6 }
        ],
        reward: { gold: [60, 90], cards: 2, relic: 1 }
      },
      {
        id: 'a3_elite_2',
        weight: 40,
        type: 'elite',
        enemies: [
          { enemyId: 'demon_lord', level: 6 }
        ],
        reward: { gold: [70, 100], cards: 2, relic: 1 }
      },
      
      // Boss 遭遇 - 最终 Boss
      {
        id: 'a3_boss_1',
        weight: 100,
        type: 'boss',
        enemies: [
          { enemyId: 'heaven_emperor', level: 7 }
        ],
        reward: { gold: [150, 250], cards: 4, relic: 1, bossRelic: true }
      }
    ]
  }
};

/**
 * 事件遭遇（非战斗）
 */
export const Events = [
  {
    id: 'event_mysterious_merchant',
    name: '神秘商人',
    description: '一个神秘的商人出现在你面前',
    options: [
      {
        text: '购买物品',
        effect: 'shop',
        cost: 0
      },
      {
        text: '离开',
        effect: 'leave',
        cost: 0
      }
    ]
  },
  {
    id: 'event_rest_site',
    name: '休息点',
    description: '发现一个安全的休息点',
    options: [
      {
        text: '休息 (恢复 30% 生命)',
        effect: 'heal_30',
        cost: 0
      },
      {
        text: '锻造 (升级一张牌)',
        effect: 'upgrade_card',
        cost: 0
      },
      {
        text: '离开',
        effect: 'leave',
        cost: 0
      }
    ]
  },
  {
    id: 'event_treasure',
    name: '宝箱',
    description: '发现一个宝箱！',
    options: [
      {
        text: '打开',
        effect: 'get_gold',
        goldRange: [30, 60]
      },
      {
        text: '离开',
        effect: 'leave',
        cost: 0
      }
    ]
  },
  {
    id: 'event_cursed_fountain',
    name: '诅咒之泉',
    description: '一口散发着不祥气息的泉水',
    options: [
      {
        text: '饮用 (获得遗物，但受到诅咒)',
        effect: 'get_cursed_relic',
        cost: 'hp_10'
      },
      {
        text: '离开',
        effect: 'leave',
        cost: 0
      }
    ]
  },
  {
    id: 'event_training_ground',
    name: '修炼场',
    description: '古老的修炼场，可以在此提升实力',
    options: [
      {
        text: '修炼 (获得 2 层力量)',
        effect: 'gain_strength_2',
        cost: 'hp_5'
      },
      {
        text: '离开',
        effect: 'leave',
        cost: 0
      }
    ]
  }
];

/**
 * 根据区域获取遭遇列表
 * @param {string} areaId - 区域 ID
 * @returns {Array} 遭遇列表
 */
export function getEncountersForArea(areaId) {
  const area = Encounters[areaId];
  if (!area) return [];
  return area.encounters;
}

/**
 * 随机选择一个遭遇
 * @param {string} areaId - 区域 ID
 * @param {string} type - 遭遇类型 (normal/elite/boss)
 * @returns {Object|null} 选中的遭遇
 */
export function getRandomEncounter(areaId, type = 'normal') {
  const encounters = getEncountersForArea(areaId);
  const filtered = encounters.filter(e => {
    if (type === 'normal' && !e.type) return true;
    return e.type === type;
  });
  
  if (filtered.length === 0) return null;
  
  // 根据权重随机选择
  const totalWeight = filtered.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const encounter of filtered) {
    random -= encounter.weight;
    if (random <= 0) return encounter;
  }
  
  return filtered[filtered.length - 1];
}

/**
 * 获取所有事件
 * @returns {Array} 事件列表
 */
export function getAllEvents() {
  return Events;
}

/**
 * 随机选择一个事件
 * @returns {Object} 选中的事件
 */
export function getRandomEvent() {
  const index = Math.floor(Math.random() * Events.length);
  return Events[index];
}

export default { Encounters, Events, getEncountersForArea, getRandomEncounter, getAllEvents, getRandomEvent };
