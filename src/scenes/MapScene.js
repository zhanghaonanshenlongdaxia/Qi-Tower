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
    this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(width - 92, height - 92);
    this.add.image(width / 2, 96, 'ui_banner').setScale(0.96);
    this.add.image(width / 2, 70, 'ui_badge').setScale(0.64);

    this.add.text(width / 2, 96, '试炼地图', {
      fontSize: '31px',
      color: '#f4ead7',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 164, `路线：${this.route.name}    当前生命：${this.progress.playerHp || 50}/${this.progress.maxHp || 50}    灵石：${this.progress.gold || 0}    已得奖励卡：${(this.progress.bonusCards || []).length} 张`, {
      fontSize: '18px',
      color: '#ead5ad',
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
      this.resolveRandomEvent(node, nextProgress);
      return;
    }

    if (node.type === 'shop') {
      this.showShopPanel(node, nextProgress);
    }
  }

  resolveRandomEvent(node, nextProgress) {
    const outcomes = node.eventPool || ['healer'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    if (result === 'healer') {
      nextProgress.playerHp = Math.min(nextProgress.maxHp, nextProgress.playerHp + 8);
      this.showResolutionPanel('古松奇遇', '你遇见松下隐修者，静修片刻后恢复了 8 点生命。', nextProgress);
      return;
    }
    if (result === 'merchant_cache') {
      nextProgress.gold += 40;
      this.showResolutionPanel('遗落货箱', '你在石阶旁发现一只遗落货箱，获得 40 灵石。', nextProgress);
      return;
    }
    nextProgress.playerHp = Math.max(1, nextProgress.playerHp - 6);
    nextProgress.bonusCards.push('quick_slash');
    this.showResolutionPanel('蝠妖突袭', '你被蝠妖突袭，失去 6 点生命，但在混乱中悟得 1 张疾风斩。', nextProgress);
  }

  showShopPanel(node, nextProgress) {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x140d09, 0.76).setInteractive();
    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(760, 320);
    const heading = this.add.text(width / 2, height / 2 - 116, '山门小市', {
      fontSize: '32px',
      color: '#f4ead7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const goldText = this.add.text(width / 2, height / 2 - 82, `当前灵石：${nextProgress.gold}`, {
      fontSize: '18px',
      color: '#ead5ad',
    }).setOrigin(0.5);

    const cardChoices = this.dataRegistry.getShopCardChoices(3);
    const relicChoices = this.dataRegistry.getRelicChoices(1, nextProgress.relicIds);
    const entries = [...cardChoices, ...relicChoices];
    const disposables = [overlay, panel, heading, goldText];

    const closeShop = () => {
      disposables.forEach(item => item.destroy());
      this.scene.start('MapScene', { progress: nextProgress });
    };

    entries.forEach((entry, index) => {
      const x = 180 + index * 170;
      const y = height / 2 + 12;
      const button = this.rexUI.add.label({
        x,
        y,
        width: 150,
        height: 180,
        orientation: 1,
        background: this.add.image(0, 0, 'ui_card_frame').setDisplaySize(150, 180),
        text: this.add.text(0, 0, `${entry.name}\n\n${entry.description || entry.type}\n\n价格 ${entry.price}`, {
          fontSize: '16px',
          color: '#4a2d18',
          align: 'center',
          wordWrap: { width: 118 },
          lineSpacing: 6,
        }),
        align: 'center',
        space: { top: 12, bottom: 12, left: 12, right: 12 },
      }).layout();
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        if (nextProgress.gold < entry.price) {
          this.sfx?.playDefeat();
          return;
        }
        nextProgress.gold -= entry.price;
        if (entry.type) {
          nextProgress.bonusCards.push(entry.id);
        } else {
          nextProgress.relicIds.push(entry.id);
        }
        this.sfx?.playReward();
        closeShop();
      });
      disposables.push(button);
    });

    const leaveButton = this.rexUI.add.label({
      x: width / 2,
      y: height / 2 + 124,
      width: 180,
      height: 44,
      background: this.add.rectangle(0, 0, 180, 44, 0x6d4621, 1).setStrokeStyle(1, 0xf1d59c, 0.42),
      text: this.add.text(0, 0, '离开商店', {
        fontSize: '20px',
        color: '#f7ead0',
        fontStyle: 'bold',
      }),
      align: 'center',
    }).layout();
    leaveButton.setInteractive({ useHandCursor: true });
    leaveButton.on('pointerdown', closeShop);
    disposables.push(leaveButton);
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
