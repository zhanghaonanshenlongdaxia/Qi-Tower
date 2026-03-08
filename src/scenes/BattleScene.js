import { GAME_CONFIG } from '../config/gameConfig';
import { BattleState } from '../systems/BattleState';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  create(data) {
    const registry = this.registry.get('dataRegistry');
    this.state = new BattleState(registry, data);
    this.sfx = this.registry.get('sfxManager');
    this.tableCards = [];
    this.currentTurnCards = [];
    this.createLayout();
    this.render();
  }

  createLayout() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x120d0a, 1);
    this.add.circle(180, 150, 180, 0x7a552d, 0.14);
    this.add.circle(width - 170, 170, 180, 0x4d2818, 0.14);
    this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(width - 74, height - 54);
    this.add.image(width / 2, 58, 'ui_banner').setScale(0.84);
    this.add.image(width / 2, 304, 'ui_battle_board').setScale(0.74);
    this.playZone = this.add.rectangle(width / 2, 304, 360, 110, 0xc8b080, 0.16).setStrokeStyle(1, 0x9f7a43, 0.34);
    this.playZoneDivider = this.add.line(width / 2, 304, -150, 0, 150, 0, 0xa17b45, 0.22).setLineWidth(1);
    this.enemyLaneLabel = this.add.text(width / 2, 278, '敌方出牌区', {
      fontSize: '13px',
      color: '#8d6a3a',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.playerLaneLabel = this.add.text(width / 2, 330, '玩家出牌区', {
      fontSize: '13px',
      color: '#8d6a3a',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.playZoneLabel = this.add.text(width / 2, 304, '牌桌', {
      fontSize: '16px',
      color: '#8d6a3a',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tableCardLayer = this.add.container(0, 0);
    this.playedCardPreview = null;

    this.playerPanel = this.add.container(36, 118);
    this.enemyPanel = this.add.container(width - 328, 118);
    this.enemyHandContainer = this.add.container(width - 332, 316);
    this.handContainer = this.add.container(52, height - 238);
    this.logX = width - 330;
    this.logY = 448;

    this.add.image(44, 52, 'avatar_player').setScale(0.54);
    this.add.image(width - 44, 52, 'avatar_enemy').setScale(0.54);

    this.add.text(width / 2, 58, '战斗界面', {
      fontSize: '28px',
      color: '#f4ead7',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.endTurnButton = this.rexUI.add.label({
      x: width - 170,
      y: height - 54,
      width: 176,
      height: 52,
      background: this.add.rectangle(0, 0, 176, 52, 0x8f5e27, 1).setStrokeStyle(2, 0xf1d59c, 0.55),
      text: this.add.text(0, 0, '结束回合', {
        fontSize: '22px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    this.endTurnButton.setInteractive({ useHandCursor: true });

    this.endTurnButton.on('pointerdown', () => {
      if (this.state.isFinished()) {
        this.handleFinishedBattle();
        return;
      }
      this.sfx?.resume();
      this.sfx?.playUiTap();
      const playedEnemyCards = this.state.endTurn();
      playedEnemyCards.forEach((enemyCard, index) => {
        this.time.delayedCall(index * 1000, () => {
          this.animateEnemyCard(enemyCard, this.scale.width - 186, 212 - index * 12);
          this.addTableCard({
            name: enemyCard.name,
            description: enemyCard.description,
            source: 'enemy',
          });
        });
      });
      this.render();
      const flipDelay = playedEnemyCards.length > 0 ? playedEnemyCards.length * 1000 + 360 : 80;
      this.time.delayedCall(flipDelay, () => {
        this.flipCurrentTurnCards();
        if (this.state.isFinished()) this.handleFinishedBattle();
      });
    });
  }

  clearContainer(container) {
    container.removeAll(true);
  }

  render() {
    this.renderPlayer();
    this.renderEnemy();
    this.renderEnemyHand();
    this.renderHand();
    this.renderLog();
    this.renderResult();
  }

  renderPlayer() {
    this.clearContainer(this.playerPanel);
    const p = this.state.player;
    const bg = this.add.image(0, 0, 'ui_panel').setOrigin(0, 0).setDisplaySize(286, 178);
    const title = this.add.text(18, 14, '玩家', { fontSize: '22px', color: '#f4ead7', fontStyle: 'bold' });
    const hp = this.add.text(18, 54, `生命：${Math.max(0, p.hp)} / ${p.maxHp}`, { fontSize: '17px', color: '#8b2f2f' });
    const block = this.add.text(18, 82, `格挡：${p.block}`, { fontSize: '17px', color: '#6a4d24' });
    const energy = this.add.text(18, 110, `灵力：${p.energy}`, { fontSize: '17px', color: '#a56a1f' });
    const status = this.add.text(18, 136, `状态: 护体 ${p.status.shielding} / 虚弱 ${p.status.weak} / 易伤 ${p.status.vulnerable}`, { fontSize: '12px', color: '#5d4326', wordWrap: { width: 236 }, lineSpacing: 2 });
    this.playerPanel.add([bg, title, hp, block, energy, status]);
  }

  renderEnemy() {
    this.clearContainer(this.enemyPanel);
    const e = this.state.enemy;
    const enemyPreviewCards = this.state.getEnemyPreviewCards();
    const bg = this.add.image(0, 0, 'ui_panel').setOrigin(0, 0).setDisplaySize(286, 188);
    const title = this.add.text(18, 14, e.name, { fontSize: '22px', color: '#f4ead7', fontStyle: 'bold' });
    const hp = this.add.text(18, 54, `生命：${Math.max(0, e.hp)} / ${e.maxHp}`, { fontSize: '17px', color: '#8b2f2f' });
    const block = this.add.text(18, 82, `格挡：${e.block}`, { fontSize: '17px', color: '#6a4d24' });
    const intentText = this.add.text(18, 110, `待出牌：未知 ${enemyPreviewCards.length > 0 ? `（本回合 ${enemyPreviewCards.length} 张）` : ''}`, { fontSize: '14px', color: '#9f5f22', wordWrap: { width: 236 } });
    const status = this.add.text(18, 142, `敌方手牌 ${enemyPreviewCards.length} / 牌堆 ${this.state.enemyDrawPile.length} / 弃牌 ${this.state.enemyDiscardPile.length}
状态: 虚弱 ${e.status.weak} / 易伤 ${e.status.vulnerable}`, { fontSize: '12px', color: '#5d4326', wordWrap: { width: 236 }, lineSpacing: 2 });
    this.enemyPanel.add([bg, title, hp, block, intentText, status]);
  }

  renderEnemyHand() {
    this.clearContainer(this.enemyHandContainer);
    const previewCards = this.state.getEnemyPreviewCards();
    const panel = this.add.image(0, 0, 'ui_panel').setOrigin(0, 0).setDisplaySize(290, 118).setAlpha(0.96);
    const title = this.add.text(16, 10, '敌方手牌（背面）', { fontSize: '16px', color: '#f4ead7', fontStyle: 'bold' });
    const info = this.add.text(196, 12, `牌堆 ${this.state.enemyDrawPile.length}  弃牌 ${this.state.enemyDiscardPile.length}`, {
      fontSize: '11px',
      color: '#ead8b8',
    }).setOrigin(0.5, 0);
    const nextHint = this.add.text(18, 32, '最前方只表示出牌顺序', {
      fontSize: '11px',
      color: '#9f7a43',
    });
    this.enemyHandContainer.add([panel, title, info, nextHint]);
    previewCards.forEach((_card, index) => {
      const cardX = 30 + index * 72;
      const cardY = index === 0 ? 44 : 52;
      const cardBg = this.add.image(cardX, cardY, 'ui_card_back').setOrigin(0, 0).setDisplaySize(index === 0 ? 56 : 52, index === 0 ? 72 : 68).setAlpha(0.98);
      cardBg.setAngle(index === 0 ? -2 : index % 2 === 0 ? -4 : 4);
      const marker = index === 0
        ? this.add.text(cardX + 28, cardY - 8, '即将打出', {
            fontSize: '10px',
            color: '#7a3520',
            fontStyle: 'bold',
          }).setOrigin(0.5)
        : null;
      const displayItems = marker ? [cardBg, marker] : [cardBg];
      this.enemyHandContainer.add(displayItems);
    });
  }

  renderHand() {
    this.clearContainer(this.handContainer);
    this.state.hand.forEach((card, index) => {
      const x = index * 136;
      const bg = this.add.image(x, 0, 'ui_card_frame').setOrigin(0, 0).setDisplaySize(126, 188).setInteractive({ useHandCursor: true });
      const title = this.add.text(x + 10, 14, card.name, { fontSize: '15px', color: '#4a2d18', fontStyle: 'bold', wordWrap: { width: 100 }, maxLines: 2 });
      const cost = this.add.text(x + 10, 44, `耗能 ${card.cost}`, { fontSize: '11px', color: '#8d5a18' });
      const type = this.add.text(x + 10, 62, `类型 ${card.type}`, { fontSize: '11px', color: '#6a4d24' });
      const desc = this.add.text(x + 10, 86, card.description, { fontSize: '11px', color: '#5a4024', wordWrap: { width: 100 }, lineSpacing: 1, maxLines: 5 });
      const rarity = this.add.text(x + 10, 158, String(card.rarity).toUpperCase(), { fontSize: '10px', color: '#7b5f27', fontStyle: 'bold' });
      bg.on('pointerdown', () => {
        if (this.state.isFinished()) return;
        const startX = this.handContainer.x + x + 63;
        const startY = this.handContainer.y + 94;
        const played = this.state.playCard(index);
        if (played) {
          this.sfx?.resume();
          this.sfx?.playCard();
          this.animatePlayedCard(card, startX, startY);
          this.addTableCard({
            name: card.name,
            description: card.description,
            source: 'player',
          });
          this.render();
          if (this.state.enemy.hp <= 0) {
            this.sfx?.playVictory();
          } else {
            this.sfx?.playHit();
          }
        }
      });
      this.handContainer.add([bg, title, cost, type, desc, rarity]);
    });
  }

  animatePlayedCard(card, startX, startY) {
    if (this.playedCardPreview) {
      this.playedCardPreview.destroy();
      this.playedCardPreview = null;
    }
    const preview = this.add.container(startX, startY);
    const bg = this.add.image(0, 0, 'ui_card_frame').setDisplaySize(118, 172);
    const title = this.add.text(0, -52, card.name, {
      fontSize: '16px',
      color: '#4a2d18',
      fontStyle: 'bold',
      wordWrap: { width: 82 },
      align: 'center',
    }).setOrigin(0.5);
    const desc = this.add.text(0, 6, card.description, {
      fontSize: '10px',
      color: '#5a4024',
      wordWrap: { width: 82 },
      align: 'center',
      lineSpacing: 1,
    }).setOrigin(0.5);
    preview.add([bg, title, desc]);
    this.playedCardPreview = preview;
    this.playZoneLabel.setAlpha(0.22);

    this.tweens.add({
      targets: preview,
      x: this.playZone.x,
      y: this.playZone.y,
      angle: Phaser.Math.Between(-10, 10),
      scaleX: 0.92,
      scaleY: 0.92,
      ease: 'Cubic.easeOut',
      duration: 240,
      onComplete: () => {
        preview.destroy();
        if (this.playedCardPreview === preview) {
          this.playedCardPreview = null;
        }
        this.playZoneLabel.setAlpha(0.08);
      },
    });
  }

  animateEnemyCard(card, startX, startY) {
    const preview = this.add.container(startX, startY);
    const bg = this.add.image(0, 0, 'ui_card_frame').setDisplaySize(112, 162);
    const title = this.add.text(0, -48, card.name, {
      fontSize: '15px',
      color: '#4a2d18',
      fontStyle: 'bold',
      wordWrap: { width: 78 },
      align: 'center',
    }).setOrigin(0.5);
    const desc = this.add.text(0, 4, card.description, {
      fontSize: '10px',
      color: '#5a4024',
      wordWrap: { width: 78 },
      align: 'center',
      lineSpacing: 1,
    }).setOrigin(0.5);
    preview.add([bg, title, desc]);
    preview.setDepth(20);
    preview.setScale(0.82);
    this.sfx?.playEnemyCard(this.state.enemy.id);

    this.tweens.add({
      targets: preview,
      x: this.playZone.x + Phaser.Math.Between(-30, 20),
      y: this.playZone.y + Phaser.Math.Between(-18, 12),
      angle: Phaser.Math.Between(-18, 18),
      scaleX: 0.96,
      scaleY: 0.96,
      ease: 'Back.easeOut',
      duration: 280,
      onComplete: () => {
        this.tweens.add({
          targets: this.playZone,
          scaleX: 1.02,
          scaleY: 1.02,
          yoyo: true,
          duration: 60,
        });
        preview.destroy();
      },
    });
  }

  addTableCard(card) {
    const turnSourceIndex = this.currentTurnCards.filter(entry => entry.source === card.source).length;
    const settledIndex = this.tableCards.length - this.currentTurnCards.length;
    const x = card.source === 'enemy'
      ? this.playZone.x + 26 + turnSourceIndex * 64
      : this.playZone.x - 118 + turnSourceIndex * 64;
    const y = card.source === 'enemy'
      ? this.playZone.y - 16
      : this.playZone.y + 22;
    const angle = card.source === 'enemy'
      ? Phaser.Math.Between(-6, 10)
      : Phaser.Math.Between(-10, 6);
    const container = this.add.container(x, y);
    const bg = this.add.image(0, 0, 'ui_card_frame').setDisplaySize(88, 128);
    const title = this.add.text(0, -36, card.name, {
      fontSize: '12px',
      color: '#4a2d18',
      fontStyle: 'bold',
      wordWrap: { width: 62 },
      align: 'center',
    }).setOrigin(0.5);
    const desc = this.add.text(0, 8, card.description, {
      fontSize: '9px',
      color: '#5a4024',
      wordWrap: { width: 60 },
      align: 'center',
      lineSpacing: 1,
      maxLines: 4,
    }).setOrigin(0.5);
    const badge = this.add.text(0, 46, card.source === 'enemy' ? '敌' : '我', {
      fontSize: '12px',
      color: card.source === 'enemy' ? '#7a3520' : '#7a5320',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add([bg, title, desc, badge]);
    container.setAngle(angle);
    container.setScale(0.72);
    this.tableCardLayer.add(container);
    this.tableCards.push({ container, bg, title, desc, badge, facedown: false, source: card.source });
    this.currentTurnCards.push({ container, bg, title, desc, badge, source: card.source });
    this.tableCards.slice(0, settledIndex).forEach((entry, index) => {
      entry.container.x = this.playZone.x - 112 + (index % 5) * 18;
      entry.container.y = this.playZone.y + 2 + Math.floor(index / 5) * 8;
      entry.container.setScale(0.58);
      entry.container.setAngle(-4 + (index % 5) * 2);
    });
    this.playZoneLabel.setAlpha(0.08);
  }

  flipCurrentTurnCards() {
    const cardsToFlip = [...this.currentTurnCards];
    this.currentTurnCards = [];
    cardsToFlip.forEach((entry, index) => {
      this.time.delayedCall(index * 90, () => {
        this.tweens.add({
          targets: entry.container,
          scaleX: 0.08,
          duration: 100,
          onComplete: () => {
            entry.bg.setTexture('ui_card_back');
            entry.title.setVisible(false);
            entry.desc.setVisible(false);
            entry.badge.setVisible(false);
            this.tweens.add({
              targets: entry.container,
              scaleX: 0.72,
              scaleY: 0.72,
              duration: 130,
            });
          },
        });
      });
    });
  }

  renderLog() {
    if (this.logPanel) {
      this.logPanel.destroy();
      this.logPanel = null;
    }
    this.logPanel = this.rexUI.add.textArea({
      x: this.logX + 146,
      y: this.logY + 70,
      width: 292,
      height: 140,
      background: this.add.image(0, 0, 'ui_panel').setDisplaySize(292, 140),
      text: this.add.text(0, 0, '', {
        fontSize: '13px',
        color: '#5b4126',
        wordWrap: { width: 244 },
        lineSpacing: 4,
      }),
      content: `战斗日志\n\n${this.state.log.join('\n\n')}`,
      textWidth: 248,
      textHeight: 82,
      space: {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16,
      },
    }).layout();
  }

  renderResult() {
    if (this.resultText) {
      this.resultText.destroy();
      this.resultText = null;
    }
    const result = this.state.getResult();
    if (!result) return;
    const label = result === 'win' ? '战斗胜利' : '战斗失败';
    const color = result === 'win' ? 0x7b5a2f : 0x6b2e1f;
    this.resultText = this.rexUI.add.label({
      x: this.scale.width / 2,
      y: 54,
      width: 240,
      height: 54,
      background: this.add.rectangle(0, 0, 240, 54, color, 0.94).setStrokeStyle(2, 0xf1d59c, 0.55),
      text: this.add.text(0, 0, label, {
        fontSize: '30px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
  }

  handleFinishedBattle() {
    const outcome = this.state.getSceneOutcome();
    if (!outcome) return;
    if (outcome.type === 'reward') {
      this.sfx?.resume();
      this.sfx?.playReward();
      this.scene.start('RewardScene', {
        progress: outcome.progress,
        rewardCards: outcome.rewardCards,
      });
      return;
    }
    this.sfx?.resume();
    this.sfx?.playDefeat();
    this.scene.start('MenuScene');
  }
}
