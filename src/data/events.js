/**
 * 事件系统 - Events
 * 非战斗遭遇事件
 */

export const EVENT_LIBRARY = [
  {
    id: 'mysterious_merchant',
    name: '神秘商人',
    icon: '🏪',
    description: '一个戴着斗笠的神秘商人出现在路边，他的摊位上摆满了各种奇珍异宝。',
    options: [
      {
        id: 'shop',
        text: '看看有什么好货',
        effect: 'open_shop',
        cost: null
      },
      {
        id: 'leave',
        text: '继续赶路',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'rest_site',
    name: '休息点',
    icon: '⛺',
    description: '发现一个安全的营地，篝火还在燃烧，似乎不久前有人在此休息。',
    options: [
      {
        id: 'rest',
        text: '休息（恢复 30% 最大生命）',
        effect: 'heal_percent',
        value: 0.3,
        cost: null
      },
      {
        id: 'upgrade',
        text: '锻造（升级一张手牌）',
        effect: 'upgrade_card',
        cost: null
      },
      {
        id: 'leave',
        text: '继续赶路',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'treasure_chest',
    name: '宝箱',
    icon: '📦',
    description: '一个古老的宝箱静静地躺在地上，不知道里面有什么宝贝。',
    options: [
      {
        id: 'open',
        text: '打开宝箱',
        effect: 'get_gold',
        goldRange: [40, 80],
        cost: null
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'cursed_fountain',
    name: '诅咒之泉',
    icon: '⛲',
    description: '一口散发着紫色雾气的泉水，隐约能听到诡异的低语声。',
    options: [
      {
        id: 'drink',
        text: '饮用泉水（获得一件遗物，但最大生命 -10）',
        effect: 'get_cursed_relic',
        cost: { maxHp: -10 }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'training_ground',
    name: '修炼场',
    icon: '🥋',
    description: '一处古老的修炼场，石壁上刻满了功法秘籍。',
    options: [
      {
        id: 'train',
        text: '修炼（获得 2 层力量，失去 5 点生命）',
        effect: 'gain_strength',
        value: 2,
        cost: { hp: -5 }
      },
      {
        id: 'meditate',
        text: '冥想（获得 2 层敏捷，失去 5 点生命）',
        effect: 'gain_dexterity',
        value: 2,
        cost: { hp: -5 }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'shrine',
    name: '祭坛',
    icon: '🏛️',
    description: '一座古老的祭坛，上面供奉着不知名的神明。',
    options: [
      {
        id: 'pray_strength',
        text: '祈求力量（50% 获得 3 层力量，50% 失去 3 点生命）',
        effect: 'gamble_strength',
        chance: 0.5,
        success: { strength: 3 },
        failure: { hp: -3 }
      },
      {
        id: 'pray_gold',
        text: '祈求财富（50% 获得 50 金币，50% 失去 10 点生命）',
        effect: 'gamble_gold',
        chance: 0.5,
        success: { gold: 50 },
        failure: { hp: -10 }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'lost_traveler',
    name: '迷途旅人',
    icon: '🧑',
    description: '一个疲惫的旅人坐在路边，似乎遇到了麻烦。',
    options: [
      {
        id: 'help',
        text: '帮助他（失去 20 金币，获得一件随机遗物）',
        effect: 'help_traveler',
        cost: { gold: -20 },
        reward: { relic: 1 }
      },
      {
        id: 'ignore',
        text: '无视他',
        effect: 'leave',
        cost: null
      },
      {
        id: 'rob',
        text: '打劫他（获得 30 金币，但获得 1 层诅咒）',
        effect: 'rob_traveler',
        reward: { gold: 30 },
        cost: { curse: 1 }
      }
    ]
  },
  
  {
    id: 'magic_pool',
    name: '魔法池',
    icon: '🌊',
    description: '一池泛着蓝光的池水，水面倒映着奇异的景象。',
    options: [
      {
        id: 'bathe',
        text: '沐浴（恢复 15 点生命，移除所有负面状态）',
        effect: 'cleanse',
        heal: 15,
        removeDebuffs: true,
        cost: null
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'ancient_library',
    name: '古老图书馆',
    icon: '📚',
    description: '一座废弃的图书馆，书架上摆满了泛黄的古籍。',
    options: [
      {
        id: 'study',
        text: '研读古籍（从 3 张牌中选择 1 张加入卡组）',
        effect: 'choose_card',
        cardCount: 3,
        cost: null
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'combat_training',
    name: '战斗训练',
    icon: '⚔️',
    description: '一个武艺高强的武者正在练武，他邀请你切磋。',
    options: [
      {
        id: 'fight',
        text: '接受挑战（与一个精英敌人战斗，胜利后获得额外奖励）',
        effect: 'bonus_combat',
        enemyType: 'elite',
        bonusReward: { gold: 30, relic: 1 }
      },
      {
        id: 'leave',
        text: '婉拒',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'golden_idol',
    name: '黄金神像',
    icon: '🗿',
    description: '一尊闪闪发光的黄金神像，散发着神秘的力量。',
    options: [
      {
        id: 'take',
        text: '带走神像（获得一件 Boss 遗物，但下一场战斗敌人更强）',
        effect: 'get_boss_relic',
        cost: { nextCombatHarder: true }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'card_master',
    name: '卡牌大师',
    icon: '🎴',
    description: '一位精通卡牌之道的大师，他愿意传授你一些技巧。',
    options: [
      {
        id: 'learn',
        text: '学习（从 3 张牌中选择 1 张升级）',
        effect: 'free_upgrade',
        cardCount: 3,
        cost: null
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'black_market',
    name: '黑市',
    icon: '🏴',
    description: '一个隐蔽的黑市，这里出售一些见不得光的东西。',
    options: [
      {
        id: 'shop',
        text: '逛逛（商品打折，但可能买到假货）',
        effect: 'black_market_shop',
        discount: 0.7,
        curseChance: 0.2
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'ghost_encounter',
    name: '幽灵遭遇',
    icon: '👻',
    description: '一个半透明的幽灵漂浮在你面前，它似乎有话要说。',
    options: [
      {
        id: 'listen',
        text: '倾听（获得一件遗物，但失去 10 点最大生命）',
        effect: 'ghost_gift',
        reward: { relic: 1 },
        cost: { maxHp: -10 }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  },
  
  {
    id: 'fortune_teller',
    name: '占卜师',
    icon: '🔮',
    description: '一个神秘的占卜师，她说能预见你的未来。',
    options: [
      {
        id: 'fortune',
        text: '占卜（预览下一个节点的类型）',
        effect: 'reveal_next',
        cost: { gold: -15 }
      },
      {
        id: 'leave',
        text: '离开',
        effect: 'leave',
        cost: null
      }
    ]
  }
];

/**
 * 获取事件数据
 * @param {string} eventId - 事件 ID
 * @returns {Object|null} 事件数据
 */
export function getEventById(eventId) {
  return EVENT_LIBRARY.find(e => e.id === eventId) || null;
}

/**
 * 随机选择一个事件
 * @returns {Object} 选中的事件
 */
export function getRandomEvent() {
  const index = Math.floor(Math.random() * EVENT_LIBRARY.length);
  return EVENT_LIBRARY[index];
}

/**
 * 获取所有事件
 * @returns {Array} 所有事件
 */
export function getAllEvents() {
  return EVENT_LIBRARY;
}

export default { EVENT_LIBRARY, getEventById, getRandomEvent, getAllEvents };
