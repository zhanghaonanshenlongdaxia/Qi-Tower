import { EVENT_LIBRARY } from '../data/events';
import { getStoryStep } from '../data/story';
import { UIHelper } from '../utils/UIHelper';

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create(data) {
    this.progress = data.progress || {
      deckId: 'novice_cultivator',
      maxHp: 50,
      playerHp: 50,
      gold: 90,
      relicIds: ['bronze_mirror', 'spirit_ring'],
      routeId: 'trial_route_alpha',
      clearedNodes: [],
      bonusCards: [],
      storySeen: [],
      currentStoryStep: null,
    };
    this.sfx = this.registry.get('sfxManager');

    const registry = this.registry.get('dataRegistry');
    this.dataRegistry = registry;
    this.route = registry.getMapRoute(this.progress.routeId);

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x120d0a, 1);
    this.add.circle(160, 120, 180, 0x7a552d, 0.14);
    this.add.circle(width - 180, 160, 200, 0x4b2a18, 0.14);
    UIHelper.createPanel(this, width / 2, height / 2, width - 92, height - 92);
    this.add.image(width / 2, 96, 'ui_banner').setScale(0.96);
    this.add.image(width / 2, 70, 'ui_badge').setScale(0.64);

    this.add.text(width / 2, 96, '试炼地图', {
      fontSize: '31px',
      color: '#f4ead7',
      fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 164, `路线：${this.route.name}    当前生命：${this.progress.playerHp || 50}/${this.progress.maxHp || 50}    灵石：${this.progress.gold || 0}    已得奖励卡：${(this.progress.bonusCards || []).length} 张`, {
      fontSize: '18px',
      color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);

    const relics = (this.progress.relicIds || []).map(id => this.dataRegistry.getRelic(id)).filter(Boolean);
    if (relics.length > 0) {
      const relicLabel = this.add.text(128, 164, '当前遗物：', {
        fontSize: '14px', color: '#f0d060', fontStyle: 'bold',
        stroke: '#2a0e04', strokeThickness: 2,
      }).setOrigin(0, 0.5);
      relics.forEach((relic, index) => {
        const rx = 214 + index * 48;
        const badge = this.add.rectangle(rx, 164, 42, 24, 0x5a3614, 1)
          .setStrokeStyle(1, 0xd9a441, 0.55)
          .setInteractive({ useHandCursor: false });
        const txt = this.add.text(rx, 164, relic.name.slice(0, 3), {
          fontSize: '10px', color: '#f7ead0', fontStyle: 'bold',
          stroke: '#2a0e04', strokeThickness: 2,
        }).setOrigin(0.5);
        badge.on('pointerover', () => this._showRelicTooltip(relic, rx, 144));
        badge.on('pointerout', () => this._hideRelicTooltip());
      });
    }

    const growthBtn = this.rexUI.add.label({
      x: width - 106,
      y: 164,
      width: 120,
      height: 34,
      background: this.add.rectangle(0, 0, 120, 34, 0x5a3614, 1).setStrokeStyle(1, 0xd9a441, 0.55),
      text: this.add.text(0, 0, '查看成长', {
        fontSize: '15px', color: '#f7ead0', fontStyle: 'bold',
        stroke: '#2a0e04', strokeThickness: 2,
      }),
      align: 'center',
    }).layout();
    growthBtn.setInteractive({ useHandCursor: true });
    growthBtn.on('pointerdown', () => {
      this.sfx?.resume();
      this.sfx?.playUiTap();
      this._showGrowthPanel();
    });

    const pendingBattleNotice = this.buildPendingBattleNotice(this.progress);
    if (pendingBattleNotice) {
      this.rexUI.add.label({
        x: width / 2,
        y: 194,
        width: 620,
        height: 36,
        background: this.add.rectangle(0, 0, 620, 36, 0x4b311d, 0.72).setStrokeStyle(1, 0xc89b3c, 0.34),
        text: this.add.text(0, 0, pendingBattleNotice, {
          fontSize: '14px',
          color: '#f2dfbc',
        }),
        align: 'center',
      }).layout();
    }

    const recentRewardNotice = this.buildRecentRewardNotice(this.progress);
    if (recentRewardNotice) {
      this.rexUI.add.label({
        x: width / 2,
        y: pendingBattleNotice ? 230 : 194,
        width: 700,
        height: 36,
        background: this.add.rectangle(0, 0, 700, 36, 0x6a4520, 0.72).setStrokeStyle(1, 0xe0b060, 0.34),
        text: this.add.text(0, 0, recentRewardNotice, {
          fontSize: '14px',
          color: '#f4e2b8',
        }),
        align: 'center',
      }).layout();
      this.progress.lastRewardSummary = null;
    }

    this.rexUI.add.label({
      x: width / 2,
      y: pendingBattleNotice ? (recentRewardNotice ? 270 : 236) : (recentRewardNotice ? 236 : 226),
      width: 560,
      height: 48,
      background: this.add.rectangle(0, 0, 560, 48, 0x4b311d, 0.72).setStrokeStyle(1, 0xc89b3c, 0.34),
      text: this.add.text(0, 0, '选择下一个节点推进路线。现在支持分岔与汇合，满足前置节点即可解锁后续道路。', {
        fontSize: '16px',
        color: '#f2dfbc',
      }),
      align: 'center',
    }).layout();

    const viewportX = 132;
    const viewportY = 286;
    const viewportWidth = width - 264;
    const viewportHeight = 250;
    this.nodeViewportBounds = new Phaser.Geom.Rectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    const viewportMaskShape = this.make.graphics({ add: false });
    viewportMaskShape.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
    const viewportMask = viewportMaskShape.createGeometryMask();
    this.nodeContainer = this.add.container(viewportX + 24, 0);
    this.nodeContainer.setMask(viewportMask);
    this.isDraggingNodes = false;
    this.didDragNodes = false;
    this.nodeDragCandidate = false;
    this.nodeDragStartX = 0;
    this.nodeDragStartContainerX = 0;

    const contentWidth = Math.max(viewportWidth - 48, this.route.nodes.length * 220 + (this.route.nodes.length - 1) * 58);
    this.nodeScrollMinX = viewportX + 24 - Math.max(0, contentWidth - (viewportWidth - 48));
    this.nodeScrollMaxX = viewportX + 24;
    const segment = this.route.nodes.length > 1 ? (contentWidth - 220) / (this.route.nodes.length - 1) : 0;
    const laneYMap = {
      top: 338,
      mid: 392,
      bottom: 446,
    };
    const nodePositions = new Map();

    this.route.nodes.forEach((node, index) => {
      const x = 110 + index * segment;
      const y = laneYMap[node.lane] || laneYMap.mid;
      nodePositions.set(node.id, { x, y, node, index });
    });

    this.route.nodes.forEach((node, index) => {
      const { x, y } = nodePositions.get(node.id);
      const requires = this.getNodeRequirements(node, index);
      requires.forEach((reqId) => {
        const from = nodePositions.get(reqId);
        if (!from) return;
        const line = this.add.line(0, 0, from.x + 92, from.y, x - 92, y, 0xc89b3c, 0.42)
          .setLineWidth(3)
          .setOrigin(0, 0);
        this.nodeContainer.add(line);
      });
    });

    this.route.nodes.forEach((node, index) => {
      const { x, y } = nodePositions.get(node.id);
      const cleared = this.progress.clearedNodes.includes(node.id);
      const available = !cleared && this.isNodeAvailable(node, index);
      const badgeColor = cleared ? '#f0d9ad' : available ? '#fff0b3' : '#94785a';
      const typeLabel = this.getNodeTypeLabel(node.type);
      const statusLabel = this.getNodeStatusLabel(cleared, available);
      const nodeButton = this.rexUI.add.label({
        x,
        y,
        width: 220,
        height: 122,
        orientation: 1,
        background: this.add.image(0, 0, 'ui_node').setDisplaySize(220, 122).setAlpha(cleared ? 0.7 : 1),
        text: this.add.text(0, 0, `${node.name}\n${typeLabel} · ${statusLabel}`, {
          fontSize: '18px',
          color: '#f4ead7',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: 174 },
          lineSpacing: 8,
        }),
        align: 'center',
        space: {
          top: 20,
          bottom: 16,
          left: 14,
          right: 14,
        },
      }).layout();

      nodeButton.getElement('text').setColor(badgeColor === '#8b93aa' ? '#b2b7c6' : '#f4ead7');
      this.nodeContainer.add(nodeButton);

      if (available) {
        nodeButton.setInteractive({ useHandCursor: true });
        nodeButton.on('pointerup', () => {
          if (this.didDragNodes) return;
          this.sfx?.resume();
          this.sfx?.playNodeSelect();
          this.handleNodeSelection(node);
        });
      }
    });

    this.input.on('wheel', (pointer, _objects, _dx, dy) => {
      if (!Phaser.Geom.Rectangle.Contains(this.nodeViewportBounds, pointer.x, pointer.y)) return;
      this.setNodeScrollPosition(this.nodeContainer.x - dy * 0.35);
    });

    this.input.on('pointerdown', pointer => {
      if (!Phaser.Geom.Rectangle.Contains(this.nodeViewportBounds, pointer.x, pointer.y)) return;
      this.nodeDragCandidate = true;
      this.nodeDragStartX = pointer.x;
      this.nodeDragStartContainerX = this.nodeContainer.x;
      this.isDraggingNodes = false;
    });

    this.input.on('pointermove', pointer => {
      if (!this.nodeDragCandidate || !pointer.isDown) return;
      const dragDelta = pointer.x - this.nodeDragStartX;
      if (!this.isDraggingNodes && Math.abs(dragDelta) > 8) {
        this.isDraggingNodes = true;
        this.didDragNodes = true;
      }
      if (!this.isDraggingNodes) return;
      this.setNodeScrollPosition(this.nodeDragStartContainerX + dragDelta);
    });

    this.input.on('pointerup', () => {
      this.nodeDragCandidate = false;
      this.isDraggingNodes = false;
      if (this.didDragNodes) {
        this.time.delayedCall(0, () => {
          this.didDragNodes = false;
        });
      }
    });

    this.rexUI.add.label({
      x: width / 2,
      y: height - 74,
      width: 420,
      height: 42,
      background: this.add.rectangle(0, 0, 420, 42, 0x4b311d, 0.68).setStrokeStyle(1, 0xc89b3c, 0.24),
      text: this.add.text(0, 0, '提示：分岔节点只需满足任一前置条件，汇合节点会在任一路线完成后开启。', {
        fontSize: '16px',
        color: '#ead8b8',
      }),
      align: 'center',
    }).layout();

    this.time.delayedCall(80, () => {
      this.maybeShowPendingStory();
    });
  }

  getNodeTypeLabel(type) {
    if (type === 'battle') return '战斗';
    if (type === 'elite') return '精英';
    if (type === 'boss') return 'Boss';
    if (type === 'event') return '奇遇';
    if (type === 'rest') return '休整';
    if (type === 'shop') return '商店';
    return type;
  }

  getNodeStatusLabel(cleared, available) {
    if (cleared) return '已完成';
    if (available) return '可前往';
    return '未解锁';
  }

  getNodeRequirements(node, index) {
    if (Array.isArray(node.requires) && node.requires.length > 0) return node.requires;
    if (index === 0) return [];
    const previousNode = this.route.nodes[index - 1];
    return previousNode ? [previousNode.id] : [];
  }

  isNodeAvailable(node, index) {
    const requirements = this.getNodeRequirements(node, index);
    if (requirements.length === 0) return true;
    const clearedSet = new Set(this.progress.clearedNodes || []);
    return requirements.some(reqId => clearedSet.has(reqId));
  }

  getAvailableNodesForProgress(progress) {
    const clearedSet = new Set(progress.clearedNodes || []);
    return this.route.nodes.filter((candidate, index) => {
      if (clearedSet.has(candidate.id)) return false;
      const requirements = this.getNodeRequirements(candidate, index);
      if (requirements.length === 0) return true;
      return requirements.some(reqId => clearedSet.has(reqId));
    });
  }

  buildNextNodePreviewMessage(progress) {
    const upcoming = this.getAvailableNodesForProgress(progress).slice(0, 3);
    if (upcoming.length === 0) return '前路被迷雾遮蔽，你暂时看不清任何新的去向。';
    const summary = upcoming.map(node => `【${node.name}】${this.getNodeTypeLabel(node.type)}`).join('、');
    return `占卜师窥见了你眼前的道路：${summary}。`;
  }

  buildPendingBattleNotice(progress) {
    const parts = [];
    const buffs = progress.nextBattleBuffs || {};
    const mods = progress.nextBattleModifiers || {};
    if (buffs.strength) parts.push(`下一战力量 +${buffs.strength}`);
    if (buffs.dexterity) parts.push(`下一战敏捷 +${buffs.dexterity}`);
    if (mods.enemyBonusHpPercent || mods.enemyExtraCards) {
      parts.push(`下一战敌人异变：${mods.label || '强化敌方'}`);
    }
    if (parts.length === 0) return '';
    return `待生效战斗效果：${parts.join(' / ')}`;
  }

  buildRecentRewardNotice(progress) {
    const summary = progress.lastRewardSummary;
    if (!summary) return '';
    const parts = [];
    if (summary.goldReward) parts.push(`灵石 +${summary.goldReward}`);
    if (summary.gainedCards?.length) parts.push(`获得卡牌：${summary.gainedCards.join('、')}`);
    if (summary.gainedRelics?.length) parts.push(`获得遗物：${summary.gainedRelics.join('、')}`);
    if (parts.length === 0) return '';
    return `上次战利：${parts.join(' / ')}`;
  }

  _showRelicTooltip(relic, wx, wy) {
    this._hideRelicTooltip();
    const tipW = 220;
    const tipH = 72;
    const tx = Math.min(Math.max(wx - tipW / 2, 8), this.scale.width - tipW - 8);
    const ty = Math.max(wy - tipH - 8, 8);
    const bg = this.add.rectangle(tx + tipW / 2, ty + tipH / 2, tipW, tipH, 0x1e1208, 0.96)
      .setStrokeStyle(1, 0xd9a441, 0.6)
      .setDepth(100);
    const name = this.add.text(tx + 10, ty + 10, relic.name, {
      fontSize: '13px', color: '#f0d060', fontStyle: 'bold',
    }).setDepth(100);
    const desc = this.add.text(tx + 10, ty + 30, relic.description || '', {
      fontSize: '11px', color: '#ead8b8', wordWrap: { width: tipW - 20 }, lineSpacing: 2,
    }).setDepth(100);
    this._relicTooltip = [bg, name, desc];
  }

  _hideRelicTooltip() {
    if (this._relicTooltip) {
      this._relicTooltip.forEach(item => item.destroy());
      this._relicTooltip = null;
    }
  }

  _showGrowthPanel() {
    if (this._growthPanelItems) return;
    const { width, height } = this.scale;
    const runtimeDeck = this.dataRegistry.buildRuntimeDeck(this.progress.deckId, this.progress.bonusCards || [], this.progress.removedCardIds || []);
    const bonusCardNames = (this.progress.bonusCards || [])
      .map(id => this.dataRegistry.getCard(id)?.name)
      .filter(Boolean);
    const relics = (this.progress.relicIds || [])
      .map(id => this.dataRegistry.getRelic(id))
      .filter(Boolean);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 0.88).setInteractive();
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(760, 440);
    const banner = this.add.image(width / 2, height / 2 - 184, 'ui_banner').setDisplaySize(720, 60);
    const title = this.add.text(width / 2, height / 2 - 184, '当前成长总览', {
      fontSize: '28px', color: '#f4ead7', fontStyle: 'bold',
      stroke: '#2a0e04', strokeThickness: 4,
    }).setOrigin(0.5);

    const summary = this.add.text(width / 2, height / 2 - 132,
      `生命 ${this.progress.playerHp}/${this.progress.maxHp} · 灵石 ${this.progress.gold} · 牌库 ${runtimeDeck.length} 张 · 遗物 ${relics.length} 件 · 奖励卡 ${bonusCardNames.length} 张`, {
        fontSize: '16px', color: '#ead8b8', align: 'center', stroke: '#2a0e04', strokeThickness: 2,
      }
    ).setOrigin(0.5);

    const relicTitle = this.add.text(120, height / 2 - 98, '遗物收藏', {
      fontSize: '20px', color: '#f0d060', fontStyle: 'bold', stroke: '#2a0e04', strokeThickness: 3,
    });
    const relicBody = this.add.text(120, height / 2 - 66,
      relics.length > 0
        ? relics.map(relic => `${relic.name}：${relic.description}`).join('\n\n')
        : '尚未获得遗物。', {
        fontSize: '13px', color: '#ead8b8', wordWrap: { width: 250 }, lineSpacing: 6,
      });

    const deckTitle = this.add.text(width / 2 + 40, height / 2 - 98, '奖励卡与牌库成长', {
      fontSize: '20px', color: '#f0d060', fontStyle: 'bold', stroke: '#2a0e04', strokeThickness: 3,
    });
    const deckBody = this.add.text(width / 2 + 40, height / 2 - 66,
      bonusCardNames.length > 0
        ? `本轮新增：\n${bonusCardNames.join('、')}\n\n当前牌库总数：${runtimeDeck.length} 张`
        : `本轮尚未获得奖励卡。\n\n当前牌库总数：${runtimeDeck.length} 张`, {
        fontSize: '13px', color: '#ead8b8', wordWrap: { width: 280 }, lineSpacing: 6,
      });

    const closeBtn = this.rexUI.add.label({
      x: width / 2,
      y: height / 2 + 172,
      width: 180,
      height: 44,
      background: this.add.rectangle(0, 0, 180, 44, 0x6d4621, 1).setStrokeStyle(1, 0xf1d59c, 0.42),
      text: this.add.text(0, 0, '关闭', {
        fontSize: '20px', color: '#f7ead0', fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    closeBtn.setInteractive({ useHandCursor: true });

    const closeGrowth = () => {
      this._growthPanelItems?.forEach(item => item.destroy());
      this._growthPanelItems = null;
    };

    overlay.on('pointerdown', closeGrowth);
    closeBtn.on('pointerdown', closeGrowth);
    closeBtn.on('pointerover', () => closeBtn.getElement('background').setFillStyle(0x8f5e27, 1));
    closeBtn.on('pointerout', () => closeBtn.getElement('background').setFillStyle(0x6d4621, 1));

    this._growthPanelItems = [overlay, panel, banner, title, summary, relicTitle, relicBody, deckTitle, deckBody, closeBtn];
  }

  setNodeScrollPosition(nextX) {
    this.nodeContainer.x = Phaser.Math.Clamp(nextX, this.nodeScrollMinX, this.nodeScrollMaxX);
  }

  handleNodeSelection(node) {
    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      const enemyPool = Array.isArray(node.enemyPool) && node.enemyPool.length > 0 ? node.enemyPool : [node.enemyId];
      const selectedEnemyId = enemyPool[Math.floor(Math.random() * enemyPool.length)] || node.enemyId;
      this.scene.start('BattleScene', {
        deckId: this.progress.deckId,
        relicIds: this.progress.relicIds,
        enemyId: selectedEnemyId,
        mapProgress: this.progress,
        currentNodeId: node.id,
        rewardCount: node.rewardCount || 3,
        goldReward: node.goldReward || 0,
        isElite: node.type === 'elite',
        isBoss: node.type === 'boss',
      });
      return;
    }

    const nextProgress = {
      ...this.progress,
      maxHp: this.progress.maxHp || 50,
      playerHp: this.progress.playerHp || this.progress.maxHp || 50,
      gold: this.progress.gold || 0,
      clearedNodes: [...new Set([...(this.progress.clearedNodes || []), node.id])],
      bonusCards: [...(this.progress.bonusCards || [])],
      relicIds: [...(this.progress.relicIds || [])],
      storySeen: [...(this.progress.storySeen || [])],
      currentStoryStep: this.progress.currentStoryStep || null,
    };

    if (node.type === 'rest') {
      nextProgress.playerHp = Math.min(nextProgress.maxHp, nextProgress.playerHp + (node.heal || 10));
      this.showResolutionPanel('灵泉歇脚', `你在灵泉中调息，恢复了 ${node.heal || 10} 点生命。`, nextProgress);
      return;
    }

    if (node.type === 'event') {
      this.showEventPanel(node, nextProgress);
      return;
    }

    if (node.type === 'shop') {
      this.showShopPanel(node, nextProgress);
    }
  }

  showEventPanel(node, nextProgress) {
    const allowedPool = (node.eventPool && node.eventPool.length > 0)
      ? EVENT_LIBRARY.filter(e => node.eventPool.includes(e.id))
      : EVENT_LIBRARY.filter(e => !['combat_training', 'bonus_combat'].includes(e.id));
    const pool = allowedPool.length > 0
      ? allowedPool
      : EVENT_LIBRARY.filter(e => !['combat_training', 'bonus_combat'].includes(e.id));
    const event = pool[Math.floor(Math.random() * pool.length)];
    const { width, height } = this.scale;

    const panelW = 660;
    const panelH = 76 + 56 * event.options.length + 60;
    const panelX = width / 2;
    const panelY = height / 2;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 0.88).setInteractive();
    const panel = this.add.image(panelX, panelY, 'ui_panel').setDisplaySize(panelW, panelH);
    const banner = this.add.image(panelX, panelY - panelH / 2 + 4, 'ui_banner').setDisplaySize(panelW - 20, 60);
    const heading = this.add.text(panelX, panelY - panelH / 2 + 30, event.name, {
      fontSize: '26px', color: '#f4ead7', fontStyle: 'bold',
    }).setOrigin(0.5);
    const desc = this.add.text(panelX, panelY - panelH / 2 + 64, event.description, {
      fontSize: '14px', color: '#ead5ad', align: 'center', wordWrap: { width: panelW - 60 },
    }).setOrigin(0.5);

    const disposables = [overlay, panel, banner, heading, desc];

    const closeEvent = (resultMsg, mutatedProgress) => {
      disposables.forEach(o => { if (o && o.destroy) o.destroy(); });
      if (resultMsg) {
        this.showResolutionPanel('结果', resultMsg, mutatedProgress || nextProgress);
      } else {
        this.scene.start('MapScene', { progress: mutatedProgress || nextProgress });
      }
    };

    const optionStartY = panelY - panelH / 2 + 102;
    event.options.forEach((opt, i) => {
      const btnY = optionStartY + i * 56;
      const canAfford = this._canAffordOption(opt, nextProgress);
      const btnBg = this.add.rectangle(panelX, btnY, panelW - 60, 44,
        canAfford ? 0x5a3614 : 0x2e1a09, 1
      ).setStrokeStyle(1, canAfford ? 0xd9a441 : 0x7a5a30, canAfford ? 0.7 : 0.3).setInteractive({ useHandCursor: canAfford });
      const costLabel = this._buildCostLabel(opt);
      const btnLabel = costLabel ? `${opt.text}` : opt.text;
      const btnText = this.add.text(panelX, btnY, btnLabel, {
        fontSize: '14px', color: canAfford ? '#f0d8a8' : '#6a5030',
        align: 'center', wordWrap: { width: panelW - 80 },
      }).setOrigin(0.5);
      disposables.push(btnBg, btnText);
      if (!canAfford) return;
      btnBg.on('pointerover', () => btnBg.setFillStyle(0x8f5e27, 1));
      btnBg.on('pointerout', () => btnBg.setFillStyle(0x5a3614, 1));
      btnBg.on('pointerdown', () => {
        this.sfx?.resume();
        this.sfx?.playUiTap();
        const outcome = this._resolveEventOption(opt, nextProgress, event, node);
        if (outcome.action === 'open_shop') {
          disposables.forEach(o => { if (o && o.destroy) o.destroy(); });
          this.showShopPanel(node, outcome.progress, {
            heading: outcome.heading || event.name,
            subheading: outcome.subheading || '神秘摊位上摆满了来路不明的货物。',
            cardCount: outcome.cardCount,
            relicCount: outcome.relicCount,
            priceMultiplier: outcome.priceMultiplier,
            serviceEntries: outcome.serviceEntries,
          });
          return;
        }
        if (outcome.action === 'choose_cards') {
          disposables.forEach(o => { if (o && o.destroy) o.destroy(); });
          this.showEventCardChoicePanel(
            outcome.title || event.name,
            outcome.description || '从中选择 1 张卡加入卡组。',
            outcome.cards || [],
            outcome.progress || nextProgress,
          );
          return;
        }
        if (outcome.action === 'start_battle') {
          disposables.forEach(o => { if (o && o.destroy) o.destroy(); });
          this.scene.start('BattleScene', {
            deckId: outcome.progress.deckId,
            relicIds: outcome.progress.relicIds,
            enemyId: outcome.enemyId,
            mapProgress: outcome.progress,
            currentNodeId: node.id,
            rewardCount: outcome.rewardCount || 4,
            goldReward: outcome.goldReward || 30,
            isElite: outcome.isElite !== false,
          });
          return;
        }
        closeEvent(outcome.msg, outcome.progress);
      });
    });
  }

  _canAffordOption(opt, progress) {
    if (opt.effect === 'leave') return true;
    if (opt.cost?.gold && progress.gold < Math.abs(opt.cost.gold)) return false;
    return true;
  }

  _buildCostLabel(opt) {
    if (!opt.cost) return '';
    const parts = [];
    if (opt.cost.gold) parts.push(`${opt.cost.gold > 0 ? '+' : ''}${opt.cost.gold} 灵石`);
    if (opt.cost.hp) parts.push(`${opt.cost.hp > 0 ? '+' : ''}${opt.cost.hp} 生命`);
    if (opt.cost.maxHp) parts.push(`最大生命 ${opt.cost.maxHp}`);
    return parts.join(' / ');
  }

  _resolveEventOption(opt, progress, event, node) {
    const p = {
      ...progress,
      bonusCards: [...progress.bonusCards],
      relicIds: [...progress.relicIds],
      nextBattleBuffs: { ...(progress.nextBattleBuffs || {}) },
      nextBattleModifiers: { ...(progress.nextBattleModifiers || {}) },
    };
    if (opt.effect === 'leave') return { msg: null, progress: p };

    if (opt.cost?.gold) p.gold = Math.max(0, p.gold + opt.cost.gold);
    if (opt.cost?.hp) p.playerHp = Math.max(1, p.playerHp + opt.cost.hp);
    if (opt.cost?.maxHp) { p.maxHp = Math.max(10, p.maxHp + opt.cost.maxHp); p.playerHp = Math.min(p.playerHp, p.maxHp); }

    if (opt.effect === 'heal_percent') {
      const heal = Math.floor(p.maxHp * (opt.value || 0.3));
      p.playerHp = Math.min(p.maxHp, p.playerHp + heal);
      return { msg: `你休息片刻，恢复了 ${heal} 点生命。`, progress: p };
    }
    if (opt.effect === 'get_gold') {
      const range = opt.goldRange || [30, 60];
      const gold = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      p.gold += gold;
      return { msg: `你获得了 ${gold} 灵石！`, progress: p };
    }
    if (opt.effect === 'cleanse') {
      p.playerHp = Math.min(p.maxHp, p.playerHp + (opt.heal || 15));
      return { msg: `你沐浴在池水中，恢复了 ${opt.heal || 15} 点生命，所有负面状态消除。`, progress: p };
    }
    if (opt.effect === 'choose_card') {
      return {
        action: 'choose_cards',
        title: event?.name || node?.name || '奇遇选牌',
        description: '从领悟到的招式中选择 1 张加入卡组。',
        cards: this.dataRegistry.getRewardCardChoices(opt.cardCount || 3),
        progress: p,
      };
    }
    if (opt.effect === 'gain_strength') {
      p.nextBattleBuffs.strength = (p.nextBattleBuffs.strength || 0) + (opt.value || 2);
      return { msg: `你在修炼场中悟得杀意，下一场战斗获得 ${opt.value || 2} 点力量。`, progress: p };
    }
    if (opt.effect === 'gain_dexterity') {
      p.nextBattleBuffs.dexterity = (p.nextBattleBuffs.dexterity || 0) + (opt.value || 2);
      return { msg: `你在冥想中稳住气息，下一场战斗获得 ${opt.value || 2} 点敏捷。`, progress: p };
    }
    if (opt.effect === 'upgrade_card') {
      return {
        action: 'choose_cards',
        title: event?.name || node?.name || '锻造领悟',
        description: '你将感悟锻造成更强招法，从更高品质的卡中选择 1 张加入卡组。',
        cards: this.dataRegistry.getRewardCardChoices(3, true),
        progress: p,
      };
    }
    if (opt.effect === 'help_traveler') {
      const relics = this.dataRegistry.getRelicChoices(1, p.relicIds);
      if (relics.length > 0) p.relicIds.push(relics[0].id);
      return { msg: `旅人感激你的帮助，赠予你遗物【${relics[0]?.name || '未知遗物'}】。`, progress: p };
    }
    if (opt.effect === 'rob_traveler') {
      p.gold += opt.reward?.gold || 30;
      return { msg: `你打劫了旅人，获得了 ${opt.reward?.gold || 30} 灵石。业力缠身，后患无穷……`, progress: p };
    }
    if (opt.effect === 'get_cursed_relic') {
      const relics = this.dataRegistry.getRelicChoices(1, p.relicIds);
      if (relics.length > 0) p.relicIds.push(relics[0].id);
      return { msg: `你饮下泉水，获得遗物【${relics[0]?.name || '诅咒遗物'}】，但最大生命减少了。`, progress: p };
    }
    if (opt.effect === 'ghost_gift') {
      const relics = this.dataRegistry.getRelicChoices(1, p.relicIds);
      if (relics.length > 0) p.relicIds.push(relics[0].id);
      return { msg: `幽灵给予你遗物【${relics[0]?.name || '幽冥遗物'}】，但你感到生机消减……`, progress: p };
    }
    if (opt.effect === 'gamble_strength' || opt.effect === 'gamble_gold') {
      const win = Math.random() < (opt.chance || 0.5);
      if (win) {
        if (opt.success?.gold) p.gold += opt.success.gold;
        if (opt.success?.strength) {
          p.nextBattleBuffs.strength = (p.nextBattleBuffs.strength || 0) + opt.success.strength;
        }
        const msg = opt.success?.gold
          ? `神明庇佑！你获得了 ${opt.success.gold} 灵石！`
          : `神明赐予力量！下一场战斗获得 ${opt.success?.strength || 0} 点力量。`;
        return { msg, progress: p };
      } else {
        if (opt.failure?.hp) p.playerHp = Math.max(1, p.playerHp + opt.failure.hp);
        return { msg: `神明降罪！你失去了 ${Math.abs(opt.failure?.hp || 0)} 点生命。`, progress: p };
      }
    }
    if (opt.effect === 'free_upgrade') {
      return {
        action: 'choose_cards',
        title: event?.name || node?.name || '大师点化',
        description: '大师点化你一式精进招法，从中选择 1 张更强的卡加入卡组。',
        cards: this.dataRegistry.getRewardCardChoices(3, true),
        progress: p,
      };
    }
    if (opt.effect === 'reveal_next') {
      return { msg: this.buildNextNodePreviewMessage(p), progress: p };
    }
    if (opt.effect === 'black_market_shop') {
      return {
        action: 'open_shop',
        heading: '黑市秘货',
        subheading: '昏暗摊位上的货物来路不明，但品质似乎更危险，也更诱人。',
        cardCount: 4,
        relicCount: 2,
        priceMultiplier: 1.2,
        progress: p,
      };
    }
    if (opt.effect === 'bonus_combat') {
      const elitePool = ['jade_construct', 'seal_warden', 'bronze_mask_keeper'];
      const enemyId = elitePool[Math.floor(Math.random() * elitePool.length)];
      return {
        action: 'start_battle',
        enemyId,
        rewardCount: 4,
        goldReward: opt.bonusReward?.gold || 30,
        isElite: true,
        progress: p,
      };
    }
    if (opt.effect === 'get_boss_relic') {
      const relics = this.dataRegistry.getRelicChoices(1, p.relicIds);
      if (relics.length > 0) p.relicIds.push(relics[0].id);
      p.nextBattleModifiers = {
        enemyBonusHpPercent: 0.25,
        enemyExtraCards: 1,
        label: '神像余烬',
      };
      return { msg: `你带走了神像，获得遗物【${relics[0]?.name || '古老神像'}】。冥冥之中，前路也因此变得更危险。`, progress: p };
    }
    if (opt.effect === 'open_shop') {
      return {
        action: 'open_shop',
        heading: event?.name || '神秘商人',
        subheading: '商人掀开斗笠，示意你随意挑选货物。',
        progress: p,
      };
    }
    return { msg: '事件结束。', progress: p };
  }

  showEventCardChoicePanel(title, description, cards, nextProgress) {
    const { width, height } = this.scale;
    const panelW = 780;
    const panelH = 430;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 0.88).setInteractive();
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(panelW, panelH);
    const banner = this.add.image(width / 2, height / 2 - panelH / 2 + 6, 'ui_banner').setDisplaySize(panelW - 20, 64);
    const heading = this.add.text(width / 2, height / 2 - panelH / 2 + 32, title, {
      fontSize: '28px', color: '#f4ead7', fontStyle: 'bold',
      stroke: '#2a0e04', strokeThickness: 4,
    }).setOrigin(0.5);
    const body = this.add.text(width / 2, height / 2 - panelH / 2 + 76, description, {
      fontSize: '16px', color: '#ead8b8', align: 'center', wordWrap: { width: panelW - 80 },
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);
    const disposables = [overlay, panel, banner, heading, body];
    const cardY = height / 2 + 26;
    const cardW = 180;
    const cardH = 240;
    const gap = 28;
    const totalW = cards.length * cardW + Math.max(0, cards.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + cardW / 2;

    const finish = () => {
      disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
      this.scene.start('MapScene', { progress: nextProgress });
    }

    cards.forEach((card, index) => {
      const x = startX + index * (cardW + gap);
      const cardFrontKey = card.rarity === 'rare' ? 'card_front_rare' : (card.rarity === 'uncommon' ? 'card_front_uncommon' : 'card_front_common');
      const bg = this.add.image(x, cardY, cardFrontKey).setDisplaySize(cardW, cardH).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, cardY - cardH / 2 + 22, card.name, {
        fontSize: '14px', color: '#3a1a06', fontStyle: 'bold', align: 'center', wordWrap: { width: cardW - 20 }, maxLines: 1,
      }).setOrigin(0.5);
      const infoText = this.add.text(x, cardY - cardH / 2 + 44, `耗能 ${card.cost} · ${card.type}`, {
        fontSize: '10px', color: '#7a5a30', align: 'center',
      }).setOrigin(0.5);
      const shortDesc = card.description.length > 30 ? card.description.slice(0, 28) + '…' : card.description;
      const descText = this.add.text(x, cardY - 6, shortDesc, {
        fontSize: '11px', color: '#5a4024', align: 'center', wordWrap: { width: cardW - 24 }, lineSpacing: 3, maxLines: 4,
      }).setOrigin(0.5);
      const pickText = this.add.text(x, cardY + cardH / 2 - 22, '选取', {
        fontSize: '14px', color: '#f0d060', fontStyle: 'bold',
        stroke: '#2a0e04', strokeThickness: 2,
      }).setOrigin(0.5);
      bg.on('pointerover', () => bg.setTint(0xffe8a0));
      bg.on('pointerout', () => bg.clearTint());
      bg.on('pointerdown', () => {
        nextProgress.bonusCards.push(card.id);
        this.sfx?.playReward();
        finish();
      });
      disposables.push(bg, nameText, infoText, descText, pickText);
    });

    const skipBtn = this.add.image(width / 2, height / 2 + panelH / 2 - 30, 'ui_panel').setDisplaySize(170, 40).setInteractive({ useHandCursor: true });
    const skipTxt = this.add.text(width / 2, height / 2 + panelH / 2 - 30, '放弃领悟', {
      fontSize: '16px', color: '#f7ead0', fontStyle: 'bold',
    }).setOrigin(0.5);
    skipBtn.on('pointerdown', finish);
    skipBtn.on('pointerover', () => skipBtn.setTint(0xffe0a0));
    skipBtn.on('pointerout', () => skipBtn.clearTint());
    disposables.push(skipBtn, skipTxt);
  }

  showShopPanel(node, nextProgress, shopMeta = {}) {
    const { width, height } = this.scale;
    const cardCount = shopMeta.cardCount || 3;
    const relicCount = shopMeta.relicCount || 1;
    const priceMultiplier = shopMeta.priceMultiplier || 1;
    const buildEntries = () => {
      const cards = this.dataRegistry.getShopCardChoices(cardCount).map(entry => ({
        ...entry,
        price: Math.round(entry.price * priceMultiplier),
      }));
      const relics = this.dataRegistry.getRelicChoices(relicCount, nextProgress.relicIds).map(entry => ({
        ...entry,
        price: Math.round(entry.price * priceMultiplier),
      }));
      return [...cards, ...relics];
    };
    let entries = buildEntries();
    const serviceEntries = shopMeta.serviceEntries || [
      {
        id: 'heal_service',
        kind: 'service',
        name: '疗伤',
        description: '恢复 12 点生命。若生命已满则无法使用。',
        price: 35,
      },
      {
        id: 'refresh_stock',
        kind: 'service',
        name: '换货',
        description: '刷新当前商店货物，替换成新的一批商品。',
        price: 18,
      },
      {
        id: 'mystic_scroll',
        kind: 'service',
        name: '秘卷择法',
        description: '支付灵石，从商人秘卷中选择 1 张卡加入卡组。',
        price: 45,
      },
      {
        id: 'purge_card',
        kind: 'service',
        name: '焚卷净牌',
        description: '支付灵石，从当前牌库中移除 1 张卡。',
        price: 40,
      },
    ];

    const CARD_W = 154;
    const CARD_H = 210;
    const CARD_GAP = 22;
    const totalCardW = entries.length * CARD_W + (entries.length - 1) * CARD_GAP;
    const panelW = Math.max(560, totalCardW + 100);
    const panelH = 420;
    const panelX = width / 2;
    const panelY = height / 2;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 0.88).setInteractive();
    const panel = this.add.image(panelX, panelY, 'ui_panel').setDisplaySize(panelW, panelH);
    const banner = this.add.image(panelX, panelY - panelH / 2 + 4, 'ui_banner').setDisplaySize(panelW - 20, 64);
    const heading = this.add.text(panelX, panelY - panelH / 2 + 32, shopMeta.heading || '山门小市', {
      fontSize: '28px', color: '#f4ead7', fontStyle: 'bold',
    }).setOrigin(0.5);
    const subheading = this.add.text(panelX, panelY - panelH / 2 + 62, shopMeta.subheading || '商贩正等着你挑选货物。', {
      fontSize: '13px', color: '#ead8b8', align: 'center', wordWrap: { width: panelW - 80 },
    }).setOrigin(0.5);
    const goldText = this.add.text(panelX, panelY - panelH / 2 + 84, `当前灵石：${nextProgress.gold}`, {
      fontSize: '16px', color: '#ead5ad',
    }).setOrigin(0.5);
    const hpText = this.add.text(panelX, panelY - panelH / 2 + 106, `当前生命：${nextProgress.playerHp}/${nextProgress.maxHp}`, {
      fontSize: '15px', color: '#f0d8a8',
    }).setOrigin(0.5);

    const disposables = [overlay, panel, banner, heading, subheading, goldText, hpText];
    const shopItems = [];

    const refreshGold = () => {
      goldText.setText(`当前灵石：${nextProgress.gold}`);
      hpText.setText(`当前生命：${nextProgress.playerHp}/${nextProgress.maxHp}`);
    };

    const clearShopItems = () => {
      while (shopItems.length > 0) {
        const item = shopItems.pop();
        if (item && item.destroy) item.destroy();
      }
    };

    const closeShop = () => {
      clearShopItems();
      disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
      this.scene.start('MapScene', { progress: nextProgress });
    };

    const renderShopItems = () => {
      clearShopItems();
      refreshGold();

      const currentTotalCardW = entries.length * CARD_W + Math.max(0, entries.length - 1) * CARD_GAP;
      const cardsStartX = panelX - currentTotalCardW / 2 + CARD_W / 2;
      const cardY = panelY + 10;

      entries.forEach((entry, index) => {
        const x = cardsStartX + index * (CARD_W + CARD_GAP);
        const canAfford = () => nextProgress.gold >= entry.price;

        const cardFrontKey = entry.rarity === 'rare' ? 'card_front_rare' : (entry.rarity === 'uncommon' ? 'card_front_uncommon' : 'card_front_common');
        const bg = this.add.image(x, cardY, cardFrontKey).setDisplaySize(CARD_W, CARD_H).setInteractive({ useHandCursor: true });
        const nameText = this.add.text(x, cardY - CARD_H / 2 + 18, entry.name, {
          fontSize: '13px', color: '#4a2d18', fontStyle: 'bold',
          align: 'center', wordWrap: { width: CARD_W - 20 }, maxLines: 1,
        }).setOrigin(0.5);
        const typeText = this.add.text(x, cardY - CARD_H / 2 + 38, entry.type || '遗物', {
          fontSize: '10px', color: '#8d6a3a', align: 'center',
        }).setOrigin(0.5);
        const entryShortDesc = (entry.description || '').length > 26 ? (entry.description || '').slice(0, 24) + '…' : (entry.description || '');
        const descText = this.add.text(x, cardY - 8, entryShortDesc, {
          fontSize: '10px', color: '#5a4024', align: 'center',
          wordWrap: { width: CARD_W - 20 }, lineSpacing: 3, maxLines: 3,
        }).setOrigin(0.5);
        const priceBox = this.add.rectangle(x, cardY + CARD_H / 2 - 22, 90, 28, 0x5a3614, 1).setStrokeStyle(1, 0xd9a441, 0.6);
        const priceText = this.add.text(x, cardY + CARD_H / 2 - 22, `灵石 ${entry.price}`, {
          fontSize: '13px', color: '#f0d060', fontStyle: 'bold',
        }).setOrigin(0.5);

        const tintUnavailable = () => {
          if (!canAfford()) bg.setTint(0x886644);
          else bg.clearTint();
        };
        tintUnavailable();

        bg.on('pointerover', () => { if (canAfford()) bg.setTint(0xffe8a0); });
        bg.on('pointerout', () => tintUnavailable());
        bg.on('pointerdown', () => {
          if (!canAfford()) { this.sfx?.playDefeat(); return; }
          nextProgress.gold -= entry.price;
          if (entry.type) nextProgress.bonusCards.push(entry.id);
          else nextProgress.relicIds.push(entry.id);
          entries.splice(index, 1);
          this.sfx?.playReward();
          renderShopItems();
        });

        shopItems.push(bg, nameText, typeText, descText, priceBox, priceText);
      });

      const serviceY = panelY + panelH / 2 - 74;
      serviceEntries.forEach((service, index) => {
        const x = panelX - 120 + index * 240;
        const canPurge = this.dataRegistry.buildRuntimeDeck(
          nextProgress.deckId,
          nextProgress.bonusCards || [],
          nextProgress.removedCardIds || [],
        ).length > 0;
        const canUse = service.id === 'heal_service'
          ? nextProgress.gold >= service.price && nextProgress.playerHp < nextProgress.maxHp
          : service.id === 'purge_card'
            ? nextProgress.gold >= service.price && canPurge
          : nextProgress.gold >= service.price;
        const serviceBg = this.add.rectangle(x, serviceY, 200, 48, canUse ? 0x5a3614 : 0x2e1a09, 1)
          .setStrokeStyle(1, canUse ? 0xd9a441 : 0x7a5a30, canUse ? 0.7 : 0.3)
          .setInteractive({ useHandCursor: canUse });
        const serviceText = this.add.text(x, serviceY - 8, `${service.name} · ${service.price} 灵石`, {
          fontSize: '14px', color: canUse ? '#f0d8a8' : '#6a5030', fontStyle: 'bold', align: 'center',
        }).setOrigin(0.5);
        const serviceDesc = this.add.text(x, serviceY + 10, service.description, {
          fontSize: '10px', color: canUse ? '#dbc89f' : '#6a5030', align: 'center', wordWrap: { width: 184 },
        }).setOrigin(0.5);

        if (canUse) {
          serviceBg.on('pointerover', () => serviceBg.setFillStyle(0x8f5e27, 1));
          serviceBg.on('pointerout', () => serviceBg.setFillStyle(0x5a3614, 1));
          serviceBg.on('pointerdown', () => {
            nextProgress.gold -= service.price;
            if (service.id === 'heal_service') {
              const heal = Math.min(12, nextProgress.maxHp - nextProgress.playerHp);
              nextProgress.playerHp += heal;
            }
            if (service.id === 'refresh_stock') {
              entries = buildEntries();
            }
            if (service.id === 'mystic_scroll') {
              clearShopItems();
              disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
              this.sfx?.playReward();
              this.showEventCardChoicePanel(
                '秘卷择法',
                '商人摊开几卷秘法残页，你可从中选择 1 张卡加入卡组。',
                this.dataRegistry.getRewardCardChoices(3),
                nextProgress,
              );
              return;
            }
            if (service.id === 'purge_card') {
              clearShopItems();
              disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
              this.sfx?.playReward();
              this.showCardPurgePanel(
                '焚卷净牌',
                '从当前牌库中选择 1 张卡移除。被移除的卡将不会再进入之后的战斗。',
                nextProgress,
              );
              return;
            }
            this.sfx?.playReward();
            renderShopItems();
          });
        }

        shopItems.push(serviceBg, serviceText, serviceDesc);
      });
    };

    renderShopItems();

    const leaveBtn = this.add.image(panelX, panelY + panelH / 2 - 32, 'ui_panel').setDisplaySize(180, 42);
    const leaveTxt = this.add.text(panelX, panelY + panelH / 2 - 32, '离开商店', {
      fontSize: '18px', color: '#f7ead0', fontStyle: 'bold',
    }).setOrigin(0.5);
    leaveBtn.setInteractive({ useHandCursor: true });
    leaveBtn.on('pointerdown', closeShop);
    leaveBtn.on('pointerover', () => leaveBtn.setTint(0xffe0a0));
    leaveBtn.on('pointerout', () => leaveBtn.clearTint());
    disposables.push(leaveBtn, leaveTxt);
  }

  showCardPurgePanel(title, description, nextProgress) {
    const { width, height } = this.scale;
    const cards = this.dataRegistry.buildRuntimeDeck(
      nextProgress.deckId,
      nextProgress.bonusCards || [],
      nextProgress.removedCardIds || [],
    );
    const panelW = 820;
    const panelH = 440;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0604, 0.88).setInteractive();
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(panelW, panelH);
    const banner = this.add.image(width / 2, height / 2 - panelH / 2 + 8, 'ui_banner').setDisplaySize(panelW - 20, 64);
    const heading = this.add.text(width / 2, height / 2 - panelH / 2 + 32, title, {
      fontSize: '28px', color: '#f4ead7', fontStyle: 'bold', stroke: '#2a0e04', strokeThickness: 4,
    }).setOrigin(0.5);
    const body = this.add.text(width / 2, height / 2 - panelH / 2 + 76, description, {
      fontSize: '16px', color: '#ead8b8', align: 'center', wordWrap: { width: panelW - 80 }, stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);
    const disposables = [overlay, panel, banner, heading, body];

    const finish = () => {
      disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
      this.scene.start('MapScene', { progress: nextProgress });
    };

    const visibleCards = cards.slice(0, 4);
    const cardY = height / 2 + 22;
    const cardW = 170;
    const cardH = 230;
    const gap = 24;
    const totalW = visibleCards.length * cardW + Math.max(0, visibleCards.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + cardW / 2;

    visibleCards.forEach((card, index) => {
      const x = startX + index * (cardW + gap);
      const cardFrontKey = card.rarity === 'rare' ? 'card_front_rare' : (card.rarity === 'uncommon' ? 'card_front_uncommon' : 'card_front_common');
      const bg = this.add.image(x, cardY, cardFrontKey).setDisplaySize(cardW, cardH).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, cardY - cardH / 2 + 20, card.name, {
        fontSize: '13px', color: '#3a1a06', fontStyle: 'bold', align: 'center', wordWrap: { width: cardW - 18 }, maxLines: 1,
      }).setOrigin(0.5);
      const infoText = this.add.text(x, cardY - cardH / 2 + 42, `耗能 ${card.cost} · ${card.type}`, {
        fontSize: '10px', color: '#7a5a30', align: 'center',
      }).setOrigin(0.5);
      const purgeShortDesc = card.description.length > 28 ? card.description.slice(0, 26) + '…' : card.description;
      const descText = this.add.text(x, cardY - 4, purgeShortDesc, {
        fontSize: '10px', color: '#5a4024', align: 'center', wordWrap: { width: cardW - 20 }, lineSpacing: 3, maxLines: 3,
      }).setOrigin(0.5);
      const pickText = this.add.text(x, cardY + cardH / 2 - 20, '移除', {
        fontSize: '14px', color: '#f0d060', fontStyle: 'bold', stroke: '#2a0e04', strokeThickness: 2,
      }).setOrigin(0.5);
      bg.on('pointerover', () => bg.setTint(0xffe8a0));
      bg.on('pointerout', () => bg.clearTint());
      bg.on('pointerdown', () => {
        nextProgress.removedCardIds = nextProgress.removedCardIds || [];
        nextProgress.removedCardIds.push(card.id);
        this.sfx?.playReward();
        finish();
      });
      disposables.push(bg, nameText, infoText, descText, pickText);
    });

    const skipBtn = this.add.image(width / 2, height / 2 + panelH / 2 - 30, 'ui_panel').setDisplaySize(170, 40).setInteractive({ useHandCursor: true });
    const skipTxt = this.add.text(width / 2, height / 2 + panelH / 2 - 30, '暂不焚牌', {
      fontSize: '16px', color: '#f7ead0', fontStyle: 'bold',
    }).setOrigin(0.5);
    skipBtn.on('pointerdown', finish);
    skipBtn.on('pointerover', () => skipBtn.setTint(0xffe0a0));
    skipBtn.on('pointerout', () => skipBtn.clearTint());
    disposables.push(skipBtn, skipTxt);
  }

  showResolutionPanel(title, description, nextProgress) {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x140d09, 0.72).setInteractive();
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(500, 240);
    const heading = this.add.text(width / 2, height / 2 - 54, title, {
      fontSize: '30px',
      color: '#f4ead7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const body = this.add.text(width / 2, height / 2, description, {
      fontSize: '18px',
      color: '#ead9bb',
      align: 'center',
      wordWrap: { width: 380 },
    }).setOrigin(0.5);
    const button = this.rexUI.add.label({
      x: width / 2,
      y: height / 2 + 70,
      width: 180,
      height: 48,
      background: this.add.rectangle(0, 0, 180, 48, 0x8f5e27, 1).setStrokeStyle(1, 0xf1d59c, 0.5),
      text: this.add.text(0, 0, '继续前进', {
        fontSize: '22px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      heading.destroy();
      body.destroy();
      button.destroy();
      this.scene.start('MapScene', { progress: nextProgress });
    });
  }

  maybeShowPendingStory() {
    const clearedSet = new Set(this.progress.clearedNodes || []);
    const seenSet = new Set(this.progress.storySeen || []);
    const pendingNode = this.route.nodes.find(node => node.storyStep && clearedSet.has(node.id) && !seenSet.has(node.storyStep));
    if (!pendingNode) return;
    const step = getStoryStep(pendingNode.storyStep);
    if (!step) return;
    this.showStoryPanel(step, pendingNode);
  }

  showStoryPanel(step, node) {
    const { width, height } = this.scale;
    const dramatic = ['tower_threshold', 'tower_heart', 'hall_gate'].includes(step.id);
    const panelTint = dramatic ? 0x2a120d : 0x090503;
    const titleColor = dramatic ? '#ffd07a' : '#f4ead7';
    const hintColor = dramatic ? '#ffcf8e' : '#d3b47a';
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x090503, 0.86).setInteractive();
    const glow = this.add.rectangle(width / 2, height / 2, 736, 376, panelTint, dramatic ? 0.34 : 0.18).setStrokeStyle(2, dramatic ? 0xffb35f : 0xc89b3c, dramatic ? 0.5 : 0.24);
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(720, 360);
    const banner = this.add.image(width / 2, height / 2 - 142, 'ui_banner').setDisplaySize(660, 64);
    const title = this.add.text(width / 2, height / 2 - 142, step.title, {
      fontSize: '28px',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#2a0e04', strokeThickness: 4,
    }).setOrigin(0.5);
    const fromNode = this.add.text(width / 2, height / 2 - 96, `节点：${node.name}`, {
      fontSize: '15px',
      color: '#dcbf87',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);
    const storyViewportW = 520;
    const storyViewportH = 96;
    const storyViewportX = width / 2 - storyViewportW / 2;
    const storyViewportY = height / 2 - storyViewportH / 2 - 4;
    const storyPaddingX = 22;
    const storyPaddingY = 14;
    const storyMaskShape = this.make.graphics({ add: false });
    storyMaskShape.fillRect(storyViewportX, storyViewportY, storyViewportW, storyViewportH);
    const storyMask = storyMaskShape.createGeometryMask();
    const storyContainer = this.add.container(0, 0);
    const body = this.add.text(width / 2, storyViewportY + storyPaddingY, step.body, {
      fontSize: '18px',
      color: '#ead9bb',
      align: 'center',
      wordWrap: { width: storyViewportW - storyPaddingX * 2 },
      lineSpacing: 8,
    }).setOrigin(0.5, 0);
    storyContainer.add(body);
    storyContainer.setMask(storyMask);
    const maxStoryScroll = Math.max(0, body.height - (storyViewportH - storyPaddingY * 2));
    const storyFrame = this.add.rectangle(width / 2, storyViewportY + storyViewportH / 2, storyViewportW + 20, storyViewportH + 18, 0x2b160d, 0.08)
      .setStrokeStyle(1, dramatic ? 0xffb35f : 0xc89b3c, 0.22);
    const hint = this.add.text(width / 2, height / 2 + 96, `线索：${step.hint}`, {
      fontSize: '15px',
      color: hintColor,
      align: 'center',
      wordWrap: { width: 540 },
      lineSpacing: 4,
    }).setOrigin(0.5);
    if (dramatic) {
      this.tweens.add({
        targets: [banner, glow],
        alpha: { from: 0.82, to: 1 },
        yoyo: true,
        repeat: -1,
        duration: 680,
      });
    }
    const button = this.rexUI.add.label({
      x: width / 2,
      y: height / 2 + 146,
      width: 220,
      height: 50,
      background: this.add.rectangle(0, 0, 220, 50, 0x8f5e27, 1).setStrokeStyle(1, 0xf1d59c, 0.5),
      text: this.add.text(0, 0, '记下线索', {
        fontSize: '21px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    button.setInteractive({ useHandCursor: true });
    const updateStoryScroll = (deltaY) => {
      if (maxStoryScroll <= 0) return;
      const nextY = Phaser.Math.Clamp(body.y + deltaY, storyViewportY + storyPaddingY - maxStoryScroll, storyViewportY + storyPaddingY);
      body.y = nextY;
    };
    const wheelHandler = (pointer, _objects, _dx, dy) => {
      if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(storyViewportX, storyViewportY, storyViewportW, storyViewportH), pointer.x, pointer.y)) return;
      updateStoryScroll(-dy * 0.35);
    };
    const pointerHandler = (pointer) => {
      if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(storyViewportX, storyViewportY, storyViewportW, storyViewportH), pointer.x, pointer.y)) return;
      updateStoryScroll(pointer.velocity.y * 0.02);
    };
    this.input.on('wheel', wheelHandler);
    this.input.on('pointermove', pointerHandler);
    button.on('pointerdown', () => {
      this.progress.storySeen = [...new Set([...(this.progress.storySeen || []), step.id])];
      this.progress.currentStoryStep = step.id;
      this.input.off('wheel', wheelHandler);
      this.input.off('pointermove', pointerHandler);
      overlay.destroy();
      glow.destroy();
      panel.destroy();
      banner.destroy();
      title.destroy();
      fromNode.destroy();
      storyFrame.destroy();
      storyContainer.destroy();
      body.destroy();
      hint.destroy();
      button.destroy();
    });
  }
}
