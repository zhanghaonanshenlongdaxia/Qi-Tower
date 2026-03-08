import { CARD_LIBRARY } from '../data/cards';
import { ENEMY_LIBRARY } from '../data/enemies';
import { STARTER_DECKS } from '../data/starterDecks';
import { RELIC_LIBRARY } from '../data/relics';
import { StatusEffects } from '../data/statusEffects';
import { MAP_ROUTE_LIBRARY } from '../data/mapNodes';

const STATUS_EFFECT_LIBRARY = Object.values(StatusEffects);

export class DataRegistry {
  constructor() {
    this.cards = new Map(CARD_LIBRARY.map(card => [card.id, { ...card }]));
    this.enemies = new Map(ENEMY_LIBRARY.map(enemy => [enemy.id, { ...enemy }]));
    this.decks = new Map(STARTER_DECKS.map(deck => [deck.id, { ...deck, cards: [...deck.cards] }]));
    this.relics = new Map(RELIC_LIBRARY.map(relic => [relic.id, { ...relic }]));
    this.statusEffects = new Map(STATUS_EFFECT_LIBRARY.map(status => [status.id, { ...status }]));
    this.mapRoutes = new Map(MAP_ROUTE_LIBRARY.map(route => [route.id, { ...route, nodes: route.nodes.map(node => ({ ...node })) }]));
  }

  getCard(id) {
    const card = this.cards.get(id);
    return card ? { ...card } : null;
  }

  getEnemy(id) {
    const enemy = this.enemies.get(id);
    return enemy ? { ...enemy, intents: enemy.intents.map(intent => ({ ...intent })) } : null;
  }

  getDeck(id) {
    const deck = this.decks.get(id);
    return deck ? { ...deck, cards: [...deck.cards] } : null;
  }

  getRelic(id) {
    const relic = this.relics.get(id);
    return relic ? { ...relic } : null;
  }

  getStatusEffect(id) {
    const status = this.statusEffects.get(id);
    return status ? { ...status } : null;
  }

  getMapRoute(id) {
    const route = this.mapRoutes.get(id);
    return route ? { ...route, nodes: route.nodes.map(node => ({ ...node })) } : null;
  }

  buildDeckCards(deckId) {
    const deck = this.getDeck(deckId);
    if (!deck) return [];
    return deck.cards.map(cardId => this.getCard(cardId)).filter(Boolean);
  }

  buildRuntimeDeck(deckId, bonusCards = []) {
    const baseCards = this.buildDeckCards(deckId);
    const extraCards = bonusCards.map(cardId => this.getCard(cardId)).filter(Boolean);
    return [...baseCards, ...extraCards];
  }

  getRewardCardChoices(count = 3, guaranteeRare = false) {
    const pool = CARD_LIBRARY.filter(card => card.rarity !== 'starter');
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    if (guaranteeRare) {
      const rarePool = pool.filter(card => card.rarity === 'rare');
      const nonRarePool = pool.filter(card => card.rarity !== 'rare');
      const rareCard = rarePool.length > 0
        ? { ...rarePool[Math.floor(Math.random() * rarePool.length)] }
        : null;
      const fillers = nonRarePool.sort(() => Math.random() - 0.5).slice(0, count - (rareCard ? 1 : 0)).map(c => ({ ...c }));
      const result = rareCard ? [rareCard, ...fillers] : fillers;
      return result.slice(0, count);
    }
    return shuffled.slice(0, count).map(card => ({ ...card }));
  }

  getShopCardChoices(count = 3) {
    const pool = CARD_LIBRARY.filter(card => card.rarity !== 'starter');
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(card => ({
      ...card,
      price: card.rarity === 'rare' ? 80 : card.rarity === 'uncommon' ? 55 : 35,
    }));
  }

  getRelicChoices(count = 2, ownedRelicIds = []) {
    const owned = new Set(ownedRelicIds);
    const pool = RELIC_LIBRARY.filter(relic => !owned.has(relic.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(relic => ({
      ...relic,
      price: 90,
    }));
  }
}
