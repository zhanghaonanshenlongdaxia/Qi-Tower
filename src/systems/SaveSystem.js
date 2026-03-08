/**
 * 存档系统 - SaveSystem
 * 管理游戏存档的加载、保存、删除
 */

const SAVE_VERSION = '1.0.0';
const MAX_SAVE_SLOTS = 3;

export class SaveSystem {
  constructor() {
    this.savePrefix = 'qi_tower_save_';
  }
  
  /**
   * 获取存档键名
   */
  _getSaveKey(slot) {
    return `${this.savePrefix}${slot}`;
  }
  
  /**
   * 保存游戏
   * @param {number} slot - 存档槽位 (0-2)
   * @param {Object} gameData - 游戏数据
   * @returns {boolean} 是否成功
   */
  save(slot, gameData) {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      console.error('Invalid save slot:', slot);
      return false;
    }
    
    try {
      const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playTime: gameData.playTime || 0,
        player: {
          name: gameData.player.name,
          maxHp: gameData.player.maxHp,
          hp: gameData.player.hp,
          gold: gameData.player.gold,
          strength: gameData.player.strength,
          dexterity: gameData.player.dexterity,
          focus: gameData.player.focus,
          deck: gameData.player.deck,
          relics: gameData.player.relics,
          maxEnergy: gameData.player.maxEnergy,
          statusEffects: Array.from(gameData.player.statusEffects.entries())
        },
        runData: {
          currentArea: gameData.runData.currentArea,
          currentFloor: gameData.runData.currentFloor,
          maxFloors: gameData.runData.maxFloors,
          mapNodes: gameData.runData.mapNodes,
          currentNode: gameData.runData.currentNode,
          cardsDrawn: gameData.runData.cardsDrawn,
          cardsPlayed: gameData.runData.cardsPlayed,
          damageDealt: gameData.runData.damageDealt,
          damageTaken: gameData.runData.damageTaken,
          enemiesDefeated: gameData.runData.enemiesDefeated,
          goldEarned: gameData.runData.goldEarned,
          unlockedCards: gameData.runData.unlockedCards,
          unlockedRelics: gameData.runData.unlockedRelics,
          unlockedCharacters: gameData.runData.unlockedCharacters
        },
        config: gameData.config
      };
      
      localStorage.setItem(this._getSaveKey(slot), JSON.stringify(saveData));
      console.log(`Game saved to slot ${slot}`);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }
  
  /**
   * 加载游戏
   * @param {number} slot - 存档槽位
   * @returns {Object|null} 游戏数据或 null
   */
  load(slot) {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      console.error('Invalid save slot:', slot);
      return null;
    }
    
    try {
      const saveStr = localStorage.getItem(this._getSaveKey(slot));
      if (!saveStr) {
        return null;
      }
      
      const saveData = JSON.parse(saveStr);
      
      // 版本检查
      if (saveData.version !== SAVE_VERSION) {
        console.warn('Save version mismatch:', saveData.version, 'expected:', SAVE_VERSION);
        // 可以在这里添加版本迁移逻辑
      }
      
      // 恢复状态效果 Map
      if (saveData.player && saveData.player.statusEffects) {
        saveData.player.statusEffects = new Map(saveData.player.statusEffects);
      }
      
      console.log(`Game loaded from slot ${slot}`);
      return saveData;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }
  
  /**
   * 删除存档
   * @param {number} slot - 存档槽位
   */
  delete(slot) {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      console.error('Invalid save slot:', slot);
      return false;
    }
    
    localStorage.removeItem(this._getSaveKey(slot));
    console.log(`Save deleted from slot ${slot}`);
    return true;
  }
  
  /**
   * 检查是否有存档
   * @param {number} slot - 存档槽位
   * @returns {boolean}
   */
  hasSave(slot) {
    return localStorage.getItem(this._getSaveKey(slot)) !== null;
  }
  
  /**
   * 获取所有存档信息
   * @returns {Array} 存档信息列表
   */
  getAllSaves() {
    const saves = [];
    
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      const saveData = this.load(i);
      
      if (saveData) {
        saves.push({
          slot: i,
          version: saveData.version,
          timestamp: saveData.timestamp,
          playTime: saveData.playTime,
          playerName: saveData.player?.name || 'Unknown',
          playerHp: `${saveData.player?.hp}/${saveData.player?.maxHp}`,
          playerGold: saveData.player?.gold || 0,
          floor: saveData.runData?.currentFloor || 1,
          area: saveData.runData?.currentArea || 0
        });
      } else {
        saves.push({
          slot: i,
          isEmpty: true
        });
      }
    }
    
    return saves;
  }
  
  /**
   * 获取存档时间戳
   * @param {number} slot - 存档槽位
   * @returns {number|null}
   */
  getSaveTimestamp(slot) {
    try {
      const saveStr = localStorage.getItem(this._getSaveKey(slot));
      if (!saveStr) return null;
      
      const saveData = JSON.parse(saveStr);
      return saveData.timestamp || null;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * 格式化时间戳
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return '无存档';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 今天
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (diff < 48 * 60 * 60 * 1000 && date.getDate() === yesterday.getDate()) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // 其他日期
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  /**
   * 清空所有存档
   */
  clearAll() {
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      this.delete(i);
    }
    console.log('All saves cleared');
  }
  
  /**
   * 导出存档为 JSON
   * @param {number} slot - 存档槽位
   * @returns {string|null} JSON 字符串
   */
  exportSave(slot) {
    const saveStr = localStorage.getItem(this._getSaveKey(slot));
    return saveStr;
  }
  
  /**
   * 从 JSON 导入存档
   * @param {string} json - JSON 字符串
   * @param {number} slot - 存档槽位
   * @returns {boolean} 是否成功
   */
  importSave(json, slot) {
    try {
      const saveData = JSON.parse(json);
      
      // 验证数据结构
      if (!saveData.version || !saveData.player || !saveData.runData) {
        console.error('Invalid save data structure');
        return false;
      }
      
      localStorage.setItem(this._getSaveKey(slot), json);
      console.log(`Save imported to slot ${slot}`);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

// 单例
let saveSystemInstance = null;

export function getSaveSystem() {
  if (!saveSystemInstance) {
    saveSystemInstance = new SaveSystem();
  }
  return saveSystemInstance;
}

export default SaveSystem;
