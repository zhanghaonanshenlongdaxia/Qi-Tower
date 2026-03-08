/**
 * 状态效果系统 - Status Effects
 * 参考杀戮尖塔的状态机制
 */

export const StatusEffects = {
  // ========== 负面状态 ==========
  
  /** 虚弱 - 造成的伤害减少 */
  weak: {
    id: 'weak',
    name: '虚弱',
    type: 'debuff',
    description: '造成的伤害减少 25%',
    damageModifier: 0.75,  // 伤害乘以 0.75
    icon: '💢',
    color: '#8B4513',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 易伤 - 受到的伤害增加 */
  vulnerable: {
    id: 'vulnerable',
    name: '易伤',
    type: 'debuff',
    description: '受到的伤害增加 50%',
    damageTakenModifier: 1.5,  // 伤害乘以 1.5
    icon: '⚠️',
    color: '#FF4444',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 中毒 - 回合结束时失去生命 */
  poison: {
    id: 'poison',
    name: '中毒',
    type: 'debuff',
    description: '回合结束时失去 X 点生命',
    damagePerStack: 3,  // 每层 3 点伤害
    icon: '☠️',
    color: '#6B8E23',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 燃烧 - 回合结束时失去生命 */
  burn: {
    id: 'burn',
    name: '燃烧',
    type: 'debuff',
    description: '回合结束时失去 X 点生命',
    damagePerStack: 2,
    icon: '🔥',
    color: '#FF6347',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 眩晕 - 跳过下一回合 */
  stun: {
    id: 'stun',
    name: '眩晕',
    type: 'debuff',
    description: '跳过下一回合',
    skipTurn: true,
    icon: '😵',
    color: '#808080',
    maxStacks: 1,
    removeOnTurnEnd: true
  },
  
  /** 封印 - 无法使用卡牌 */
  sealed: {
    id: 'sealed',
    name: '封印',
    type: 'debuff',
    description: '无法使用卡牌',
    preventCardPlay: true,
    icon: '🔒',
    color: '#4B0082',
    maxStacks: 1,
    removeOnTurnEnd: true
  },
  
  // ========== 正面状态 ==========
  
  /** 力量提升 - 造成的伤害增加 */
  strength: {
    id: 'strength',
    name: '力量',
    type: 'buff',
    description: '造成的伤害增加 X 点',
    damageBonus: 3,  // 每层 +3 伤害
    icon: '💪',
    color: '#FFD700',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 敏捷提升 - 获得的格挡增加 */
  dexterity: {
    id: 'dexterity',
    name: '敏捷',
    type: 'buff',
    description: '获得的格挡增加 X 点',
    blockBonus: 2,  // 每层 +2 格挡
    icon: '🏃',
    color: '#87CEEB',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 护体 - 抵消状态伤害 */
  shielding: {
    id: 'shielding',
    name: '护体',
    type: 'buff',
    description: '抵消 X 点状态伤害',
    shieldAmount: 5,  // 每层抵消 5 点伤害
    icon: '🛡️',
    color: '#C0C0C0',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 再生 - 回合结束时恢复生命 */
  regenerate: {
    id: 'regenerate',
    name: '再生',
    type: 'buff',
    description: '回合结束时恢复 X 点生命',
    healPerStack: 2,
    icon: '💚',
    color: '#32CD32',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  /** 集中 - 增加力量/敏捷效果 */
  focus: {
    id: 'focus',
    name: '集中',
    type: 'buff',
    description: '增加 X 点力量和敏捷效果',
    focusBonus: 1,
    icon: '🎯',
    color: '#9370DB',
    maxStacks: 99,
    removeOnTurnEnd: false
  },
  
  // ========== 特殊状态 ==========
  
  /** 无敌 - 免疫所有伤害 */
  invincible: {
    id: 'invincible',
    name: '无敌',
    type: 'special',
    description: '免疫所有伤害',
    immuneToDamage: true,
    icon: '✨',
    color: '#FFD700',
    maxStacks: 1,
    removeOnTurnEnd: true
  },
  
  /** 反射 - 反弹伤害 */
  thorns: {
    id: 'thorns',
    name: '荆棘',
    type: 'special',
    description: '受到攻击时反弹 X 点伤害',
    reflectDamage: 5,
    icon: '🌵',
    color: '#228B22',
    maxStacks: 99,
    removeOnTurnEnd: false
  }
};

/**
 * 获取状态效果数据
 * @param {string} effectId - 效果 ID
 * @returns {Object|null} 状态效果数据
 */
export function getStatusEffect(effectId) {
  return StatusEffects[effectId] || null;
}

/**
 * 获取所有状态效果
 * @returns {Object} 所有状态效果
 */
export function getAllStatusEffects() {
  return StatusEffects;
}

/**
 * 计算状态对伤害的修正
 * @param {number} baseDamage - 基础伤害
 * @param {Array} attackerEffects - 攻击者状态列表
 * @param {Array} defenderEffects - 防御者状态列表
 * @returns {number} 修正后的伤害
 */
export function calculateDamageWithEffects(baseDamage, attackerEffects, defenderEffects) {
  let damage = baseDamage;
  
  // 攻击者虚弱
  if (attackerEffects.has('weak')) {
    const weakEffect = StatusEffects.weak;
    damage *= weakEffect.damageModifier;
  }
  
  // 攻击者力量加成
  if (attackerEffects.has('strength')) {
    const strengthStacks = attackerEffects.get('strength');
    const strengthEffect = StatusEffects.strength;
    damage += strengthStacks * strengthEffect.damageBonus;
  }
  
  // 防御者易伤
  if (defenderEffects.has('vulnerable')) {
    const vulnEffect = StatusEffects.vulnerable;
    damage *= vulnEffect.damageTakenModifier;
  }
  
  return Math.floor(damage);
}

export default StatusEffects;
