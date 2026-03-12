import { HERO_LIBRARY } from '../data/heroes';
import { MAP_ROUTE_LIBRARY } from '../data/mapNodes';
import { enableRuntimeUIEditor } from '../utils/RuntimeUIEditor';

export class HeroSelectScene extends Phaser.Scene {
  constructor() {
    super('HeroSelectScene');
  }

  create() {
    enableRuntimeUIEditor(this);
    this.sfx = this.registry.get('sfxManager');
    this.dataRegistry = this.registry.get('dataRegistry');
    this._selectedRouteId = MAP_ROUTE_LIBRARY[0]?.id || 'trial_route_alpha';

    const { width, height } = this.scale;
    this._selectedHero = null;

    this.add.rectangle(width / 2, height / 2, width, height, 0x120d0a, 1);
    this.add.circle(160, 120, 180, 0x7a552d, 0.14);
    this.add.circle(width - 180, 160, 200, 0x4b2a18, 0.14);
    this.add.image(width / 2, height / 2, 'ui_panel').setDisplaySize(width - 92, height - 92);
    this.add.image(width / 2, 68, 'ui_banner').setScale(0.9);
    this.add.image(width / 2, 44, 'ui_badge').setScale(0.56);

    this.add.text(width / 2, 68, '选择英雄', {
      fontSize: '30px', color: '#f4ead7', fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(width / 2, 108, '每位英雄拥有独特的初始卡组、生命值和遗物，选择适合你的道路。', {
      fontSize: '15px', color: '#f4ead7',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 138, '路线选择', {
      fontSize: '17px', color: '#f4ead7', fontStyle: 'bold',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);
    this._routeButtons = [];
    MAP_ROUTE_LIBRARY.forEach((route, index) => {
      const btn = this.add.image(width / 2 + (index - (MAP_ROUTE_LIBRARY.length - 1) / 2) * 220, 176, 'ui_panel').setDisplaySize(200, 42).setInteractive({ useHandCursor: true });
      const txt = this.add.text(btn.x, btn.y, route.name, {
        fontSize: '15px', color: '#ead5ad', fontStyle: 'bold',
        stroke: '#2a0e04', strokeThickness: 3,
      }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        this.sfx?.resume();
        this.sfx?.playNodeSelect();
        this._selectedRouteId = route.id;
        this._refreshRouteSelection();
      });
      this._routeButtons.push({ route, btn, txt });
    });

    this.add.image(width / 2, 226, 'ui_panel').setDisplaySize(760, 56).setAlpha(0.92);
    this._routeInfoTitle = this.add.text(width / 2, 214, '', {
      fontSize: '15px', color: '#f4ead7', fontStyle: 'bold',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);
    this._routeInfoBody = this.add.text(width / 2, 238, '', {
      fontSize: '12px', color: '#ead8b8', align: 'center',
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5);

    this._refreshRouteSelection();

    const cardW = 290;
    const cardH = 400;
    const gap = 36;
    const totalW = HERO_LIBRARY.length * cardW + (HERO_LIBRARY.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + cardW / 2;
    const cardY = height / 2 + 20;

    this._heroCards = [];

    HERO_LIBRARY.forEach((hero, i) => {
      const x = startX + i * (cardW + gap);
      this._buildHeroCard(hero, x, cardY, cardW, cardH);
    });

    this._confirmBtn = this.add.image(width / 2, height - 52, 'ui_panel').setDisplaySize(200, 48).setAlpha(0.4);
    this._confirmBtnText = this.add.text(width / 2, height - 52, '选择英雄', {
      fontSize: '20px', color: '#c8a050', fontStyle: 'bold',
      stroke: '#3a1a08', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 18, '返回', {
      fontSize: '14px', color: '#ead5ad',
      stroke: '#2a0e04', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.sfx?.resume();
        this.sfx?.playUiTap();
        this.scene.start('MenuScene');
      });
  }

  _buildHeroCard(hero, x, y, cardW, cardH) {
    const bg = this.add.image(x, y, 'ui_card_frame').setDisplaySize(cardW, cardH).setInteractive({ useHandCursor: true });

    const accentHex = Phaser.Display.Color.HexStringToColor(hero.accentColor.replace('#', '')).color;
    const topBar = this.add.rectangle(x, y - cardH / 2 + 26, cardW - 4, 52, hero.color, 0.85).setOrigin(0.5, 0.5);

    const nameText = this.add.text(x, y - cardH / 2 + 26, hero.name, {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold', align: 'center',
      stroke: '#2a0e04', strokeThickness: 4,
    }).setOrigin(0.5);

    const titleText = this.add.text(x, y - cardH / 2 + 52, `【${hero.title}】`, {
      fontSize: '13px', color: '#ffffff', align: 'center',
      stroke: '#2a0e04', strokeThickness: 3,
    }).setOrigin(0.5);

    const avatar = this.add.image(x, y - cardH / 2 + 116, hero.avatarKey).setDisplaySize(82, 82);
    const avatarCircle = this.add.graphics();
    avatarCircle.lineStyle(2, hero.color, 0.8);
    avatarCircle.strokeCircle(x, y - cardH / 2 + 116, 44);

    const hpText = this.add.text(x, y - cardH / 2 + 168, `生命 ${hero.maxHp}   灵石 ${hero.startGold}`, {
      fontSize: '13px', color: '#3a1a06', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);

    const descText = this.add.text(x, y - cardH / 2 + 206, hero.description, {
      fontSize: '12px', color: '#3a2008', align: 'center', wordWrap: { width: cardW - 32 }, lineSpacing: 4,
    }).setOrigin(0.5);

    const divider = this.add.rectangle(x, y - cardH / 2 + 252, cardW - 40, 1, hero.color, 0.4);

    const styleLabel = this.add.text(x, y - cardH / 2 + 268, `出牌风格：${hero.playstyle}`, {
      fontSize: '13px', color: '#3a1a06', fontStyle: 'bold', align: 'center',
      stroke: '#c8a050', strokeThickness: 2,
    }).setOrigin(0.5);

    hero.traits.forEach((trait, ti) => {
      this.add.text(x, y - cardH / 2 + 292 + ti * 24, `· ${trait}`, {
        fontSize: '12px', color: '#3a2008', align: 'center',
      }).setOrigin(0.5);
    });

    this._heroCards.push({ hero, bg, topBar, nameText });

    bg.on('pointerover', () => {
      if (this._selectedHero?.id !== hero.id) bg.setTint(0xffe8a0);
    });
    bg.on('pointerout', () => {
      if (this._selectedHero?.id !== hero.id) bg.clearTint();
    });
    bg.on('pointerdown', () => {
      this.sfx?.resume();
      this.sfx?.playNodeSelect();
      this._selectHero(hero);
    });
  }

  _selectHero(hero) {
    this._selectedHero = hero;

    this._heroCards.forEach(({ hero: h, bg }) => {
      if (h.id === hero.id) {
        bg.setTint(0xffd060);
        bg.setDisplaySize(bg.displayWidth, bg.displayHeight);
      } else {
        bg.clearTint();
        bg.setAlpha(0.7);
      }
    });

    const { width } = this.scale;
    this._confirmBtn.setAlpha(1).clearTint().setInteractive({ useHandCursor: true });
    this._confirmBtnText.setText(`出发！（${hero.name}）`).setColor('#f7ead0');

    this._confirmBtn.removeAllListeners('pointerdown');
    this._confirmBtn.on('pointerover', () => this._confirmBtn.setTint(0xffe0a0));
    this._confirmBtn.on('pointerout', () => this._confirmBtn.clearTint());
    this._confirmBtn.on('pointerdown', () => this._startWithHero(hero));
  }

  _refreshRouteSelection() {
    this._routeButtons?.forEach(({ route, btn, txt }) => {
      const active = route.id === this._selectedRouteId;
      if (active) {
        btn.setTint(0xffd060);
        txt.setColor('#fff2b2');
      } else {
        btn.clearTint();
        txt.setColor('#ead5ad');
      }
    });

    const route = MAP_ROUTE_LIBRARY.find(item => item.id === this._selectedRouteId);
    if (route) {
      const counts = route.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {});
      this._routeInfoTitle?.setText(`路线概览：${route.name}`);
      this._routeInfoBody?.setText(
        `战斗 ${counts.battle || 0} · 事件 ${counts.event || 0} · 商店 ${counts.shop || 0} · 休整 ${counts.rest || 0} · 精英 ${counts.elite || 0} · Boss ${counts.boss || 0}`
      );
    }
  }

  _startWithHero(hero) {
    this.sfx?.resume();
    this.sfx?.playVictory();

    const relics = this.dataRegistry.getRelicChoices
      ? hero.startRelics
      : ['bronze_mirror', 'spirit_ring'];

    const progress = {
      deckId: hero.deckId,
      maxHp: hero.maxHp,
      playerHp: hero.maxHp,
      gold: hero.startGold,
      relicIds: hero.startRelics,
      routeId: this._selectedRouteId,
      clearedNodes: [],
      bonusCards: [],
      removedCardIds: [],
      storySeen: [],
      currentStoryStep: null,
      heroId: hero.id,
    };

    this.scene.start('MapScene', { progress });
  }
}
