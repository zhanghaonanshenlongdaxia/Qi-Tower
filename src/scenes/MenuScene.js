import { GAME_CONFIG } from '../config/gameConfig';
import { DataRegistry } from '../systems/DataRegistry';
import { SfxManager } from '../systems/SfxManager';
import { UIHelper } from '../utils/UIHelper';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    if (!this.registry.get('dataRegistry')) {
      this.registry.set('dataRegistry', new DataRegistry());
    }
    if (!this.registry.get('sfxManager')) {
      this.registry.set('sfxManager', new SfxManager());
    }
    this.sfx = this.registry.get('sfxManager');

    this.add.rectangle(width / 2, height / 2, width, height, 0x120d0a, 1);
    this.add.circle(width * 0.18, height * 0.18, 180, 0x7a552d, 0.16);
    this.add.circle(width * 0.84, height * 0.22, 220, 0x4d2818, 0.14);
    this.add.circle(width * 0.5, height * 0.88, 260, 0x362012, 0.16);

    UIHelper.createPanel(this, width / 2, height / 2, 940, 520);
    this.add.image(width / 2, 106, 'ui_banner').setScale(0.88);
    this.add.image(78, 98, 'avatar_player').setScale(0.72);
    this.add.image(width - 78, 98, 'avatar_enemy').setScale(0.72);
    this.add.image(width / 2, 74, 'ui_badge').setScale(0.74);

    this.add.text(width / 2, 108, '江湖试炼', {
      fontSize: '34px',
      color: '#f4ead7',
      fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 196, '游历山河，历经试炼，以卡牌之力定乾坤。胜则奖赏，败则轮回。', {
      fontSize: '16px',
      color: '#f4ead7',
      align: 'center',
      wordWrap: { width: 500 },
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);

    const featurePanel = this.add.image(width / 2, 334, 'ui_panel').setDisplaySize(620, 156).setAlpha(0.92);
    this.add.text(featurePanel.x, featurePanel.y - 30, '当前已接入：英雄选择 / 多路线地图 / 奇遇事件 / 商店 / 奖励选牌 / 遗物奖励 / 敌人意图 / 状态效果', {
      fontSize: '18px',
      color: '#f0d890',
      align: 'center',
      wordWrap: { width: 470 },
      stroke: '#3a1a08', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(featurePanel.x, featurePanel.y + 8, '新手流程：① 选择英雄与路线 ② 地图推进并处理事件/商店 ③ 战斗胜利后领取卡牌与遗物奖励', {
      fontSize: '14px',
      color: '#ead5ad',
      align: 'center',
      wordWrap: { width: 470 },
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);
    this.add.text(featurePanel.x, featurePanel.y + 42, '成长重点：精英/Boss 会带来更高质量奖励，部分事件还会影响下一场战斗。', {
      fontSize: '14px',
      color: '#ead5ad',
      align: 'center',
      wordWrap: { width: 470 },
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.image(width / 2, 494, 'ui_banner').setScale(0.7, 0.68).setAlpha(0.4);
    const startButton = this.rexUI.add.label({
      x: width / 2,
      y: 492,
      width: 260,
      height: 64,
      background: this.add.rectangle(0, 0, 260, 64, 0x8f5e27, 1).setStrokeStyle(2, 0xf1d59c, 0.58),
      text: this.add.text(0, 0, '选择英雄出发', {
        fontSize: '26px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    startButton.setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 554, '三位英雄可选，各具独特卡组与遗物，探索完整地图流程。', {
      fontSize: '14px',
      color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);

    startButton.on('pointerdown', () => {
      this.sfx?.resume();
      this.sfx?.playUiTap();
      this.scene.start('HeroSelectScene');
    });
  }
}
