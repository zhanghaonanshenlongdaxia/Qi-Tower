import { enableRuntimeUIEditor } from '../utils/RuntimeUIEditor';

export class RewardScene extends Phaser.Scene {
  constructor() {
    super('RewardScene');
  }

  create(data) {
    enableRuntimeUIEditor(this);
    this.progress = data.progress;
    this.rewardCards = data.rewardCards || [];
    this.rewardRelics = data.rewardRelics || [];
    this.rewardSummary = data.rewardSummary || null;
    this.sfx = this.registry.get('sfxManager');
    this.dataRegistry = this.registry.get('dataRegistry');
    const { width, height } = this.scale;

    this.add.circle(150, 110, 170, 0x7a552d, 0.13);
    this.add.circle(width - 150, 130, 170, 0x6b3d28, 0.12);
    this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(width - 70, height - 70);
    this.add.image(width / 2, 96, 'ui_badge').setScale(0.9);

    this._stepObjects = [];
    this._showCardRewardStep();
  }

  _clearStepObjects() {
    this._stepObjects.forEach(item => item.destroy());
    this._stepObjects = [];
  }

  _registerStepObjects(...items) {
    this._stepObjects.push(...items);
  }

  _finishRewards() {
    this.scene.start('MapScene', { progress: this.progress });
  }

  _ensureLastRewardSummary() {
    if (!this.progress.lastRewardSummary) {
      this.progress.lastRewardSummary = {
        gainedCards: [],
        gainedRelics: [],
        goldReward: this.rewardSummary?.goldReward || 0,
      };
    }
    return this.progress.lastRewardSummary;
  }

  _showGrowthSummary(y) {
    const deckSize = this.dataRegistry?.buildRuntimeDeck
      ? this.dataRegistry.buildRuntimeDeck(this.progress.deckId, this.progress.bonusCards || [], this.progress.removedCardIds || []).length
      : (this.progress.bonusCards || []).length;
    const summary = this.add.text(
      this.scale.width / 2,
      y,
      `当前成长：生命 ${this.progress.playerHp}/${this.progress.maxHp} · 灵石 ${this.progress.gold} · 牌库 ${deckSize} 张 · 遗物 ${(this.progress.relicIds || []).length} 件 · 奖励卡 ${(this.progress.bonusCards || []).length} 张`,
      {
        fontSize: '14px',
        color: '#ead8b8',
        stroke: '#2a0e04', strokeThickness: 2,
      },
    ).setOrigin(0.5);
    this._registerStepObjects(summary);
  }

