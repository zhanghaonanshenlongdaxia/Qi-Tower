/**
 * 加载场景 - Boot Scene
 * 预加载所有游戏资源
 */

import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    // 显示加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 进度条背景
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // 加载文字
    const loadingText = this.add.text(width / 2, height / 2 - 40, '加载中...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 百分比文字
    const percentText = this.add.text(width / 2, height / 2 + 35, '0%', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 更新进度
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x4a90d9, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${parseInt(value * 100)}%`);
    });
    
    // 加载完成
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // ========== 加载九宫格背景 ==========
    this.load.image('panel_bg_nineslice', 'UI/bg.png');
    
    // ========== 古风武侠 UI 纹理 ==========
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // --- 卡牌背面（古铜锦纹） ---
    g.fillStyle(0x2b1a0d, 1);
    g.fillRoundedRect(0, 0, 140, 190, 6);
    g.fillStyle(0x7a4f24, 1);
    g.fillRoundedRect(6, 6, 128, 178, 4);
    g.fillStyle(0x3d200e, 0.5);
    g.fillRoundedRect(14, 14, 112, 162, 3);
    g.lineStyle(2, 0xd4a03a, 0.9);
    g.strokeRoundedRect(1, 1, 138, 188, 6);
    g.lineStyle(1, 0xe8c96a, 0.5);
    g.strokeRoundedRect(6, 6, 128, 178, 4);
    // 菱形装饰
    g.lineStyle(1, 0xd4a03a, 0.4);
    g.strokeRect(34, 50, 72, 90);
    g.strokeRect(42, 62, 56, 66);
    // 中心圆纹
    g.strokeCircle(70, 95, 22);
    g.strokeCircle(70, 95, 12);
    g.generateTexture('ui_card_back', 140, 190);
    g.clear();

    // --- 卡牌框架（宣纸米白+木框） ---
    g.fillStyle(0x1e120a, 1);
    g.fillRoundedRect(0, 0, 150, 200, 6);
    g.fillStyle(0xf5e8c8, 1);
    g.fillRoundedRect(4, 4, 142, 192, 4);
    g.fillStyle(0xe8d5a8, 1);
    g.fillRoundedRect(8, 8, 134, 184, 3);
    g.lineStyle(2, 0x8b5e1a, 1);
    g.strokeRoundedRect(1, 1, 148, 198, 6);
    g.lineStyle(1, 0xc49a3c, 0.7);
    g.strokeRoundedRect(4, 4, 142, 192, 4);
    g.generateTexture('ui_card_frame', 150, 200);
    g.clear();

    // --- 面板（深木色+金边） ---
    g.fillStyle(0x1a0e06, 0.97);
    g.fillRoundedRect(0, 0, 400, 300, 8);
    g.fillStyle(0x2e1a0a, 0.94);
    g.fillRoundedRect(4, 4, 392, 292, 6);
    g.lineStyle(2, 0xb8892a, 0.85);
    g.strokeRoundedRect(1, 1, 398, 298, 8);
    g.lineStyle(1, 0xe8c060, 0.35);
    g.strokeRoundedRect(5, 5, 390, 290, 6);
    g.generateTexture('ui_panel', 400, 300);
    g.clear();

    // --- 横幅（深赭石+金描边） ---
    g.fillStyle(0x1a0a04, 1);
    g.fillRect(0, 0, 800, 100);
    g.fillStyle(0x3a1a08, 1);
    g.fillRect(2, 2, 796, 96);
    g.lineStyle(2, 0xc49a3c, 0.9);
    g.strokeRect(0, 0, 800, 100);
    g.lineStyle(1, 0xe8c060, 0.3);
    g.strokeRect(4, 4, 792, 92);
    // 横幅两端装饰线
    g.lineStyle(1, 0xc49a3c, 0.5);
    g.strokeRect(16, 10, 60, 80);
    g.strokeRect(724, 10, 60, 80);
    g.generateTexture('ui_banner', 800, 100);
    g.clear();

    // --- 战场底板（古木色） ---
    g.fillStyle(0x120a04, 1);
    g.fillRoundedRect(0, 0, 600, 400, 10);
    g.fillStyle(0x2a1608, 0.88);
    g.fillRoundedRect(4, 4, 592, 392, 8);
    g.lineStyle(2, 0x9a6b22, 0.7);
    g.strokeRoundedRect(1, 1, 598, 398, 10);
    g.lineStyle(1, 0xd4a03a, 0.25);
    g.strokeRoundedRect(6, 6, 588, 388, 7);
    g.generateTexture('ui_battle_board', 600, 400);
    g.clear();

    // --- 节点卡（竹简色） ---
    g.fillStyle(0x1e1208, 1);
    g.fillRoundedRect(0, 0, 220, 122, 7);
    g.fillStyle(0xd4b870, 0.12);
    g.fillRoundedRect(4, 4, 212, 114, 5);
    g.lineStyle(2, 0xb8892a, 0.8);
    g.strokeRoundedRect(1, 1, 218, 120, 7);
    g.lineStyle(1, 0xe0c060, 0.28);
    g.strokeRoundedRect(5, 5, 210, 112, 5);
    g.generateTexture('ui_node', 220, 122);
    g.clear();

    // --- 徽章（朱砂圆印） ---
    g.fillStyle(0x8a1a0a, 1);
    g.fillCircle(36, 36, 34);
    g.fillStyle(0xcc2a10, 1);
    g.fillCircle(36, 36, 28);
    g.lineStyle(2, 0xe8c060, 1);
    g.strokeCircle(36, 36, 34);
    g.lineStyle(1, 0xf0d880, 0.6);
    g.strokeCircle(36, 36, 26);
    g.lineStyle(1, 0xf0d880, 0.35);
    g.strokeCircle(36, 36, 20);
    g.generateTexture('ui_badge', 72, 72);
    g.clear();

    // --- 按钮（朱漆木牌） ---
    g.fillStyle(0x5c1a06, 1);
    g.fillRoundedRect(0, 0, 200, 50, 6);
    g.fillStyle(0x8a2a0e, 1);
    g.fillRoundedRect(3, 3, 194, 44, 4);
    g.lineStyle(2, 0xd4a03a, 0.9);
    g.strokeRoundedRect(1, 1, 198, 48, 6);
    g.lineStyle(1, 0xe8c060, 0.4);
    g.strokeRoundedRect(4, 4, 192, 42, 4);
    g.generateTexture('ui_button', 200, 50);
    g.clear();

    // --- 灵力圆珠（青玉色） ---
    g.fillStyle(0x1a6060, 1);
    g.fillCircle(15, 15, 13);
    g.fillStyle(0x28a8a8, 0.8);
    g.fillCircle(13, 12, 8);
    g.lineStyle(2, 0x60e0d0, 0.9);
    g.strokeCircle(15, 15, 13);
    g.lineStyle(1, 0xa0fff0, 0.4);
    g.strokeCircle(15, 15, 8);
    g.generateTexture('ui_energy', 30, 30);
    g.clear();

    // --- 生命（朱砂菱形） ---
    g.fillStyle(0x8a1a06, 1);
    g.fillTriangle(15, 2, 28, 14, 15, 28);
    g.fillTriangle(15, 2, 2, 14, 15, 28);
    g.fillStyle(0xcc2a10, 1);
    g.fillTriangle(15, 5, 25, 14, 15, 25);
    g.fillTriangle(15, 5, 5, 14, 15, 25);
    g.lineStyle(1, 0xe8c060, 0.7);
    g.strokeTriangle(15, 2, 28, 14, 15, 28);
    g.strokeTriangle(15, 2, 2, 14, 15, 28);
    g.generateTexture('ui_heart', 30, 30);
    g.clear();

    // --- 灵石（金色六边形） ---
    g.fillStyle(0x7a5200, 1);
    g.fillCircle(15, 15, 13);
    g.fillStyle(0xd4a020, 1);
    g.fillCircle(15, 15, 10);
    g.fillStyle(0xf0d060, 0.5);
    g.fillCircle(12, 12, 5);
    g.lineStyle(2, 0xf0c040, 0.9);
    g.strokeCircle(15, 15, 13);
    g.generateTexture('ui_gold', 30, 30);
    g.clear();

    g.destroy();

    // ========== 人物头像（水墨风） ==========
    const ch = this.make.graphics({ x: 0, y: 0, add: false });

    // 玩家头像（青衫侠客）
    ch.fillStyle(0x1a2a1a, 1);
    ch.fillCircle(50, 50, 46);
    // 衣袍
    ch.fillStyle(0x2a5a4a, 1);
    ch.fillTriangle(20, 100, 80, 100, 50, 55);
    ch.fillStyle(0x3a8a6a, 1);
    ch.fillTriangle(28, 100, 72, 100, 50, 60);
    // 脸
    ch.fillStyle(0xd4a87a, 1);
    ch.fillCircle(50, 42, 20);
    // 发冠
    ch.fillStyle(0x1a1a1a, 1);
    ch.fillRect(32, 22, 36, 12);
    ch.fillRect(44, 14, 12, 12);
    // 眼
    ch.fillStyle(0x1a1a1a, 1);
    ch.fillRect(38, 38, 6, 4);
    ch.fillRect(56, 38, 6, 4);
    // 外圈
    ch.lineStyle(2, 0x60c090, 0.8);
    ch.strokeCircle(50, 50, 46);
    ch.generateTexture('avatar_player', 100, 100);
    ch.clear();

    // 敌人头像（赤甲武夫）
    ch.fillStyle(0x1a0a06, 1);
    ch.fillCircle(50, 50, 46);
    // 甲胄
    ch.fillStyle(0x7a1a08, 1);
    ch.fillTriangle(18, 100, 82, 100, 50, 54);
    ch.fillStyle(0xaa2a10, 1);
    ch.fillTriangle(26, 100, 74, 100, 50, 58);
    // 脸
    ch.fillStyle(0xc08060, 1);
    ch.fillCircle(50, 42, 20);
    // 头盔
    ch.fillStyle(0x5a1006, 1);
    ch.fillRect(30, 20, 40, 14);
    ch.fillRect(35, 12, 30, 12);
    ch.fillRect(42, 6, 16, 10);
    // 眼（凶狠）
    ch.fillStyle(0xee2200, 1);
    ch.fillRect(37, 36, 8, 5);
    ch.fillRect(55, 36, 8, 5);
    // 外圈
    ch.lineStyle(2, 0xcc3010, 0.8);
    ch.strokeCircle(50, 50, 46);
    ch.generateTexture('avatar_enemy', 100, 100);
    ch.clear();

    ch.destroy();

    // ========== 背景 ==========
    const bg = this.make.graphics({ x: 0, y: 0, add: false });

    // 默认背景（深墨色）
    bg.fillStyle(0x0e0a06, 1);
    bg.fillRect(0, 0, 800, 600);
    bg.generateTexture('bg_default', 800, 600);
    bg.clear();

    // 战斗背景（暗赭石）
    bg.fillStyle(0x120804, 1);
    bg.fillRect(0, 0, 800, 600);
    bg.generateTexture('bg_battle', 800, 600);
    bg.clear();

    // 地图背景（深竹绿）
    bg.fillStyle(0x080e08, 1);
    bg.fillRect(0, 0, 800, 600);
    bg.generateTexture('bg_map', 800, 600);
    bg.clear();

    bg.destroy();

    // ========== 图标 ==========
    const ic = this.make.graphics({ x: 0, y: 0, add: false });

    // 剑图标（古剑）
    ic.fillStyle(0xc8c0a0, 1);
    ic.fillRect(9, 1, 3, 22);
    ic.fillRect(3, 8, 15, 3);
    ic.fillStyle(0x8a5a1a, 1);
    ic.fillRect(8, 22, 5, 9);
    ic.lineStyle(1, 0xe8d080, 0.6);
    ic.strokeRect(9, 1, 3, 22);
    ic.generateTexture('icon_attack', 21, 32);
    ic.clear();

    // 盾图标（圆盾）
    ic.fillStyle(0x4a2a08, 1);
    ic.fillCircle(11, 14, 11);
    ic.fillStyle(0x8a5a1a, 1);
    ic.fillCircle(11, 14, 8);
    ic.fillStyle(0xc49a3c, 0.5);
    ic.fillCircle(11, 14, 4);
    ic.lineStyle(1, 0xe8c060, 0.8);
    ic.strokeCircle(11, 14, 11);
    ic.generateTexture('icon_block', 22, 28);
    ic.clear();

    // 药水图标（丹药瓶）
    ic.fillStyle(0x7a1a06, 0.9);
    ic.fillEllipse(11, 18, 16, 16);
    ic.fillStyle(0x8a8880, 1);
    ic.fillRect(8, 6, 6, 8);
    ic.fillRect(6, 10, 10, 4);
    ic.lineStyle(1, 0xe8c060, 0.5);
    ic.strokeEllipse(11, 18, 16, 16);
    ic.generateTexture('icon_potion', 22, 28);
    ic.clear();

    ic.destroy();
  }
  
  create() {
    // 将大尺寸背景图缩小为适合游戏分辨率的纹理
    const srcTex = this.textures.get('panel_bg_nineslice');
    if (srcTex && srcTex.key !== '__MISSING') {
      const srcImg = srcTex.getSourceImage();
      // 原图 1672x2508，按比例缩小到约 558x837（原图 1/3）
      const scale = 1 / 3;
      const newW = Math.round(srcImg.width * scale);
      const newH = Math.round(srcImg.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(srcImg, 0, 0, newW, newH);
      // 用缩小后的 canvas 生成新纹理，替换原来的
      this.textures.remove('panel_bg_nineslice');
      this.textures.addCanvas('panel_bg_nineslice', canvas);
    }

    // 淡出效果
    this.cameras.main.fade(500, 0, 0, 0);
    
    // 进入主菜单
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}

export { BootScene };
