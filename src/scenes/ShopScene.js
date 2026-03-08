/**
 * 商店场景 - Shop Scene
 * 玩家可以在这里购买卡牌、遗物、服务
 */

import Phaser from 'phaser';
import { getGameState } from '../systems/GameState.js';
import { getRandomRelic, getRelicById } from '../data/relics.js';
import { getAllCards, getCardByName } from '../data/cards.js';

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }
  
  init(data) {
    this.gameState = getGameState();
    this.data = data || {};
    
    // 商店商品
    this.cardsForSale = [];
    this.relicsForSale = [];
    this.services = [
      { id: 'heal', name: '治疗', description: '恢复 50% 生命', basePrice: 50, icon: '💚' },
      { id: 'remove', name: '移除卡牌', description: '从卡组中移除一张牌', basePrice: 60, icon: '🗑️' },
      { id: 'upgrade', name: '锻造', description: '升级一张卡牌', basePrice: 80, icon: '🔨' }
    ];
    
    // 价格折扣（遗物影响）
    this.discount = 1;
    if (this.gameState.hasRelic('ancient_coin')) {
      this.discount = 0.8; // 20% 折扣
    }
  }
  
  create() {
    const { width, height } = this.scale;
    
    // 生成商品
    this.generateShopItems();
    
    // 背景
    this.add.rectangle(0, 0, width, height, 0x2d1b0e)
      .setOrigin(0);
    
    // 标题
    this.add.text(width / 2, 40, '🏪 商店', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 金币显示
    this.goldText = this.add.text(width - 30, 30, `💰 ${this.gameState.player.gold}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(1, 0);
    
    // 创建商品区域
    this.createCardSection(width / 2, 120);
    this.createRelicSection(width / 2, 320);
    this.createServiceSection(width / 2, 520);
    
    // 离开按钮
    this.createLeaveButton(width / 2, height - 60);
    
    // 提示信息
    this.hintText = this.add.text(width / 2, height - 100, '点击商品购买，点击离开继续旅程', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }
  
  /**
   * 生成商店商品
   */
  generateShopItems() {
    // 生成 3 张卡牌
    const allCards = getAllCards();
    for (let i = 0; i < 3; i++) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
      const price = this.getCardPrice(randomCard.rarity);
      this.cardsForSale.push({
        ...randomCard,
        price: Math.floor(price * this.discount)
      });
    }
    
    // 生成 2 个遗物
    for (let i = 0; i < 2; i++) {
      const relic = getRandomRelic('common');
      if (relic && !this.gameState.hasRelic(relic.id)) {
        const price = this.getRelicPrice(relic.tier);
        this.relicsForSale.push({
          ...relic,
          price: Math.floor(price * this.discount)
        });
      }
    }
  }
  
  /**
   * 获取卡牌价格
   */
  getCardPrice(rarity) {
    const prices = {
      basic: 40,
      common: 60,
      uncommon: 100,
      rare: 150
    };
    return prices[rarity] || 60;
  }
  
  /**
   * 获取遗物价格
   */
  getRelicPrice(tier) {
    const prices = {
      common: 80,
      uncommon: 120,
      boss: 200,
      shop: 100,
      cursed: 50
    };
    return prices[tier] || 80;
  }
  
  /**
   * 创建卡牌区域
   */
  createCardSection(x, y) {
    const { width } = this.scale;
    
    // 区域标题
    this.add.text(x, y - 30, '卡牌', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 卡牌容器
    const cardWidth = 140;
    const cardHeight = 190;
    const spacing = 20;
    const totalWidth = this.cardsForSale.length * (cardWidth + spacing) - spacing;
    const startX = x - totalWidth / 2;
    
    this.cardsForSale.forEach((card, index) => {
      const cardX = startX + index * (cardWidth + spacing);
      this.createCardItem(cardX, y, card, index);
    });
  }
  
  /**
   * 创建卡牌商品
   */
  createCardItem(x, y, card, index) {
    const container = this.add.container(x, y);
    
    // 卡牌背景
    const bg = this.add.rectangle(0, 0, 140, 190, 0x1a1a2e)
      .setStrokeStyle(2, 0x444466);
    
    // 卡牌名称
    const nameText = this.add.text(0, -60, card.name, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      wordWrap: { width: 120 }
    }).setOrigin(0.5);
    
    // 卡牌描述
    const descText = this.add.text(0, -20, card.description || '', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      wordWrap: { width: 120 }
    }).setOrigin(0.5);
    
    // 价格
    const priceText = this.add.text(0, 40, `💰 ${card.price}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 购买按钮
    const buyButton = this.add.text(0, 75, '购买', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#1a4a1a',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    buyButton.on('pointerover', () => {
      buyButton.setStyle({ backgroundColor: '#2a6a2a' });
    });
    
    buyButton.on('pointerout', () => {
      buyButton.setStyle({ backgroundColor: '#1a4a1a' });
    });
    
    buyButton.on('pointerdown', () => {
      this.buyCard(card, index);
    });
    
    container.add([bg, nameText, descText, priceText, buyButton]);
  }
  
  /**
   * 创建遗物区域
   */
  createRelicSection(x, y) {
    // 区域标题
    this.add.text(x, y - 30, '遗物', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const relicWidth = 160;
    const spacing = 30;
    const totalWidth = this.relicsForSale.length * (relicWidth + spacing) - spacing;
    const startX = x - totalWidth / 2;
    
    this.relicsForSale.forEach((relic, index) => {
      const relicX = startX + index * (relicWidth + spacing);
      this.createRelicItem(relicX, y, relic, index);
    });
  }
  
  /**
   * 创建遗物商品
   */
  createRelicItem(x, y, relic, index) {
    const container = this.add.container(x, y);
    
    // 遗物背景
    const bg = this.add.rectangle(0, 0, 160, 100, 0x2d1b0e)
      .setStrokeStyle(2, 0x8b7355);
    
    // 遗物图标
    const iconText = this.add.text(0, -25, relic.icon || '📦', {
      fontSize: '40px'
    }).setOrigin(0.5);
    
    // 遗物名称
    const nameText = this.add.text(0, 10, relic.name, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffd700',
      wordWrap: { width: 140 }
    }).setOrigin(0.5);
    
    // 遗物描述
    const descText = this.add.text(0, 30, relic.description, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      wordWrap: { width: 140 }
    }).setOrigin(0.5);
    
    // 价格
    const priceText = this.add.text(0, 60, `💰 ${relic.price}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 购买按钮
    const buyButton = this.add.text(0, 85, '购买', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#1a4a1a',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    buyButton.on('pointerover', () => {
      buyButton.setStyle({ backgroundColor: '#2a6a2a' });
    });
    
    buyButton.on('pointerout', () => {
      buyButton.setStyle({ backgroundColor: '#1a4a1a' });
    });
    
    buyButton.on('pointerdown', () => {
      this.buyRelic(relic, index);
    });
    
    container.add([bg, iconText, nameText, descText, priceText, buyButton]);
  }
  
  /**
   * 创建服务区域
   */
  createServiceSection(x, y) {
    // 区域标题
    this.add.text(x, y - 30, '服务', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const serviceWidth = 180;
    const spacing = 30;
    const totalWidth = this.services.length * (serviceWidth + spacing) - spacing;
    const startX = x - totalWidth / 2;
    
    this.services.forEach((service, index) => {
      const serviceX = startX + index * (serviceWidth + spacing);
      this.createServiceItem(serviceX, y, service, index);
    });
  }
  
  /**
   * 创建服务项目
   */
  createServiceItem(x, y, service, index) {
    const container = this.add.container(x, y);
    
    // 服务背景
    const bg = this.add.rectangle(0, 0, 180, 100, 0x1a2e3a)
      .setStrokeStyle(2, 0x446688);
    
    // 服务图标
    const iconText = this.add.text(0, -30, service.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);
    
    // 服务名称
    const nameText = this.add.text(0, 0, service.name, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#87ceeb'
    }).setOrigin(0.5);
    
    // 服务描述
    const descText = this.add.text(0, 25, service.description, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      wordWrap: { width: 160 }
    }).setOrigin(0.5);
    
    // 价格
    const priceText = this.add.text(0, 55, `💰 ${service.basePrice}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // 购买按钮
    const buyButton = this.add.text(0, 80, '使用', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#1a4a1a',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    buyButton.on('pointerover', () => {
      buyButton.setStyle({ backgroundColor: '#2a6a2a' });
    });
    
    buyButton.on('pointerout', () => {
      buyButton.setStyle({ backgroundColor: '#1a4a1a' });
    });
    
    buyButton.on('pointerdown', () => {
      this.buyService(service, index);
    });
    
    container.add([bg, iconText, nameText, descText, priceText, buyButton]);
  }
  
  /**
   * 创建离开按钮
   */
  createLeaveButton(x, y) {
    const leaveButton = this.add.text(x, y, '🚪 离开商店', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#4a2a1a',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    leaveButton.on('pointerover', () => {
      leaveButton.setStyle({ backgroundColor: '#6a3a2a' });
    });
    
    leaveButton.on('pointerout', () => {
      leaveButton.setStyle({ backgroundColor: '#4a2a1a' });
    });
    
    leaveButton.on('pointerdown', () => {
      this.leaveShop();
    });
  }
  
  /**
   * 购买卡牌
   */
  buyCard(card, index) {
    if (this.gameState.player.gold < card.price) {
      this.showHint('💸 金币不足！', 0xff4444);
      return;
    }
    
    // 扣除金币
    this.gameState.spendGold(card.price);
    
    // 添加卡牌到卡组
    this.gameState.player.deck.push(card.name);
    
    // 更新显示
    this.goldText.setText(`💰 ${this.gameState.player.gold}`);
    
    // 移除商品
    this.cardsForSale.splice(index, 1);
    
    // 重新渲染卡牌区域
    const { width } = this.scale;
    this.createCardSection(width / 2, 120);
    
    this.showHint(`✅ 购买了 ${card.name}！`, 0x44ff44);
  }
  
  /**
   * 购买遗物
   */
  buyRelic(relic, index) {
    if (this.gameState.player.gold < relic.price) {
      this.showHint('💸 金币不足！', 0xff4444);
      return;
    }
    
    // 扣除金币
    this.gameState.spendGold(relic.price);
    
    // 添加遗物
    this.gameState.addRelic(relic.id);
    
    // 更新显示
    this.goldText.setText(`💰 ${this.gameState.player.gold}`);
    
    // 移除商品
    this.relicsForSale.splice(index, 1);
    
    // 重新渲染遗物区域
    const { width } = this.scale;
    this.createRelicSection(width / 2, 320);
    
    this.showHint(`✅ 获得了 ${relic.name}！`, 0x44ff44);
  }
  
  /**
   * 购买服务
   */
  buyService(service, index) {
    if (this.gameState.player.gold < service.basePrice) {
      this.showHint('💸 金币不足！', 0xff4444);
      return;
    }
    
    switch (service.id) {
      case 'heal':
        this.buyHeal(service);
        break;
      case 'remove':
        this.buyRemove(service);
        break;
      case 'upgrade':
        this.buyUpgrade(service);
        break;
    }
  }
  
  /**
   * 购买治疗
   */
  buyHeal(service) {
    const currentHp = this.gameState.player.hp;
    const maxHp = this.gameState.player.maxHp;
    
    if (currentHp >= maxHp) {
      this.showHint('❤️ 生命已满！', 0xffaa00);
      return;
    }
    
    if (this.gameState.spendGold(service.basePrice)) {
      const healAmount = Math.floor(maxHp * 0.5);
      this.gameState.heal(healAmount);
      this.goldText.setText(`💰 ${this.gameState.player.gold}`);
      this.showHint(`✅ 恢复了 ${this.gameState.player.hp - currentHp} 点生命！`, 0x44ff44);
    }
  }
  
  /**
   * 购买移除卡牌服务
   */
  buyRemove(service) {
    // TODO: 打开卡牌选择界面
    this.showHint('🔧 功能开发中...', 0xffaa00);
  }
  
  /**
   * 购买升级服务
   */
  buyUpgrade(service) {
    // TODO: 打开卡牌选择界面
    this.showHint('🔧 功能开发中...', 0xffaa00);
  }
  
  /**
   * 显示提示信息
   */
  showHint(text, color = 0xaaaaaa) {
    this.hintText.setText(text);
    this.hintText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    
    // 2 秒后恢复默认提示
    this.time.delayedCall(2000, () => {
      this.hintText.setText('点击商品购买，点击离开继续旅程');
      this.hintText.setColor('#aaaaaa');
    });
  }
  
  /**
   * 离开商店
   */
  leaveShop() {
    // 保存游戏
    this.gameState.save(0);
    
    // 返回地图
    this.scene.start('MapScene', {
      fromShop: true
    });
  }
}
