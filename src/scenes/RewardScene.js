import { UIHelper } from '../utils/UIHelper';

export class RewardScene extends Phaser.Scene {
  constructor() {
    super('RewardScene');
  }

  create(data) {
    this.progress = data.progress;
    this.rewardCards = data.rewardCards || [];
    this.sfx = this.registry.get('sfxManager');
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x120d0a, 1);
    this.add.circle(150, 110, 170, 0x7a552d, 0.13);
    this.add.circle(width - 150, 130, 170, 0x6b3d28, 0.12);
    this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(width - 70, height - 70);
    this.add.image(width / 2, 96, 'ui_badge').setScale(0.9);

    this.add.text(width / 2, 144, '奖励选牌', {
      fontSize: '38px',
      color: '#f4ead7',
      fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, '选择 1 张卡加入卡组，或跳过。奖励卡会永久加入本轮路线。', {
      fontSize: '19px',
      color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);

    this.rewardCards.forEach((card, index) => {
      const x = 210 + index * 300;
      const y = 390;
      const label = this.rexUI.add.label({
        x,
        y,
        width: 220,
        height: 300,
        orientation: 1,
        background: this.add.image(0, 0, 'ui_card_frame').setDisplaySize(220, 300),
        text: this.add.text(0, 0, `${card.name}\n\n耗能 ${card.cost}   类型 ${card.type}\n\n${card.description}\n\n${card.rarity.toUpperCase()}`, {
          fontSize: '16px',
          color: '#2a1206',
          align: 'center',
          fontStyle: 'bold',
          wordWrap: { width: 176 },
          lineSpacing: 10,
        }),
        align: 'center',
        space: {
          top: 18,
          bottom: 18,
          left: 18,
          right: 18,
        },
      }).layout();
      label.setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => {
        this.sfx?.resume();
        this.sfx?.playReward();
        this.progress.bonusCards = this.progress.bonusCards || [];
        this.progress.bonusCards.push(card.id);
        this.scene.start('MapScene', { progress: this.progress });
      });
    });

    const skipButton = this.rexUI.add.label({
      x: width / 2,
      y: height - 88,
      width: 220,
      height: 58,
      background: this.add.rectangle(0, 0, 220, 58, 0x6d4621, 1).setStrokeStyle(2, 0xf1d59c, 0.42),
      text: this.add.text(0, 0, '跳过奖励', {
        fontSize: '24px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    skipButton.setInteractive({ useHandCursor: true });
    skipButton.on('pointerdown', () => {
      this.sfx?.resume();
      this.sfx?.playUiTap();
      this.scene.start('MapScene', { progress: this.progress });
    });
  }
}
