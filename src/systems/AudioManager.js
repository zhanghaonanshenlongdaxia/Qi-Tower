/**
 * 音频管理器 - AudioManager
 * 管理游戏的背景音乐和音效
 */

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    this.sfx = {};
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.muted = false;
    
    // 音频文件路径
    this.musicPaths = {
      menu: 'audio/music/menu.mp3',
      battle: 'audio/music/battle.mp3',
      boss: 'audio/music/boss.mp3',
      map: 'audio/music/map.mp3',
      shop: 'audio/music/shop.mp3',
      event: 'audio/music/event.mp3',
      victory: 'audio/music/victory.mp3',
      defeat: 'audio/music/defeat.mp3'
    };
    
    this.sfxPaths = {
      // 卡牌相关
      cardDraw: 'audio/sfx/card_draw.mp3',
      cardPlay: 'audio/sfx/card_play.mp3',
      cardDiscard: 'audio/sfx/card_discard.mp3',
      
      // 战斗相关
      attack: 'audio/sfx/attack.mp3',
      hit: 'audio/sfx/hit.mp3',
      block: 'audio/sfx/block.mp3',
      death: 'audio/sfx/death.mp3',
      
      // UI 相关
      buttonClick: 'audio/sfx/button_click.mp3',
      buttonHover: 'audio/sfx/button_hover.mp3',
      gainGold: 'audio/sfx/gain_gold.mp3',
      gainRelic: 'audio/sfx/gain_relic.mp3',
      gainCard: 'audio/sfx/gain_card.mp3',
      
      // 状态相关
      heal: 'audio/sfx/heal.mp3',
      damage: 'audio/sfx/damage.mp3',
      statusApply: 'audio/sfx/status_apply.mp3',
      
      // 其他
      victory: 'audio/sfx/victory.mp3',
      defeat: 'audio/sfx/defeat.mp3'
    };
  }
  
  /**
   * 预加载所有音频
   */
  preload() {
    // 加载音乐
    Object.values(this.musicPaths).forEach(path => {
      if (path) this.scene.load.audio(path, path);
    });
    
    // 加载音效
    Object.values(this.sfxPaths).forEach(path => {
      if (path) this.scene.load.audio(path, path);
    });
  }
  
  /**
   * 播放背景音乐
   * @param {string} track - 音乐名称 (menu/battle/boss/map/shop/event/victory/defeat)
   * @param {boolean} loop - 是否循环
   */
  playMusic(track, loop = true) {
    if (this.muted) return;
    
    const path = this.musicPaths[track];
    if (!path) {
      console.warn(`Music track not found: ${track}`);
      return;
    }
    
    // 停止当前音乐
    if (this.music) {
      this.music.stop();
    }
    
    // 播放新音乐
    this.music = this.scene.sound.add(path, {
      volume: this.musicVolume,
      loop: loop
    });
    this.music.play();
  }
  
  /**
   * 停止背景音乐
   */
  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }
  
  /**
   * 暂停背景音乐
   */
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }
  
  /**
   * 恢复背景音乐
   */
  resumeMusic() {
    if (this.music && this.music.paused) {
      this.music.resume();
    }
  }
  
  /**
   * 播放音效
   * @param {string} sfxName - 音效名称
   * @param {Object} config - 配置选项
   */
  playSfx(sfxName, config = {}) {
    if (this.muted) return;
    
    const path = this.sfxPaths[sfxName];
    if (!path) {
      console.warn(`SFX not found: ${sfxName}`);
      return null;
    }
    
    const sound = this.scene.sound.add(path, {
      volume: config.volume || this.sfxVolume,
      rate: config.rate || 1
    });
    
    sound.play();
    
    // 自动清理（可选）
    if (config.autoDestroy !== false) {
      sound.once('complete', () => {
        sound.destroy();
      });
    }
    
    return sound;
  }
  
  /**
   * 播放卡牌抽取音效
   */
  playCardDraw() {
    this.playSfx('cardDraw');
  }
  
  /**
   * 播放卡牌使用音效
   */
  playCardPlay() {
    this.playSfx('cardPlay');
  }
  
  /**
   * 播放攻击音效
   */
  playAttack() {
    this.playSfx('attack');
  }
  
  /**
   * 播放受击音效
   */
  playHit() {
    this.playSfx('hit');
  }
  
  /**
   * 播放格挡音效
   */
  playBlock() {
    this.playSfx('block');
  }
  
  /**
   * 播放获得金币音效
   */
  playGainGold() {
    this.playSfx('gainGold');
  }
  
  /**
   * 播放获得遗物音效
   */
  playGainRelic() {
    this.playSfx('gainRelic');
  }
  
  /**
   * 播放胜利音效
   */
  playVictory() {
    this.playSfx('victory');
  }
  
  /**
   * 播放失败音效
   */
  playDefeat() {
    this.playSfx('defeat');
  }
  
  /**
   * 设置音乐音量
   * @param {number} volume - 音量 (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.setVolume(this.musicVolume);
    }
  }
  
  /**
   * 设置音效音量
   * @param {number} volume - 音量 (0-1)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * 静音/取消静音
   * @param {boolean} muted - 是否静音
   */
  setMuted(muted) {
    this.muted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      this.resumeMusic();
    }
  }
  
  /**
   * 切换静音状态
   * @returns {boolean} 新的静音状态
   */
  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }
  
  /**
   * 获取当前静音状态
   * @returns {boolean}
   */
  isMuted() {
    return this.muted;
  }
  
  /**
   * 淡入音乐
   * @param {string} track - 音乐名称
   * @param {number} duration - 淡入时间 (ms)
   */
  fadeInMusic(track, duration = 1000) {
    if (this.muted) return;
    
    const path = this.musicPaths[track];
    if (!path) return;
    
    if (this.music) {
      this.music.stop();
    }
    
    this.music = this.scene.sound.add(path, {
      volume: 0,
      loop: true
    });
    this.music.play();
    
    this.scene.tweens.add({
      targets: this.music,
      volume: this.musicVolume,
      duration: duration,
      ease: 'Linear'
    });
  }
  
  /**
   * 淡出音乐
   * @param {number} duration - 淡出时间 (ms)
   */
  fadeOutMusic(duration = 1000) {
    if (!this.music) return;
    
    this.scene.tweens.add({
      targets: this.music,
      volume: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.music.stop();
        this.music = null;
      }
    });
  }
}

export default AudioManager;
