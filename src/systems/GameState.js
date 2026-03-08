/**
 * 游戏状态管理系统 - GameState
 * 管理全局游戏状态、玩家数据、进度等
 */

import { getAllStatusEffects, calculateDamageWithEffects } from '../data/statusEffects.js';

export class GameState {
  constructor() {
    // 玩家基础数据
    this.player = {
      name: '修行者',
      maxHp: 72,
      hp: 72,
      gold: 99,
      
      // 战斗属性
      strength: 0,
      dexterity: 0,
      focus: 0,
      
      // 卡组
      deck: [],
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      
      // 遗物
      relics: [],
      
      // 状态效果
      statusEffects: new Map(),
      
      // 能量
      maxEnergy: 3,
      currentEnergy: 3,
      
      // 格挡
      block: 0
    };
    
    // 游戏进度
    this.runData = {
      currentArea: 0,
      currentFloor: 1,
      maxFloors: 15,
      
      // 地图节点
      mapNodes: [],
      currentNode: null,
      
      // 统计数据
      cardsDrawn: 0,
      cardsPlayed: 0,
      damageDealt: 0,
      damageTaken: 0,
      enemiesDefeated: 0,
      goldEarned: 0,
      
      // 解锁内容
      unlockedCards: [],
      unlockedRelics: [],
      unlockedCharacters: ['cultivator']
    };
    
    // 存档槽位
    this.saveSlots = 3;
    
    // 游戏配置
    this.config = {
      initialDraw: 5,
      handSize: 10,
      energyPerTurn: 3
    };
  }
  
  // ========== 玩家属性 ==========
  
  /**
   * 设置玩家职业
   */
  setCharacter(characterId) {
    const characters = {
      cultivator: {
        name: '修仙者',
        maxHp: 72,
        energy: 3,
        deck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'meditate', 'qi_charge']
      },
      warrior: {
        name: '武者',
        maxHp: 80,
        energy: 3,
        deck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash', 'cleave']
      },
      mage: {
        name: '法师',
        maxHp: 60,
        energy: 4,
        deck: ['strike', 'strike', 'defend', 'defend', 'fireball', 'arcane_intellect', 'zap']
      }
    };
    
    const char = characters[characterId];
    if (!char) return false;
    
    this.player.name = char.name;
    this.player.maxHp = char.maxHp;
    this.player.hp = char.maxHp;
    this.player.maxEnergy = char.energy;
    this.player.currentEnergy = char.energy;
    this.player.deck = [...char.deck];
    
