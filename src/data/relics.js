/**
 * 遗物系统 - Relics
 * 提供被动增益的装备
 */

export const RELIC_LIBRARY = [
  // ========== 普通遗物 ==========
  
  {
    id: 'vitality_ring',
    name: '生命之戒',
    tier: 'common',
    description: '最大生命 +12',
    icon: '💍',
    effects: {
      maxHp: 12
    }
  },
  
  {
    id: 'strength_gauntlet',
    name: '力量手套',
    tier: 'common',
    description: '战斗开始时获得 2 层力量',
    icon: '🥊',
    effects: {
      onBattleStart: { self: { strength: 2 } }
    }
  },
  
  {
    id: 'dexterity_boots',
    name: '敏捷之靴',
    tier: 'common',
    description: '战斗开始时获得 2 层敏捷',
    icon: '👢',
    effects: {
      onBattleStart: { self: { dexterity: 2 } }
    }
  },
  
  {
    id: 'gold_coin',
    name: '幸运金币',
    tier: 'common',
    description: '战斗胜利后额外获得 5 金币',
    icon: '🪙',
    effects: {
      onVictory: { gold: 5 }
    }
  },
  
  {
    id: 'card_bag',
    name: '卡包',
    tier: 'common',
    description: '初始手牌 +1',
    icon: '🎒',
    effects: {
      drawExtra: 1
    }
  },
  
  {
    id: 'energy_crystal',
    name: '能量水晶',
    tier: 'common',
    description: '每回合能量 +1',
    icon: '💎',
    effects: {
      extraEnergy: 1
    }
  },
  
  {
    id: 'healing_potion',
    name: '治疗药水',
    tier: 'common',
    description: '战斗开始时恢复 10 点生命',
    icon: '🧪',
    effects: {
      onBattleStart: { heal: 10 }
    }
  },
  
  {
    id: 'thorn_armor',
    name: '荆棘甲',
    tier: 'common',
    description: '受到攻击时反弹 3 点伤害',
    icon: '🛡️',
    effects: {
      thorns: 3
    }
  },
  
  {
    id: 'focus_amulet',
    name: '集中项链',
    tier: 'common',
    description: '战斗开始时获得 1 层集中',
    icon: '📿',
    effects: {
      onBattleStart: { self: { focus: 1 } }
    }
  },
  
  {
    id: 'block_ring',
    name: '格挡之戒',
    tier: 'common',
    description: '每回合开始时额外获得 3 点格挡',
    icon: '💍',
    effects: {
      onTurnStart: { block: 3 }
    }
  },
  
  // ========== 稀有遗物 ==========
  
  {
    id: 'dragon_scale',
    name: '龙鳞',
    tier: 'uncommon',
    description: '最大生命 +20，战斗开始时获得 2 层再生',
    icon: '🐉',
    effects: {
      maxHp: 20,
      onBattleStart: { self: { regenerate: 2 } }
    }
  },
  
  {
    id: 'phoenix_feather',
    name: '凤凰羽毛',
    tier: 'uncommon',
    description: '生命首次降为 0 时复活，恢复 30% 生命（每场战斗一次）',
    icon: '🪶',
    effects: {
      revive: { hpPercent: 0.3, oncePerBattle: true }
    }
  },
  
  {
    id: 'demon_mask',
    name: '恶魔面具',
    tier: 'uncommon',
    description: '力量 +3，但每回合结束时失去 2 点生命',
    icon: '🎭',
    effects: {
      strength: 3,
      onTurnEnd: { self: { hp: -2 } }
    }
  },
  
  {
    id: 'time_hourglass',
    name: '时光沙漏',
    tier: 'uncommon',
    description: '每 3 回合，获得一个额外回合',
    icon: '⏳',
    effects: {
      extraTurnEvery: 3
    }
  },
  
  {
    id: 'card_master_scroll',
    name: '卡牌大师卷轴',
    tier: 'uncommon',
    description: '每使用 10 张牌，随机升级一张手牌',
    icon: '📜',
    effects: {
      upgradeOnCardCount: 10
    }
  },
  
  {
    id: 'vampire_cape',
    name: '吸血鬼披风',
    tier: 'uncommon',
    description: '攻击造成伤害时，恢复 2 点生命',
    icon: '🦇',
    effects: {
      lifesteal: 2
    }
  },
  
  {
    id: 'storm_cloak',
    name: '风暴斗篷',
    tier: 'uncommon',
    description: '每回合开始时，对所有敌人造成 3 点伤害',
    icon: '🌪️',
    effects: {
      onTurnStart: { damageAllEnemies: 3 }
    }
  },
  
  {
    id: 'treasure_compass',
    name: '宝藏罗盘',
    tier: 'uncommon',
    description: '地图上显示宝箱位置',
    icon: '🧭',
    effects: {
      revealTreasure: true
    }
  },
  
  {
    id: 'mystic_eye',
    name: '神秘之眼',
    tier: 'uncommon',
    description: '可以看到敌人的下一个意图',
    icon: '👁️',
    effects: {
      revealEnemyIntent: true
    }
  },
  
  {
    id: 'ancient_coin',
    name: '古币',
    tier: 'uncommon',
    description: '商店物品价格 -20%',
    icon: '🪙',
    effects: {
      shopDiscount: 0.2
    }
  },
  
  // ========== Boss 遗物 ==========
  
  {
    id: 'heart_of_mountain',
    name: '山岭之心',
    tier: 'boss',
    description: '最大生命 +50，每回合开始时获得 5 点格挡',
    icon: '🏔️',
    effects: {
      maxHp: 50,
      onTurnStart: { block: 5 }
    }
  },
  
  {
    id: 'dragon_heart',
    name: '龙心',
    tier: 'boss',
    description: '最大生命 +40，攻击时 25% 几率施加 2 层燃烧',
    icon: '❤️',
    effects: {
      maxHp: 40,
      onAttack: { chance: 0.25, applyStatus: { burn: 2 } }
    }
  },
  
  {
    id: 'crown_of_kings',
    name: '王者之冠',
    tier: 'boss',
    description: '每回合能量 +2',
    icon: '👑',
    effects: {
      extraEnergy: 2
    }
  },
  
  {
    id: 'infinity_blade',
    name: '无尽之刃',
    tier: 'boss',
    description: '力量 +5',
    icon: '⚔️',
    effects: {
      strength: 5
    }
  },
  
  {
    id: 'eternal_armor',
    name: '永恒护甲',
    tier: 'boss',
    description: '战斗开始时获得 15 点永久格挡（不重置）',
    icon: '🛡️',
    effects: {
      onBattleStart: { permanentBlock: 15 }
    }
  },
  
  {
    id: 'soul_gem',
    name: '灵魂宝石',
    tier: 'boss',
    description: '每杀死一个敌人，获得 1 层力量（永久）',
    icon: '💀',
    effects: {
      onEnemyDeath: { strength: 1 }
    }
  },
  
  {
    id: 'void_orb',
    name: '虚空宝珠',
    tier: 'boss',
    description: '回合结束时，对所有敌人施加 2 层虚弱',
    icon: '🔮',
    effects: {
      onTurnEnd: { applyToAllEnemies: { weak: 2 } }
    }
  },
  
  {
    id: 'divine_protection',
    name: '神圣庇护',
    tier: 'boss',
    description: '免疫所有负面状态',
    icon: '✨',
    effects: {
      immuneToDebuffs: true
    }
  },
  
  {
    id: 'chaos_orb',
    name: '混沌宝珠',
    tier: 'boss',
    description: '每回合开始时，随机获得 3 层正面或负面状态',
    icon: '🎲',
    effects: {
      onTurnStart: { randomStatus: 3 }
    }
  },
  
  {
    id: 'time_crystal',
    name: '时间水晶',
    tier: 'boss',
    description: '死亡时，回溯到 3 回合前的状态（生命、手牌）',
    icon: '💠',
    effects: {
      timeRewind: { turns: 3, oncePerRun: true }
    }
  },
  
  // ========== 商店遗物 ==========
  
  {
    id: 'membership_card',
    name: '会员证',
    tier: 'shop',
    description: '商店出现率 +50%',
    icon: '💳',
    effects: {
      shopChance: 0.5
    }
  },
  
  {
    id: 'discount_coupon',
    name: '折扣券',
    tier: 'shop',
    description: '第一次商店购物免费',
    icon: '🎫',
    effects: {
      firstPurchaseFree: true
    }
  },
  
  // ========== 诅咒遗物 ==========
  
  {
    id: 'cursed_amulet',
    name: '诅咒项链',
    tier: 'cursed',
    description: '力量 +5，但最大生命 -20',
    icon: '📿',
    effects: {
      strength: 5,
      maxHp: -20
    },
    curse: true
  },
  
  {
    id: 'blood_bound_blade',
    name: '血缚之刃',
    tier: 'cursed',
    description: '攻击 +5，但每次攻击失去 1 点生命',
    icon: '🗡️',
    effects: {
      attackBonus: 5,
      onAttack: { self: { hp: -1 } }
    },
    curse: true
  },
  
  {
    id: 'greed_ring',
    name: '贪婪之戒',
    tier: 'cursed',
    description: '获得金币 +50%，但无法从休息点恢复生命',
    icon: '💍',
    effects: {
      goldBonus: 0.5,
      noHealing: true
    },
    curse: true
  }
];

/**
 * 根据 ID 获取遗物数据
 * @param {string} relicId - 遗物 ID
 * @returns {Object|null} 遗物数据
 */
export function getRelicById(relicId) {
  return RELIC_LIBRARY.find(r => r.id === relicId) || null;
}

/**
 * 根据稀有度获取遗物列表
 * @param {string} tier - 稀有度 (common/uncommon/boss/shop/cursed)
 * @returns {Array} 遗物列表
 */
export function getRelicsByTier(tier) {
  return RELIC_LIBRARY.filter(r => r.tier === tier);
}

/**
 * 获取随机遗物
 * @param {string} tier - 稀有度（可选）
 * @returns {Object} 随机遗物
 */
export function getRandomRelic(tier = null) {
  let pool = RELIC_LIBRARY;
  if (tier) {
    pool = RELIC_LIBRARY.filter(r => r.tier === tier);
  }
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * 获取所有遗物
 * @returns {Array} 所有遗物
 */
export function getAllRelics() {
  return RELIC_LIBRARY;
}

export default { RELIC_LIBRARY, getRelicById, getRelicsByTier, getRandomRelic, getAllRelics };