  _showBattleLootSummary(y) {
    if (!this.rewardSummary) return;
    const parts = [];
    if (this.rewardSummary.goldReward) parts.push(`灵石 +${this.rewardSummary.goldReward}`);
    if (this.rewardSummary.relicCount > 0) parts.push(`遗物奖励 ${this.rewardSummary.relicCount} 选 1`);
    if (this.rewardSummary.isBoss) parts.push('Boss 奖励');
    else if (this.rewardSummary.isElite) parts.push('精英奖励');
    if (parts.length === 0) return;
    const loot = this.add.text(this.scale.width / 2, y, `本场战利：${parts.join(' · ')}`, {
      fontSize: '15px',
      color: '#f0d890',
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);
    this._registerStepObjects(loot);
  }

  _completeCardReward(cardId = null) {
    if (cardId) {
      this.progress.bonusCards = this.progress.bonusCards || [];
      this.progress.bonusCards.push(cardId);
      const cardName = this.rewardCards.find(card => card.id === cardId)?.name;
      if (cardName) {
        const summary = this._ensureLastRewardSummary();
        summary.gainedCards.push(cardName);
      }
    }
    if (this.rewardRelics.length > 0) {
      this._showRelicRewardStep();
      return;
    }
    this._finishRewards();
  }

  _showCardRewardStep() {
    this._clearStepObjects();
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, 144, '奖励选牌', {
      fontSize: '38px',
      color: '#f4ead7',
      fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 5,
    }).setOrigin(0.5);

    const desc = this.add.text(width / 2, 190, '选择 1 张卡加入卡组，或跳过。奖励卡会永久加入本轮路线。', {
      fontSize: '19px',
      color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);
    this._registerStepObjects(title, desc);
    this._showBattleLootSummary(222);
    this._showGrowthSummary(248);

    this.rewardCards.forEach((card, index) => {
      const x = 210 + index * 300;
      const y = 390;
      const cardFrontKey = card.rarity === 'rare' ? 'card_front_rare' : (card.rarity === 'uncommon' ? 'card_front_uncommon' : 'card_front_common');
      const shortDesc = card.description.length > 28 ? card.description.slice(0, 26) + '…' : card.description;
      const label = this.rexUI.add.label({
        x,
        y,
        width: 220,
        height: 300,
        orientation: 1,
        background: this.add.image(0, 0, cardFrontKey).setDisplaySize(220, 300),
        text: this.add.text(0, 0, `${card.name}\n\n耗能 ${card.cost}   类型 ${card.type}\n\n${shortDesc}\n\n${card.rarity.toUpperCase()}`, {
          fontSize: '15px',
          color: '#2a1206',
          align: 'center',
          fontStyle: 'bold',
          wordWrap: { width: 176 },
          lineSpacing: 8,
          maxLines: 8,
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
      label.on('pointerover', () => {
        this._showRewardCardTooltip(card, x, y - 160);
      });
      label.on('pointerout', () => {
        this._hideRewardCardTooltip();
      });
      label.on('pointerdown', () => {
        this._hideRewardCardTooltip();
        this.sfx?.resume();
        this.sfx?.playReward();
        this._completeCardReward(card.id);
      });
      this._registerStepObjects(label);
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
      this._completeCardReward();
    });
    this._registerStepObjects(skipButton);
  }

  _showRelicRewardStep() {
    this._clearStepObjects();
    const { width, height } = this.scale;
    const title = this.add.text(width / 2, 144, '遗物奖励', {
      fontSize: '38px',
      color: '#f4ead7',
      fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 5,
    }).setOrigin(0.5);

    const desc = this.add.text(width / 2, 190, '精英与强敌倒下后，你可从战利品中选择 1 件遗物带走。', {
      fontSize: '18px',
      color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 640 },
    }).setOrigin(0.5);
    this._registerStepObjects(title, desc);
    this._showBattleLootSummary(222);
    this._showGrowthSummary(248);

    const relicW = 240;
    const relicH = 170;
    const gap = 34;
    const totalW = this.rewardRelics.length * relicW + Math.max(0, this.rewardRelics.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + relicW / 2;

    this.rewardRelics.forEach((relic, index) => {
      const x = startX + index * (relicW + gap);
      const y = 390;
      const bg = this.add.image(x, y, 'ui_panel').setDisplaySize(relicW, relicH).setInteractive({ useHandCursor: true });
      const name = this.add.text(x, y - 44, relic.name, {
        fontSize: '20px', color: '#f0d060', fontStyle: 'bold', align: 'center',
        stroke: '#2a0e04', strokeThickness: 3, wordWrap: { width: relicW - 24 },
      }).setOrigin(0.5);
      const descText = this.add.text(x, y + 8, relic.description || '', {
        fontSize: '13px', color: '#ead8b8', align: 'center', wordWrap: { width: relicW - 30 }, lineSpacing: 5,
        stroke: '#2a0e04', strokeThickness: 2,
      }).setOrigin(0.5);
      const pick = this.add.text(x, y + 58, '带走遗物', {
        fontSize: '15px', color: '#f7ead0', fontStyle: 'bold', stroke: '#2a0e04', strokeThickness: 2,
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setTint(0xffe0a0));
      bg.on('pointerout', () => bg.clearTint());
      bg.on('pointerdown', () => {
        this.sfx?.resume();
        this.sfx?.playReward();
        this.progress.relicIds = this.progress.relicIds || [];
        if (!this.progress.relicIds.includes(relic.id)) this.progress.relicIds.push(relic.id);
        const summary = this._ensureLastRewardSummary();
        summary.gainedRelics.push(relic.name);
        this._finishRewards();
      });

      this._registerStepObjects(bg, name, descText, pick);
    });

    const skipButton = this.rexUI.add.label({
      x: width / 2,
      y: height - 88,
      width: 220,
      height: 58,
      background: this.add.rectangle(0, 0, 220, 58, 0x6d4621, 1).setStrokeStyle(2, 0xf1d59c, 0.42),
      text: this.add.text(0, 0, '跳过遗物', {
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
      this._finishRewards();
    });
    this._registerStepObjects(skipButton);
  }

  _showRewardCardTooltip(card, wx, wy) {
    this._hideRewardCardTooltip();
    const tipW = 230;
    const effectParts = [];
    if (card.damage) effectParts.push(`伤害 ${card.damage}`);
    if (card.block) effectParts.push(`格挡 ${card.block}`);
    if (card.draw) effectParts.push(`抽牌 ${card.draw}`);
    if (card.applyStatus) effectParts.push(`${card.applyStatus.id} ${card.applyStatus.stacks}`);
    if (Array.isArray(card.applyStatuses)) {
      card.applyStatuses.forEach(entry => effectParts.push(`${entry.id} ${entry.stacks}`));
    }
    const lines = [card.name, `耗能 ${card.cost}  类型 ${card.type}  ${String(card.rarity).toUpperCase()}`];
    if (effectParts.length > 0) lines.push(effectParts.join(' · '));
    if (card.description) lines.push(card.description);
    const content = lines.join('\n');
    const tmpText = this.add.text(0, 0, content, { fontSize: '13px', wordWrap: { width: tipW - 20 }, lineSpacing: 3 });
    const textH = tmpText.height;
    tmpText.destroy();
    const tipH = textH + 24;
    const tx = Math.min(Math.max(wx - tipW / 2, 4), this.scale.width - tipW - 4);
    const ty = Math.max(wy - tipH - 6, 4);
    const tipBg = this.add.rectangle(tx + tipW / 2, ty + tipH / 2, tipW, tipH, 0x1e1208, 0.96).setStrokeStyle(1, 0xd9a441, 0.7).setDepth(150);
    const tipText = this.add.text(tx + 10, ty + 10, content, {
      fontSize: '13px', color: '#ead8b8', wordWrap: { width: tipW - 20 }, lineSpacing: 3,
    }).setDepth(150);
    this._rewardCardTooltip = [tipBg, tipText];
  }

  _hideRewardCardTooltip() {
    if (this._rewardCardTooltip) {
      this._rewardCardTooltip.forEach(o => o.destroy());
      this._rewardCardTooltip = null;
    }
  }
}
