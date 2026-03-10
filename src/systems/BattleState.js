import { GAME_CONFIG } from '../config/gameConfig';

const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createStatusBag = () => ({
  weak: 0,
  vulnerable: 0,
  shielding: 0,
});

const buildEnemyDeck = (enemyData) => {
  const library = enemyData.deck && enemyData.deck.length > 0
    ? enemyData.deck.map((card, index) => ({
        id: `${enemyData.id}_card_${index}`,
        cost: 0,
        ...card,
      }))
    : (enemyData.intents || []).map((intent, index) => ({
        id: `${enemyData.id}_card_${index}`,
        name: intent.label,
        type: intent.type,
        value: intent.value,
        cost: 0,
        description: intent.type === 'attack' ? `造成 ${intent.value} 点伤害。` : `获得 ${intent.value} 点格挡。`,
      }));
  return [...library, ...library].map(card => ({ ...card }));
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class BattleState {
  constructor(registry, options) {
    this.registry = registry;
    this.mapProgress = options.mapProgress || null;
    this.currentNodeId = options.currentNodeId || null;
    this.rewardCount = options.rewardCount || 3;
    this.goldReward = options.goldReward || 0;
    this.isElite = options.isElite || false;
    this.isBoss = options.isBoss || false;
    const startingMaxHp = options.mapProgress?.maxHp || 50;
    const startingHp = options.mapProgress?.playerHp || startingMaxHp;
    this.player = {
      maxHp: startingMaxHp,
      hp: startingHp,
      block: 0,
      energy: GAME_CONFIG.BATTLE.baseEnergy,
      status: createStatusBag(),
    };
    const enemyData = registry.getEnemy(options.enemyId);
    this.enemy = {
      ...enemyData,
      hp: enemyData.maxHp,
      block: 0,
      cardsPerTurn: enemyData.cardsPerTurn || 2,
      status: createStatusBag(),
    };
    this.enemyDeck = shuffle(buildEnemyDeck(enemyData));
    this.enemyDrawPile = [...this.enemyDeck];
    this.enemyDiscardPile = [];
    this.enemyHand = [];
    this.currentEnemyCard = null;
    this.deck = shuffle(registry.buildRuntimeDeck(options.deckId, options.mapProgress?.bonusCards || []));
    this.drawPile = [...this.deck];
    this.discardPile = [];
    this.hand = [];
    this.relics = (options.relicIds || []).map(id => registry.getRelic(id)).filter(Boolean);
    this.turn = 1;
    this.log = [];
    this.rewardCards = [];
    this.applyBattleStartRelics();
    this.startTurn();
  }

  applyBattleStartRelics() {
    this.relics.forEach((relic) => {
      if (relic.onBattleStart?.block) {
        this.player.block += relic.onBattleStart.block;
      }
    });
  }

  startTurn() {
    this.player.block = 0;
    this.player.energy = GAME_CONFIG.BATTLE.baseEnergy;
    if (this.player.status.shielding > 0) {
      this.player.block += this.player.status.shielding;
      this.pushLog(`护体生效，获得 ${this.player.status.shielding} 点格挡。`);
    }
    this.relics.forEach((relic) => {
      if (relic.onTurnStart?.block) {
        this.player.block += relic.onTurnStart.block;
      }
    });
    this.draw(GAME_CONFIG.BATTLE.drawPerTurn);
    this.planEnemyTurn();
    this.pushLog(`第 ${this.turn} 回合开始。`);
  }

  draw(count) {
    for (let i = 0; i < count; i += 1) {
      if (this.hand.length >= GAME_CONFIG.BATTLE.playerMaxHand) return;
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) return;
        this.drawPile = shuffle(this.discardPile);
        this.discardPile = [];
      }
      const card = this.drawPile.shift();
      if (card) this.hand.push(card);
    }
  }

  getEnemyIntent() {
    return this.enemyHand[0] || this.currentEnemyCard;
  }

  getEnemyPreviewCards() {
    return [...this.enemyHand];
  }

  ensureEnemyDrawPile() {
    if (this.enemyDrawPile.length > 0) return;
    if (this.enemyDiscardPile.length === 0) return;
    this.enemyDrawPile = shuffle(this.enemyDiscardPile);
    this.enemyDiscardPile = [];
  }

  drawEnemyCardWithPreference(predicate) {
    this.ensureEnemyDrawPile();
    if (this.enemyDrawPile.length === 0) return null;
    const preferredIndex = this.enemyDrawPile.findIndex(predicate);
    const index = preferredIndex >= 0 ? preferredIndex : 0;
    const [card] = this.enemyDrawPile.splice(index, 1);
    return card || null;
  }

  isEnraged() {
    return this.enemy.hp / this.enemy.maxHp <= 0.45;
  }

  getEnemyCardsPerTurn() {
    const hpRatio = this.enemy.hp / this.enemy.maxHp;
    const enraged = this.isEnraged();
    if (this.enemy.id === 'jade_construct') {
      return hpRatio <= 0.55 ? 4 : 3;
    }
    if (this.enemy.id === 'scarlet_bat') {
      return hpRatio <= 0.6 ? 4 : 3;
    }
    if (this.enemy.id === 'ghost_monk') {
      return this.player.status.weak > 0 || this.player.status.vulnerable > 0 ? 3 : 2;
    }
    if (this.enemy.id === 'bandit_guard') {
      return this.turn % 3 === 0 ? 3 : 2;
    }
    return clamp((this.enemy.cardsPerTurn || 2) + (enraged ? 1 : 0), 1, 4);
  }

  pickEnemyCardPreference(slotIndex) {
    if (this.enemy.id === 'bandit_guard') {
      if (slotIndex === 0 && this.player.status.vulnerable === 0) return card => card.applyStatus?.id === 'vulnerable';
      if (slotIndex === 1 && this.enemy.block === 0) return card => card.block || card.type === 'block';
      return card => card.damage || card.value || card.type === 'attack';
    }
    if (this.enemy.id === 'ghost_monk') {
      if (this.player.status.weak === 0) return card => card.applyStatus?.id === 'weak';
      if (this.player.status.vulnerable === 0 && slotIndex > 0) return card => card.applyStatus?.id === 'vulnerable';
      return card => card.damage || card.type === 'skill';
    }
    if (this.enemy.id === 'jade_construct') {
      if (slotIndex === 0 && this.enemy.block < 6) return card => card.block || card.type === 'block';
      if (this.turn % 2 === 0) return card => card.name.includes('裂岩') || card.name.includes('镇山');
      return card => card.damage || card.value || card.type === 'attack';
    }
    if (this.enemy.id === 'scarlet_bat') {
      if (this.player.status.vulnerable === 0 && slotIndex === 0) return card => card.applyStatus?.id === 'vulnerable';
      return card => card.damage || card.value || card.type === 'attack';
    }
    return () => true;
  }

  planEnemyTurn() {
    this.enemyHand = [];
    const cardCount = this.getEnemyCardsPerTurn();
    for (let i = 0; i < cardCount; i += 1) {
      const predicate = this.pickEnemyCardPreference(i);
      const card = this.drawEnemyCardWithPreference(predicate);
      if (card) {
        this.enemyHand.push(card);
      }
    }
    this.currentEnemyCard = this.enemyHand[0] || null;
  }

  drawEnemyCard(count = 1) {
    for (let i = 0; i < count; i += 1) {
      if (this.enemyDrawPile.length === 0) {
        if (this.enemyDiscardPile.length === 0) return;
        this.enemyDrawPile = shuffle(this.enemyDiscardPile);
        this.enemyDiscardPile = [];
      }
      const card = this.enemyDrawPile.shift();
      if (card) {
        this.enemyHand.push(card);
      }
    }
    this.currentEnemyCard = this.enemyHand[0] || null;
  }

  getDamageAfterModifiers(baseDamage, source, target) {
    let damage = baseDamage;
    if (source.status.weak > 0) {
      damage = Math.floor(damage * 0.75);
    }
    if (target.status.vulnerable > 0) {
      damage = Math.floor(damage * 1.5);
    }
    return Math.max(0, damage);
  }

  dealDamage(source, target, amount, sourceName) {
    const modified = this.getDamageAfterModifiers(amount, source, target);
    const dealt = Math.max(0, modified - target.block);
    target.block = Math.max(0, target.block - modified);
    target.hp -= dealt;
    this.pushLog(`${sourceName} 造成 ${dealt} 点伤害。`);
  }

  applyStatus(target, statusId, stacks) {
    if (!target.status[statusId] && target.status[statusId] !== 0) return;
    target.status[statusId] += stacks;
    const status = this.registry.getStatusEffect(statusId);
    this.pushLog(`${target === this.player ? '玩家' : this.enemy.name} 获得 ${stacks} 层${status?.name || statusId}。`);
  }

  decayStatus(statusBag) {
    ['weak', 'vulnerable'].forEach((key) => {
      if (statusBag[key] > 0) statusBag[key] -= 1;
    });
  }

  playCard(handIndex) {
    const card = this.hand[handIndex];
    if (!card || card.cost > this.player.energy) return false;
    this.player.energy -= card.cost;
    if (card.damage) {
      this.dealDamage(this.player, this.enemy, card.damage, card.name);
    }
    if (card.block) {
      this.player.block += card.block;
      this.pushLog(`${card.name} 提供 ${card.block} 点格挡。`);
    }
    if (card.draw) {
      this.draw(card.draw);
      this.pushLog(`${card.name} 抽取 ${card.draw} 张牌。`);
    }
    if (card.applyStatus) {
      const target = card.applyStatus.target === 'self' ? this.player : this.enemy;
      this.applyStatus(target, card.applyStatus.id, card.applyStatus.stacks);
    }
    const [usedCard] = this.hand.splice(handIndex, 1);
    this.discardPile.push(usedCard);
    return true;
  }

  endPlayerTurn() {
    this.discardPile.push(...this.hand.splice(0, this.hand.length));
    const playedEnemyCards = this.enemyAct();
    this.decayStatus(this.player.status);
    this.decayStatus(this.enemy.status);
    if (this.enemy.hp <= 0 && this.rewardCards.length === 0) {
      this.rewardCards = this.registry.getRewardCardChoices(this.rewardCount, this.isElite || this.isBoss);
    }
    return playedEnemyCards;
  }

  startNextTurn() {
    if (this.enemy.hp > 0 && this.player.hp > 0) {
      this.turn += 1;
      this.startTurn();
    }
  }

  endTurn() {
    return this.endPlayerTurn();
  }

  enemyAct() {
    this.enemy.block = 0;
    const playedCards = [];
    while (this.enemyHand.length > 0) {
      const enemyCard = this.enemyHand.shift();
      if (!enemyCard) break;
      const damage = enemyCard.damage ?? (enemyCard.type === 'attack' ? enemyCard.value : 0);
      const block = enemyCard.block ?? (enemyCard.type === 'block' ? enemyCard.value : 0);
      if (damage > 0) {
        this.dealDamage(this.enemy, this.player, damage, `${this.enemy.name} 的 ${enemyCard.name}`);
      }
      if (block > 0) {
        this.enemy.block += block;
        this.pushLog(`${this.enemy.name} 使用 ${enemyCard.name}，获得 ${block} 点格挡。`);
      }
      if (enemyCard.applyStatus) {
        const target = enemyCard.applyStatus.target === 'self' ? this.enemy : this.player;
        this.applyStatus(target, enemyCard.applyStatus.id, enemyCard.applyStatus.stacks);
      }
      this.enemyDiscardPile.push(enemyCard);
      playedCards.push(enemyCard);
      if (this.player.hp <= 0 || this.enemy.hp <= 0) break;
    }
    this.currentEnemyCard = null;
    return playedCards;
  }

  isFinished() {
    return this.player.hp <= 0 || this.enemy.hp <= 0;
  }

  getResult() {
    if (this.player.hp <= 0) return 'lose';
    if (this.enemy.hp <= 0) return 'win';
    return null;
  }

  getSceneOutcome() {
    if (this.getResult() === 'win') {
      if (this.rewardCards.length === 0) {
        this.rewardCards = this.registry.getRewardCardChoices(this.rewardCount, this.isElite || this.isBoss);
      }
      const nextProgress = this.mapProgress
        ? {
            ...this.mapProgress,
            playerHp: Math.max(1, this.player.hp),
            maxHp: this.player.maxHp,
            gold: (this.mapProgress.gold || 0) + this.goldReward,
            clearedNodes: [...new Set([...(this.mapProgress.clearedNodes || []), this.currentNodeId])],
            bonusCards: [...(this.mapProgress.bonusCards || [])],
            storySeen: [...(this.mapProgress.storySeen || [])],
            currentStoryStep: this.mapProgress.currentStoryStep || null,
          }
        : null;
      return {
        type: 'reward',
        progress: nextProgress,
        rewardCards: this.rewardCards,
      };
    }
    if (this.getResult() === 'lose') {
      return { type: 'menu' };
    }
    return null;
  }

  pushLog(text) {
    this.log.unshift(text);
    if (this.log.length > 8) this.log.length = 8;
  }
}
