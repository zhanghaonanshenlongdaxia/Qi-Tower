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
  poison: 0,
  burn: 0,
  strength: 0,
  dexterity: 0,
  regenerate: 0,
  focus: 0,
  sealed: 0,
  stun: 0,
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
    this.enemyId = options.enemyId || null;
    const startingMaxHp = options.mapProgress?.maxHp || 50;
    const startingHp = options.mapProgress?.playerHp || startingMaxHp;
    this.player = {
      maxHp: startingMaxHp,
      hp: startingHp,
      block: 0,
      energy: GAME_CONFIG.BATTLE.baseEnergy,
      strength: options.mapProgress?.nextBattleBuffs?.strength || 0,
      dexterity: options.mapProgress?.nextBattleBuffs?.dexterity || 0,
      status: createStatusBag(),
    };
    const enemyData = registry.getEnemy(options.enemyId);
    this.enemy = {
      ...enemyData,
      hp: enemyData.maxHp,
      block: 0,
      cardsPerTurn: enemyData.cardsPerTurn || 2,
      bonusLabel: options.mapProgress?.nextBattleModifiers?.label || null,
      status: createStatusBag(),
    };
    if (options.mapProgress?.nextBattleModifiers?.enemyBonusHpPercent) {
      const hpMultiplier = 1 + options.mapProgress.nextBattleModifiers.enemyBonusHpPercent;
      this.enemy.maxHp = Math.ceil(this.enemy.maxHp * hpMultiplier);
      this.enemy.hp = this.enemy.maxHp;
    }
    if (options.mapProgress?.nextBattleModifiers?.enemyExtraCards) {
      this.enemy.cardsPerTurn += options.mapProgress.nextBattleModifiers.enemyExtraCards;
    }
    this.enemyDeck = shuffle(buildEnemyDeck(enemyData));
    this.enemyDrawPile = [...this.enemyDeck];
    this.enemyDiscardPile = [];
    this.enemyHand = [];
    this.enemyUsedOnceCards = new Set();
    this.currentEnemyCard = null;
    this.deck = shuffle(registry.buildRuntimeDeck(
      options.deckId,
      options.mapProgress?.bonusCards || [],
      options.mapProgress?.removedCardIds || [],
    ));
    this.drawPile = [...this.deck];
    this.discardPile = [];
    this.hand = [];
    this.relics = (options.relicIds || []).map(id => registry.getRelic(id)).filter(Boolean);
    this.turn = 1;
    this.log = [];
    this.rewardCards = [];
    this.rewardRelics = [];
    this.applyBattleStartRelics();
    this.startTurn();
  }

  applyBattleStartRelics() {
    if (this.player.strength > 0) {
      this.pushLog(`战前感悟生效，获得 ${this.player.strength} 点力量。`);
    }
    if (this.player.dexterity > 0) {
      this.pushLog(`战前感悟生效，获得 ${this.player.dexterity} 点敏捷。`);
    }
    if (this.enemy.bonusLabel) {
      this.pushLog(`敌人受到【${this.enemy.bonusLabel}】影响，战力显著提升。`);
    }
    this.relics.forEach((relic) => {
      if (relic.onBattleStart?.block) {
        this.player.block += relic.onBattleStart.block;
      }
    });
  }

  startTurn() {
    if (this.player.status.stun > 0) {
      this.player.status.stun = Math.max(0, this.player.status.stun - 1);
      this.player.block = 0;
      this.player.energy = 0;
      this.planEnemyTurn();
      this.pushLog(`第 ${this.turn} 回合开始，但玩家因眩晕跳过本回合。`);
      return;
    }
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
    const canUseCard = card => !(card.oncePerBattle && this.enemyUsedOnceCards.has(card.id));
    const preferredIndex = this.enemyDrawPile.findIndex(card => canUseCard(card) && predicate(card));
    const fallbackIndex = this.enemyDrawPile.findIndex(canUseCard);
    const index = preferredIndex >= 0 ? preferredIndex : (fallbackIndex >= 0 ? fallbackIndex : 0);
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
    if (this.enemy.id === 'death_knight') {
      if (this.enemy.hp / this.enemy.maxHp <= 0.55) return card => card.lifesteal || card.block || card.type === 'block';
      return card => card.damage || card.value || card.type === 'attack';
    }
    if (this.enemy.id === 'demon_lord') {
      if (this.enemy.status.strength === 0 && this.enemy.hp > 10) return card => card.cost?.hp || card.applyStatus?.target === 'self';
      return card => card.damage || card.value || card.type === 'attack';
    }
    if (this.enemy.id === 'heaven_emperor') {
      if (this.enemy.hp / this.enemy.maxHp <= 0.4) return card => card.heal || card.block || card.type === 'block';
      if (this.enemy.status.strength === 0) return card => card.applyStatus?.id === 'strength';
      if (this.enemy.status.focus === 0) return card => card.applyStatus?.id === 'focus';
      return card => card.damage || card.value || card.type === 'attack';
    }
    if (this.enemy.id === 'echo_duelist') {
      if (slotIndex === 0 && (this.player.status.weak === 0 || this.player.status.vulnerable === 0)) {
        return card => Array.isArray(card.applyStatuses) && card.applyStatuses.some(entry => entry.id === 'weak' || entry.id === 'vulnerable');
      }
      if (this.enemy.block === 0 && slotIndex > 0) return card => card.block || card.type === 'block';
      if (this.enemy.status.strength === 0) return card => card.applyStatus?.id === 'strength';
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
    if (source === this.player && this.player.strength > 0) {
      damage += this.player.strength;
    }
    if (source?.status?.strength > 0) {
      damage += source.status.strength * (3 + (source.status.focus || 0));
    }
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
    return dealt;
  }

  applyStatus(target, statusId, stacks) {
    if (!target.status[statusId] && target.status[statusId] !== 0) return;
    target.status[statusId] += stacks;
    const status = this.registry.getStatusEffect(statusId);
    this.pushLog(`${target === this.player ? '玩家' : this.enemy.name} 获得 ${stacks} 层${status?.name || statusId}。`);
  }

  applyStatuses(entries = []) {
    entries.forEach((entry) => {
      const target = entry.target === 'self' ? this.enemy : this.player;
      this.applyStatus(target, entry.id, entry.stacks);
    });
  }

  decayStatus(statusBag) {
    ['weak', 'vulnerable', 'sealed'].forEach((key) => {
      if (statusBag[key] > 0) statusBag[key] -= 1;
    });
  }

  resolveEndOfTurnStatus(target, targetName) {
    if (target.status.poison > 0) {
      const poisonDamage = target.status.poison * 3;
      target.hp -= poisonDamage;
      this.pushLog(`${targetName} 受到 ${poisonDamage} 点中毒伤害。`);
    }
    if (target.status.burn > 0) {
      const burnDamage = target.status.burn * 2;
      target.hp -= burnDamage;
      this.pushLog(`${targetName} 受到 ${burnDamage} 点燃烧伤害。`);
    }
    if (target.status.regenerate > 0 && target.hp > 0) {
      const healAmount = target.status.regenerate * 2;
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      this.pushLog(`${targetName} 因再生恢复 ${healAmount} 点生命。`);
    }
  }

  playCard(handIndex) {
    const card = this.hand[handIndex];
    if (!card || card.cost > this.player.energy || this.player.status.sealed > 0) return false;
    this.player.energy -= card.cost;
    if (card.damage) {
      this.dealDamage(this.player, this.enemy, card.damage, card.name);
    }
    if (card.block) {
      const blockAmount = card.block + (this.player.dexterity || 0) + (this.player.status.dexterity || 0) * (2 + (this.player.status.focus || 0));
      this.player.block += blockAmount;
      this.pushLog(`${card.name} 提供 ${blockAmount} 点格挡。`);
    }
    if (card.draw) {
      this.draw(card.draw);
      this.pushLog(`${card.name} 抽取 ${card.draw} 张牌。`);
    }
    if (card.applyStatus) {
      const target = card.applyStatus.target === 'self' ? this.player : this.enemy;
      this.applyStatus(target, card.applyStatus.id, card.applyStatus.stacks);
    }
    if (Array.isArray(card.applyStatuses)) {
      card.applyStatuses.forEach((entry) => {
        const target = entry.target === 'self' ? this.player : this.enemy;
        this.applyStatus(target, entry.id, entry.stacks);
      });
    }
    const [usedCard] = this.hand.splice(handIndex, 1);
    this.discardPile.push(usedCard);
    return true;
  }

  endPlayerTurn() {
    this.discardPile.push(...this.hand.splice(0, this.hand.length));
    const playedEnemyCards = this.enemyAct();
    this.resolveEndOfTurnStatus(this.player, '玩家');
    this.resolveEndOfTurnStatus(this.enemy, this.enemy.name);
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
        const dealt = this.dealDamage(this.enemy, this.player, damage, `${this.enemy.name} 的 ${enemyCard.name}`);
        if (enemyCard.lifesteal && dealt > 0) {
          this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + dealt);
          this.pushLog(`${this.enemy.name} 吸取了 ${dealt} 点生命。`);
        }
      }
      if (block > 0) {
        this.enemy.block += block;
        this.pushLog(`${this.enemy.name} 使用 ${enemyCard.name}，获得 ${block} 点格挡。`);
      }
      if (enemyCard.applyStatus) {
        const target = enemyCard.applyStatus.target === 'self' ? this.enemy : this.player;
        this.applyStatus(target, enemyCard.applyStatus.id, enemyCard.applyStatus.stacks);
      }
      if (Array.isArray(enemyCard.applyStatuses)) {
        enemyCard.applyStatuses.forEach((entry) => {
          const target = entry.target === 'self' ? this.enemy : this.player;
          this.applyStatus(target, entry.id, entry.stacks);
        });
      }
      if (enemyCard.cost?.hp) {
        this.enemy.hp = Math.max(1, this.enemy.hp - enemyCard.cost.hp);
        this.pushLog(`${this.enemy.name} 为发动 ${enemyCard.name} 失去 ${enemyCard.cost.hp} 点生命。`);
      }
      if (enemyCard.heal) {
        const healAmount = enemyCard.heal <= 1 ? Math.ceil(this.enemy.maxHp * enemyCard.heal) : enemyCard.heal;
        this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + healAmount);
        this.pushLog(`${this.enemy.name} 因 ${enemyCard.name} 恢复 ${healAmount} 点生命。`);
      }
      if (enemyCard.oncePerBattle) {
        this.enemyUsedOnceCards.add(enemyCard.id);
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
      if (this.rewardRelics.length === 0 && (this.isElite || this.isBoss)) {
        const ownedRelicIds = this.mapProgress?.relicIds || [];
        this.rewardRelics = this.registry.getRelicChoices(this.isBoss ? 2 : 1, ownedRelicIds);
      }
      const nextProgress = this.mapProgress
        ? {
            ...this.mapProgress,
            playerHp: Math.max(1, this.player.hp),
            maxHp: this.player.maxHp,
            gold: (this.mapProgress.gold || 0) + this.goldReward,
            clearedNodes: [...new Set([...(this.mapProgress.clearedNodes || []), this.currentNodeId])],
            bonusCards: [...(this.mapProgress.bonusCards || [])],
            nextBattleBuffs: {},
            nextBattleModifiers: {},
            storySeen: [...(this.mapProgress.storySeen || [])],
            currentStoryStep: this.mapProgress.currentStoryStep || null,
          }
        : null;
      return {
        type: 'reward',
        progress: nextProgress,
        rewardCards: this.rewardCards,
        rewardRelics: this.rewardRelics,
        rewardSummary: {
          goldReward: this.goldReward,
          relicCount: this.rewardRelics.length,
          isElite: this.isElite,
          isBoss: this.isBoss,
        },
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
