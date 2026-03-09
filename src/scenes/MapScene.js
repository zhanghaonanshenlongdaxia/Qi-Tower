import { EVENT_LIBRARY } from '../data/events';
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

    this.rexUI.add.label({
      x: width / 2,
      y: 226,
      width: 560,
      height: 48,
      background: this.add.rectangle(0, 0, 560, 48, 0x4b311d, 0.72).setStrokeStyle(1, 0xc89b3c, 0.34),
      text: this.add.text(0, 0, '选择下一个节点进入战斗。每个节点胜利后都可以进行奖励选牌。', {
        fontSize: '16px',
        color: '#f2dfbc',
      }),
      align: 'center',
    }).layout();

    const viewportX = 132;
    const viewportY = 286;
    const viewportWidth = width - 264;
    const viewportHeight = 210;
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

    const lineY = 392;
    const contentWidth = Math.max(viewportWidth - 48, this.route.nodes.length * 220 + (this.route.nodes.length - 1) * 58);
    this.nodeScrollMinX = viewportX + 24 - Math.max(0, contentWidth - (viewportWidth - 48));
    this.nodeScrollMaxX = viewportX + 24;
    this.nodeContainer.add(this.add.rectangle(contentWidth / 2, lineY, contentWidth, 4, 0x7b5a2f, 0.4).setStrokeStyle(1, 0xd9a441, 0.28));

    const segment = this.route.nodes.length > 1 ? (contentWidth - 220) / (this.route.nodes.length - 1) : 0;
    this.route.nodes.forEach((node, index) => {
      const x = 110 + index * segment;
      const y = 404;
      const cleared = this.progress.clearedNodes.includes(node.id);
      const available = !cleared && (index === 0 || this.progress.clearedNodes.includes(this.route.nodes[index - 1].id));
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
      text: this.add.text(0, 0, '提示：先过前一个节点，后面的节点才会解锁。', {
        fontSize: '16px',
        color: '#ead8b8',
      }),
      align: 'center',
    }).layout();
  }

  getNodeTypeLabel(type) {
    if (type === 'battle') return '战斗';
    if (type === 'elite') return '精英';
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

  setNodeScrollPosition(nextX) {
    this.nodeContainer.x = Phaser.Math.Clamp(nextX, this.nodeScrollMinX, this.nodeScrollMaxX);
  }

  handleNodeSelection(node) {
    if (node.type === 'battle' || node.type === 'elite') {
      this.scene.start('BattleScene', {
        deckId: this.progress.deckId,
        relicIds: this.progress.relicIds,
        enemyId: node.enemyId,
        mapProgress: this.progress,
        currentNodeId: node.id,
        rewardCount: node.rewardCount || 3,
        goldReward: node.goldReward || 0,
        isElite: node.type === 'elite',
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
    const pool = EVENT_LIBRARY.filter(e =>
      !['combat_training', 'bonus_combat'].includes(e.id)
    );
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
        const { msg, progress } = this._resolveEventOption(opt, nextProgress);
        closeEvent(msg, progress);
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

  _resolveEventOption(opt, progress) {
    const p = {
      ...progress,
      bonusCards: [...progress.bonusCards],
      relicIds: [...progress.relicIds],
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
      const cards = this.dataRegistry.getRewardCardChoices(opt.cardCount || 3);
      const card = cards[Math.floor(Math.random() * cards.length)];
      if (card) p.bonusCards.push(card.id);
      return { msg: `你研读古籍，习得了【${card?.name || '奇妙卡牌'}】。`, progress: p };
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
        const msg = opt.success?.gold
          ? `神明庇佑！你获得了 ${opt.success.gold} 灵石！`
          : `神明赐予力量！（当前版本不直接附加力量层数，已记录）`;
        return { msg, progress: p };
      } else {
        if (opt.failure?.hp) p.playerHp = Math.max(1, p.playerHp + opt.failure.hp);
        return { msg: `神明降罪！你失去了 ${Math.abs(opt.failure?.hp || 0)} 点生命。`, progress: p };
      }
    }
    if (opt.effect === 'free_upgrade') {
      return { msg: '大师点化，你感到功力大进！（卡牌升级功能开发中）', progress: p };
    }
    if (opt.effect === 'reveal_next') {
      return { msg: '占卜师预言：前方有强大的敌人在等待你……做好准备。', progress: p };
    }
    if (opt.effect === 'black_market_shop') {
      const card = this.dataRegistry.getRewardCardChoices(1)[0];
      if (card) p.bonusCards.push(card.id);
      return { msg: `黑市掌柜塞给你一张牌【${card?.name || '来路不明的牌'}】，不知真假……`, progress: p };
    }
    return { msg: '事件结束。', progress: p };
  }

  showShopPanel(node, nextProgress) {
    const { width, height } = this.scale;
    const cardChoices = this.dataRegistry.getShopCardChoices(3);
    const relicChoices = this.dataRegistry.getRelicChoices(1, nextProgress.relicIds);
    const entries = [...cardChoices, ...relicChoices];

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
    const heading = this.add.text(panelX, panelY - panelH / 2 + 32, '山门小市', {
      fontSize: '28px', color: '#f4ead7', fontStyle: 'bold',
    }).setOrigin(0.5);
    const goldText = this.add.text(panelX, panelY - panelH / 2 + 72, `当前灵石：${nextProgress.gold}`, {
      fontSize: '16px', color: '#ead5ad',
    }).setOrigin(0.5);

    const disposables = [overlay, panel, banner, heading, goldText];

    const refreshGold = () => {
      goldText.setText(`当前灵石：${nextProgress.gold}`);
    };

    const closeShop = () => {
      disposables.forEach(item => { if (item && item.destroy) item.destroy(); });
      this.scene.start('MapScene', { progress: nextProgress });
    };

    const cardsStartX = panelX - totalCardW / 2 + CARD_W / 2;
    const cardY = panelY + 20;

    entries.forEach((entry, index) => {
      const x = cardsStartX + index * (CARD_W + CARD_GAP);
      const canAfford = () => nextProgress.gold >= entry.price;

      const bg = this.add.image(x, cardY, 'ui_card_frame').setDisplaySize(CARD_W, CARD_H).setInteractive({ useHandCursor: true });
      const nameText = this.add.text(x, cardY - CARD_H / 2 + 18, entry.name, {
        fontSize: '14px', color: '#4a2d18', fontStyle: 'bold',
        align: 'center', wordWrap: { width: CARD_W - 20 },
      }).setOrigin(0.5);
      const typeText = this.add.text(x, cardY - CARD_H / 2 + 44, entry.type || '遗物', {
        fontSize: '11px', color: '#8d6a3a', align: 'center',
      }).setOrigin(0.5);
      const descText = this.add.text(x, cardY - 8, entry.description || '', {
        fontSize: '12px', color: '#5a4024', align: 'center',
        wordWrap: { width: CARD_W - 20 }, lineSpacing: 4,
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
        this.sfx?.playReward();
        closeShop();
      });

      disposables.push(bg, nameText, typeText, descText, priceBox, priceText);
    });

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
}