    return true;
  }
  
  /**
   * 恢复生命
   */
  heal(amount) {
    const actualHeal = Math.min(amount, this.player.maxHp - this.player.hp);
    this.player.hp += actualHeal;
    return actualHeal;
  }
  
  /**
   * 恢复百分比生命
   */
  healPercent(percent) {
    const amount = Math.floor(this.player.maxHp * percent);
    return this.heal(amount);
  }
  
  /**
   * 受到伤害
   */
  takeDamage(amount, options = {}) {
    // 先扣除格挡
    let remainingDamage = amount;
    
    if (this.player.block > 0) {
      const blocked = Math.min(this.player.block, remainingDamage);
      this.player.block -= blocked;
      remainingDamage -= blocked;
    }
    
    // 计算实际伤害（考虑状态效果）
    const finalDamage = Math.max(0, remainingDamage);
    this.player.hp -= finalDamage;
    
    return {
      blocked: amount - finalDamage,
      actualDamage: finalDamage,
      isDead: this.player.hp <= 0
    };
  }
  
  // ========== 状态效果 ==========
  
  /**
   * 添加状态效果
   */
  addStatusEffect(effectId, stacks = 1, target = 'self') {
    const effect = getAllStatusEffects()[effectId];
    if (!effect) return false;
    
    const currentStacks = this.player.statusEffects.get(effectId) || 0;
    const newStacks = Math.min(currentStacks + stacks, effect.maxStacks);
    this.player.statusEffects.set(effectId, newStacks);
    
    return true;
  }
  
  /**
   * 移除状态效果
   */
  removeStatusEffect(effectId) {
    return this.player.statusEffects.delete(effectId);
  }
  
  /**
   * 清除所有负面状态
   */
  clearDebuffs() {
    const debuffs = ['weak', 'vulnerable', 'poison', 'burn', 'stun', 'sealed'];
    debuffs.forEach(debuff => this.removeStatusEffect(debuff));
  }
  
  /**
   * 清除所有状态
   */
  clearAllStatus() {
    this.player.statusEffects.clear();
  }
  
  // ========== 卡组管理 ==========
  
  /**
   * 初始化卡组
   */
  initializeDeck() {
    this.player.drawPile = [...this.player.deck];
    this.player.hand = [];
    this.player.discardPile = [];
    this.player.exhaustPile = [];
    this.shuffleDrawPile();
  }
  
  /**
   * 洗牌
   */
  shuffleDrawPile() {
    for (let i = this.player.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.player.drawPile[i], this.player.drawPile[j]] = 
        [this.player.drawPile[j], this.player.drawPile[i]];
    }
  }
  
  /**
   * 抽牌
   */
  drawCards(count = 5) {
    const drawn = [];
    
    for (let i = 0; i < count; i++) {
      // 如果牌库空了，从弃牌堆洗牌
      if (this.player.drawPile.length === 0) {
        if (this.player.discardPile.length === 0) break;
        this.player.drawPile = [...this.player.discardPile];
        this.player.discardPile = [];
        this.shuffleDrawPile();
      }
      
      const card = this.player.drawPile.pop();
      this.player.hand.push(card);
      drawn.push(card);
    }
    
    this.runData.cardsDrawn += drawn.length;
    return drawn;
  }
  
  /**
   * 打牌
   */
  playCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= this.player.hand.length) return null;
    
    const card = this.player.hand.splice(cardIndex, 1)[0];
    this.player.discardPile.push(card);
    this.runData.cardsPlayed++;
    
    return card;
  }
  
  /**
   * 升级卡牌
   */
  upgradeCard(cardName) {
    const index = this.player.deck.findIndex(c => c === cardName);
    if (index === -1) return false;
    
    this.player.deck[index] = `${cardName}+`;
    return true;
  }
  
  // ========== 遗物管理 ==========
  
  /**
   * 添加遗物
   */
  addRelic(relicId) {
    if (this.player.relics.includes(relicId)) return false;
    this.player.relics.push(relicId);
    this.runData.unlockedRelics.push(relicId);
    return true;
  }
  
  /**
   * 移除遗物
   */
  removeRelic(relicId) {
    const index = this.player.relics.indexOf(relicId);
    if (index === -1) return false;
    this.player.relics.splice(index, 1);
    return true;
  }
  
  /**
   * 检查是否拥有遗物
   */
  hasRelic(relicId) {
    return this.player.relics.includes(relicId);
  }
  
  // ========== 能量管理 ==========
  
  /**
   * 使用能量
   */
  useEnergy(amount) {
    if (this.player.currentEnergy < amount) return false;
    this.player.currentEnergy -= amount;
    return true;
  }
  
  /**
   * 恢复能量
   */
  restoreEnergy(amount = null) {
    if (amount === null) {
      this.player.currentEnergy = this.player.maxEnergy;
    } else {
      this.player.currentEnergy = Math.min(
        this.player.currentEnergy + amount,
        this.player.maxEnergy
      );
    }
  }
  
  // ========== 回合管理 ==========
  
  /**
   * 开始新回合
   */
  startTurn() {
    // 恢复能量
    this.restoreEnergy();
    
    // 重置格挡
    this.player.block = 0;
    
    // 处理回合开始效果
    this.player.relics.forEach(relicId => {
      // TODO: 触发遗物的回合开始效果
    });
    
    // 抽牌
    this.drawCards(this.config.initialDraw);
  }
  
  /**
   * 结束回合
   */
  endTurn() {
    // 手牌移入弃牌堆
    this.player.discardPile.push(...this.player.hand);
    this.player.hand = [];
    
    // 处理回合结束效果（中毒、燃烧等）
    this.handleEndOfTurnEffects();
  }
  
  /**
   * 处理回合结束效果
   */
  handleEndOfTurnEffects() {
    const effectsToRemove = [];
    
    this.player.statusEffects.forEach((stacks, effectId) => {
      const effect = getAllStatusEffects()[effectId];
      if (!effect) return;
      
      // 中毒伤害
      if (effectId === 'poison' && effect.damagePerStack) {
        const damage = stacks * effect.damagePerStack;
        this.takeDamage(damage);
      }
      
      // 燃烧伤害
      if (effectId === 'burn' && effect.damagePerStack) {
        const damage = stacks * effect.damagePerStack;
        this.takeDamage(damage);
      }
      
      // 再生治疗
      if (effectId === 'regenerate' && effect.healPerStack) {
        const heal = stacks * effect.healPerStack;
        this.heal(heal);
      }
      
      // 检查是否需要移除
      if (effect.removeOnTurnEnd) {
        effectsToRemove.push(effectId);
      }
    });
    
    // 移除到期效果
    effectsToRemove.forEach(id => this.removeStatusEffect(id));
  }
  
  // ========== 金币管理 ==========
  
  /**
   * 获得金币
   */
  addGold(amount) {
    this.player.gold += amount;
    this.runData.goldEarned += amount;
  }
  
  /**
   * 花费金币
   */
  spendGold(amount) {
    if (this.player.gold < amount) return false;
    this.player.gold -= amount;
    return true;
  }
  
  // ========== 地图管理 ==========
  
  /**
   * 生成地图
   */
  generateMap() {
    const floors = this.runData.maxFloors;
    const nodes = [];
    
    for (let floor = 1; floor <= floors; floor++) {
      const floorNodes = this.generateFloorNodes(floor);
      nodes.push(floorNodes);
    }
    
    this.runData.mapNodes = nodes;
    return nodes;
  }
  
  /**
   * 生成单层节点
   */
  generateFloorNodes(floor) {
    const nodeCount = 5 + Math.floor(floor / 3);
    const nodes = [];
    const nodeTypes = ['combat', 'combat', 'combat', 'event', 'rest', 'shop', 'elite'];
    
    // Boss 层
    if (floor % 5 === 0) {
      return [{ type: 'boss', id: `floor_${floor}_boss` }];
    }
    
    for (let i = 0; i < nodeCount; i++) {
      const typeIndex = Math.floor(Math.random() * nodeTypes.length);
      nodes.push({
        type: nodeTypes[typeIndex],
        id: `floor_${floor}_node_${i}`,
        floor: floor,
        visited: false,
        unlocked: i === 0 // 第一个节点默认解锁
      });
    }
    
    return nodes;
  }
  
  // ========== 存档系统 ==========
  
  /**
   * 保存游戏
   */
  save(slot = 0) {
    const saveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      player: { ...this.player, statusEffects: Array.from(this.player.statusEffects.entries()) },
      runData: this.runData,
      config: this.config
    };
    
    try {
      localStorage.setItem(`qi_tower_save_${slot}`, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }
  
  /**
   * 加载游戏
   */
  load(slot = 0) {
    try {
      const saveStr = localStorage.getItem(`qi_tower_save_${slot}`);
      if (!saveStr) return false;
      
      const saveData = JSON.parse(saveStr);
      
      // 恢复玩家数据
      this.player = {
        ...saveData.player,
        statusEffects: new Map(saveData.player.statusEffects)
      };
      this.runData = saveData.runData;
      this.config = saveData.config;
      
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }
  
  /**
   * 删除存档
   */
  deleteSave(slot = 0) {
    localStorage.removeItem(`qi_tower_save_${slot}`);
  }
  
  /**
   * 检查是否有存档
   */
  hasSave(slot = 0) {
    return localStorage.getItem(`qi_tower_save_${slot}`) !== null;
  }
  
  // ========== 统计 ==========
  
  /**
   * 获取统计数据
   */
  getStats() {
    return {
      ...this.runData,
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      playerGold: this.player.gold,
      deckSize: this.player.deck.length,
      relicCount: this.player.relics.length
    };
  }
  
  /**
   * 重置游戏
   */
  reset() {
    this.player = {
      name: '修行者',
      maxHp: 72,
      hp: 72,
      gold: 99,
      strength: 0,
      dexterity: 0,
      focus: 0,
      deck: [],
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      relics: [],
      statusEffects: new Map(),
      maxEnergy: 3,
      currentEnergy: 3,
      block: 0
    };
    
    this.runData = {
      currentArea: 0,
      currentFloor: 1,
      maxFloors: 15,
      mapNodes: [],
      currentNode: null,
      cardsDrawn: 0,
      cardsPlayed: 0,
      damageDealt: 0,
      damageTaken: 0,
      enemiesDefeated: 0,
      goldEarned: 0,
      unlockedCards: [],
      unlockedRelics: [],
      unlockedCharacters: ['cultivator']
    };
  }
}

// 单例
let gameStateInstance = null;

export function getGameState() {
  if (!gameStateInstance) {
    gameStateInstance = new GameState();
  }
  return gameStateInstance;
}

export default GameState;
