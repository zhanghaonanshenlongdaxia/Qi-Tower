export const ENEMY_LIBRARY = [
  {
    id: 'bandit_guard',
    name: '山匪护卫',
    maxHp: 42,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 7, label: '劈砍 7' },
      { type: 'attack', value: 10, label: '重击 10' },
      { type: 'block', value: 6, label: '防守 6' },
    ],
    deck: [
      { name: '快斩', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '压步重劈', type: 'attack', value: 8, description: '造成 8 点伤害。' },
      { name: '持盾防守', type: 'block', value: 5, description: '获得 5 点格挡。' },
      { name: '盾袭', type: 'skill', damage: 4, block: 4, description: '造成 4 点伤害并获得 4 点格挡。' },
      { name: '恫吓', type: 'skill', description: '令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
    ],
  },
  {
    id: 'ghost_monk',
    name: '残魂僧',
    maxHp: 36,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 6, label: '阴掌 6' },
      { type: 'attack', value: 8, label: '魂火 8' },
      { type: 'block', value: 5, label: '结界 5' },
    ],
    deck: [
      { name: '阴掌', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '魂火侵体', type: 'attack', value: 5, description: '造成 5 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '残魂结界', type: 'block', value: 5, description: '获得 5 点格挡。' },
      { name: '幽火护身', type: 'skill', block: 4, applyStatus: { target: 'player', id: 'weak', stacks: 1 }, description: '获得 4 点格挡，并令玩家获得 1 层虚弱。' },
      { name: '夺魄', type: 'skill', description: '令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
    ],
  },
  {
    id: 'jade_construct',
    name: '玉傀守卫',
    maxHp: 58,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 10, label: '镇山击 10' },
      { type: 'block', value: 9, label: '玉甲护身 9' },
      { type: 'attack', value: 14, label: '裂岩重锤 14' },
    ],
    deck: [
      { name: '镇山击', type: 'attack', value: 9, description: '造成 9 点伤害。' },
      { name: '玉甲护身', type: 'block', value: 8, description: '获得 8 点格挡。' },
      { name: '裂岩重锤', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '玉壁反震', type: 'skill', block: 6, damage: 5, description: '获得 6 点格挡并造成 5 点伤害。' },
      { name: '震地波', type: 'attack', value: 7, description: '造成 7 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
    ],
  },
  {
    id: 'scarlet_bat',
    name: '赤翼蝠妖',
    maxHp: 34,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 9, label: '血翼扑击 9' },
      { type: 'block', value: 4, label: '盘旋闪避 4' },
      { type: 'attack', value: 11, label: '尖啸突袭 11' },
    ],
    deck: [
      { name: '血翼扑击', type: 'attack', value: 7, description: '造成 7 点伤害。' },
      { name: '盘旋闪避', type: 'block', value: 4, description: '获得 4 点格挡。' },
      { name: '尖啸突袭', type: 'attack', value: 8, description: '造成 8 点伤害，并令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
      { name: '乱翼连扑', type: 'attack', value: 5, description: '造成 5 点伤害。' },
      { name: '血雾盘旋', type: 'skill', block: 3, applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 }, description: '获得 3 点格挡，并令玩家获得 1 层易伤。' },
    ],
  },
];
