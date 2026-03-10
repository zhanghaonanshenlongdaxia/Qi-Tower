/**
 * 敌人库 - Enemy Library
 * 包含所有敌人的数据定义
 */

export const ENEMY_LIBRARY = [
  // ========== 地图路线专用敌人 ==========

  {
    id: 'bandit_guard',
    name: '山匪卫兵',
    maxHp: 40,
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
    area: 'route',
  },
  {
    id: 'ghost_monk',
    name: '残魂僧',
    maxHp: 36,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 6, label: '阴掌 6' },
      { type: 'skill', label: '夺魄' },
      { type: 'block', value: 5, label: '结界 5' },
    ],
    deck: [
      { name: '阴掌', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '魂火侵体', type: 'attack', value: 5, description: '造成 5 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '残魂结界', type: 'block', value: 5, description: '获得 5 点格挡。' },
      { name: '幽火护身', type: 'skill', block: 4, applyStatus: { target: 'player', id: 'weak', stacks: 1 }, description: '获得 4 点格挡，并令玩家获得 1 层虚弱。' },
      { name: '夺魄', type: 'skill', description: '令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
    ],
    area: 'route',
  },
  {
    id: 'jade_construct',
    name: '玉傀守卫',
    maxHp: 58,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 10, label: '镇山击 10' },
      { type: 'block', value: 8, label: '玉甲 8' },
      { type: 'attack', value: 14, label: '裂岩重锤 14' },
    ],
    deck: [
      { name: '镇山击', type: 'attack', value: 9, description: '造成 9 点伤害。' },
      { name: '玉甲护身', type: 'block', value: 8, description: '获得 8 点格挡。' },
      { name: '裂岩重锤', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '玉壁反震', type: 'skill', block: 6, damage: 5, description: '获得 6 点格挡并造成 5 点伤害。' },
      { name: '震地波', type: 'attack', value: 7, description: '造成 7 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
    ],
    area: 'route',
  },
  {
    id: 'scarlet_bat',
    name: '赤翼蝠妖',
    maxHp: 34,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 9, label: '血翼扑击 9' },
      { type: 'block', value: 4, label: '盘旋 4' },
      { type: 'attack', value: 11, label: '尖啸突袭 11' },
    ],
    deck: [
      { name: '血翼扑击', type: 'attack', value: 7, description: '造成 7 点伤害。' },
      { name: '盘旋闪避', type: 'block', value: 4, description: '获得 4 点格挡。' },
      { name: '尖啸突袭', type: 'attack', value: 8, description: '造成 8 点伤害，并令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
      { name: '乱翼连扑', type: 'attack', value: 5, description: '造成 5 点伤害。' },
      { name: '血雾盘旋', type: 'skill', block: 3, applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 }, description: '获得 3 点格挡，并令玩家获得 1 层易伤。' },
    ],
    area: 'route',
  },
  {
    id: 'mask_raider',
    name: '面具劫修',
    maxHp: 42,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 8, label: '斜斩 8' },
      { type: 'skill', label: '封脉' },
      { type: 'block', value: 6, label: '借势 6' },
    ],
    deck: [
      { name: '斜刃突进', type: 'attack', value: 8, description: '造成 8 点伤害。' },
      { name: '贴身肘击', type: 'skill', damage: 5, block: 3, description: '造成 5 点伤害并获得 3 点格挡。' },
      { name: '封脉砂', type: 'skill', description: '令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '借势回护', type: 'block', value: 6, description: '获得 6 点格挡。' },
      { name: '割喉快斩', type: 'attack', value: 10, description: '造成 10 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'fog_spirit_fox',
    name: '雾灵狐',
    maxHp: 38,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 7, label: '雾爪 7' },
      { type: 'block', value: 5, label: '迷踪 5' },
      { type: 'skill', label: '惑心' },
    ],
    deck: [
      { name: '雾爪掠袭', type: 'attack', value: 7, description: '造成 7 点伤害。' },
      { name: '狐影迷踪', type: 'block', value: 5, description: '获得 5 点格挡。' },
      { name: '惑心低鸣', type: 'skill', description: '令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
      { name: '魅影连扑', type: 'attack', value: 6, description: '造成 6 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '灵雾回身', type: 'skill', block: 4, damage: 4, description: '获得 4 点格挡并造成 4 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'seal_warden',
    name: '守印甲士',
    maxHp: 72,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 12, label: '镇印斩 12' },
      { type: 'block', value: 10, label: '坚垒 10' },
      { type: 'skill', label: '压制' },
    ],
    deck: [
      { name: '镇印斩', type: 'attack', value: 11, description: '造成 11 点伤害。' },
      { name: '玄铁坚垒', type: 'block', value: 10, description: '获得 10 点格挡。' },
      { name: '封势横扫', type: 'skill', damage: 6, block: 6, description: '造成 6 点伤害并获得 6 点格挡。' },
      { name: '压制喝令', type: 'skill', description: '令玩家获得 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '重甲震步', type: 'attack', value: 14, description: '造成 14 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'bronze_mask_keeper',
    name: '青铜面守',
    maxHp: 96,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 14, label: '铜刃 14' },
      { type: 'skill', label: '摄魂' },
      { type: 'block', value: 12, label: '古面护体 12' },
    ],
    deck: [
      { name: '铜刃断魄', type: 'attack', value: 13, description: '造成 13 点伤害。' },
      { name: '古面护体', type: 'block', value: 12, description: '获得 12 点格挡。' },
      { name: '摄魂低语', type: 'skill', description: '令玩家获得 2 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 2 } },
      { name: '回身反斩', type: 'skill', damage: 7, block: 7, description: '造成 7 点伤害并获得 7 点格挡。' },
      { name: '断印重击', type: 'attack', value: 16, description: '造成 16 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
    ],
    area: 'route',
  },
  {
    id: 'curse_scribe',
    name: '咒书吏',
    maxHp: 40,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 6, label: '骨笔 6' },
      { type: 'skill', label: '蚀意' },
      { type: 'block', value: 5, label: '纸障 5' },
    ],
    deck: [
      { name: '骨笔点杀', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '蚀意咒', type: 'skill', description: '令玩家获得 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '散页障', type: 'block', value: 5, description: '获得 5 点格挡。' },
      { name: '断句封喉', type: 'attack', value: 8, description: '造成 8 点伤害，并令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
      { name: '残卷回护', type: 'skill', block: 4, damage: 4, description: '获得 4 点格挡并造成 4 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'iron_shell_beast',
    name: '铁甲魇兽',
    maxHp: 54,
    cardsPerTurn: 2,
    intents: [
      { type: 'block', value: 10, label: '缩壳 10' },
      { type: 'attack', value: 11, label: '撞山 11' },
      { type: 'skill', label: '反震' },
    ],
    deck: [
      { name: '缩壳蓄势', type: 'block', value: 10, description: '获得 10 点格挡。' },
      { name: '重壳撞山', type: 'attack', value: 11, description: '造成 11 点伤害。' },
      { name: '铁鳞反震', type: 'skill', block: 6, damage: 5, description: '获得 6 点格挡并造成 5 点伤害。' },
      { name: '钝爪压制', type: 'skill', description: '令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '甲片横扫', type: 'attack', value: 9, description: '造成 9 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'lantern_wraith',
    name: '提灯怨灵',
    maxHp: 37,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 6, label: '灯焰 6' },
      { type: 'skill', label: '照魄' },
      { type: 'block', value: 4, label: '飘灯 4' },
    ],
    deck: [
      { name: '灯焰扑面', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '照魄幽光', type: 'skill', description: '令玩家获得 2 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 2 } },
      { name: '浮灯护体', type: 'block', value: 4, description: '获得 4 点格挡。' },
      { name: '冥火缠身', type: 'attack', value: 7, description: '造成 7 点伤害，并令玩家获得 1 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 1 } },
      { name: '幽照回燃', type: 'skill', block: 3, damage: 4, description: '获得 3 点格挡并造成 4 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'blade_ritualist',
    name: '刃祭使',
    maxHp: 48,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 10, label: '祭刃 10' },
      { type: 'skill', label: '破势' },
      { type: 'attack', value: 12, label: '连断 12' },
    ],
    deck: [
      { name: '祭刃切落', type: 'attack', value: 10, description: '造成 10 点伤害。' },
      { name: '破势咒切', type: 'skill', description: '令玩家获得 2 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 2 } },
      { name: '连断疾斩', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '翻刃回身', type: 'skill', damage: 6, block: 4, description: '造成 6 点伤害并获得 4 点格挡。' },
      { name: '血祭压身', type: 'skill', description: '令玩家获得 1 层虚弱和 1 层易伤。', applyStatuses: [{ target: 'player', id: 'weak', stacks: 1 }, { target: 'player', id: 'vulnerable', stacks: 1 }] },
    ],
    area: 'route',
  },
  {
    id: 'tower_judicator',
    name: '塔律裁者',
    maxHp: 88,
    cardsPerTurn: 3,
    intents: [
      { type: 'block', value: 12, label: '塔律 12' },
      { type: 'attack', value: 15, label: '裁断 15' },
      { type: 'skill', label: '镇压' },
    ],
    deck: [
      { name: '塔律护壁', type: 'block', value: 12, description: '获得 12 点格挡。' },
      { name: '裁断重击', type: 'attack', value: 15, description: '造成 15 点伤害。' },
      { name: '镇压敕令', type: 'skill', description: '令玩家获得 2 层虚弱与 1 层易伤。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '律令反震', type: 'skill', block: 8, damage: 6, description: '获得 8 点格挡并造成 6 点伤害。' },
      { name: '铁律横扫', type: 'attack', value: 13, description: '造成 13 点伤害。' },
    ],
    area: 'route',
  },
  {
    id: 'echo_duelist',
    name: '回声剑侍',
    maxHp: 84,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 13, label: '回锋 13' },
      { type: 'skill', label: '乱心' },
      { type: 'block', value: 9, label: '听刃 9' },
    ],
    deck: [
      { name: '回锋斩', type: 'attack', value: 13, description: '造成 13 点伤害。' },
      { name: '听刃守势', type: 'block', value: 9, description: '获得 9 点格挡。' },
      { name: '乱心回响', type: 'skill', description: '令玩家获得 1 层虚弱和 1 层易伤。', applyStatuses: [{ target: 'player', id: 'weak', stacks: 1 }, { target: 'player', id: 'vulnerable', stacks: 1 }] },
      { name: '折影连步', type: 'skill', damage: 6, block: 5, description: '造成 6 点伤害并获得 5 点格挡。' },
      { name: '剑意回旋', type: 'skill', description: '获得 2 层力量。', applyStatus: { target: 'self', id: 'strength', stacks: 2 } },
    ],
    area: 'route',
  },
  {
    id: 'tower_heart_demon',
    name: '塔心魇主',
    maxHp: 138,
    cardsPerTurn: 4,
    type: 'boss',
    intents: [
      { type: 'attack', value: 16, label: '魇火 16' },
      { type: 'skill', label: '心魇' },
      { type: 'block', value: 14, label: '塔壳 14' },
    ],
    deck: [
      { name: '魇火噬心', type: 'attack', value: 16, description: '造成 16 点伤害，并令玩家获得 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
      { name: '塔壳闭锁', type: 'block', value: 14, description: '获得 14 点格挡。' },
      { name: '心魇低语', type: 'skill', description: '令玩家获得 2 层虚弱与 2 层易伤。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '裂印震爆', type: 'skill', damage: 9, block: 9, description: '造成 9 点伤害并获得 9 点格挡。' },
      { name: '吞魂重压', type: 'attack', value: 20, description: '造成 20 点伤害。' },
      { name: '塔心潮汐', type: 'attack', value: 12, description: '造成 12 点伤害，并令玩家获得 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
    ],
    area: 'route',
  },

  // ========== 第一区域：云麓山麓 ==========
  
  {
    id: 'slime',
    name: '史莱姆',
    maxHp: 24,
    cardsPerTurn: 1,
    intents: [
      { type: 'attack', value: 5, label: '撞击 5' },
      { type: 'block', value: 4, label: '收缩 4' },
    ],
    deck: [
      { name: '粘液撞击', type: 'attack', value: 5, description: '造成 5 点伤害。' },
      { name: '粘液护体', type: 'block', value: 4, description: '获得 4 点格挡。' },
    ],
    area: 'area1'
  },
  
  {
    id: 'goblin_scout',
    name: '哥布林斥候',
    maxHp: 30,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 6, label: '刺击 6' },
      { type: 'attack', value: 8, label: '偷袭 8' },
      { type: 'block', value: 5, label: '格挡 5' },
    ],
    deck: [
      { name: '短刀刺击', type: 'attack', value: 6, description: '造成 6 点伤害。' },
      { name: '背后偷袭', type: 'attack', value: 8, description: '造成 8 点伤害。' },
      { name: '简易格挡', type: 'block', value: 5, description: '获得 5 点格挡。' },
    ],
    area: 'area1'
  },
  
  {
    id: 'wolf',
    name: '野狼',
    maxHp: 36,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 7, label: '撕咬 7' },
      { type: 'attack', value: 10, label: '扑击 10' },
      { type: 'block', value: 6, label: '警觉 6' },
    ],
    deck: [
      { name: '利爪撕咬', type: 'attack', value: 7, description: '造成 7 点伤害。' },
      { name: '猛虎扑击', type: 'attack', value: 10, description: '造成 10 点伤害。' },
      { name: '警觉姿态', type: 'block', value: 6, description: '获得 6 点格挡。' },
    ],
    area: 'area1'
  },
  
  {
    id: 'ogre',
    name: '食人魔',
    maxHp: 65,
    cardsPerTurn: 2,
    type: 'elite',
    intents: [
      { type: 'attack', value: 12, label: '重拳 12' },
      { type: 'attack', value: 18, label: ' crushing 18' },
      { type: 'block', value: 10, label: '防御 10' },
    ],
    deck: [
      { name: '巨拳重击', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '粉碎打击', type: 'attack', value: 18, description: '造成 18 点伤害。' },
      { name: '粗壮防御', type: 'block', value: 10, description: '获得 10 点格挡。' },
      { name: '狂暴', type: 'skill', description: '获得 2 层力量。', applyStatus: { target: 'self', id: 'strength', stacks: 2 } },
    ],
    area: 'area1'
  },
  
  {
    id: 'dark_mage',
    name: '黑暗法师',
    maxHp: 48,
    cardsPerTurn: 2,
    type: 'elite',
    intents: [
      { type: 'attack', value: 8, label: '暗影箭 8' },
      { type: 'skill', label: '诅咒' },
      { type: 'block', value: 7, label: '屏障 7' },
    ],
    deck: [
      { name: '暗影箭', type: 'attack', value: 8, description: '造成 8 点伤害。' },
      { name: '虚弱诅咒', type: 'skill', description: '令玩家获得 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '黑暗屏障', type: 'block', value: 7, description: '获得 7 点格挡。' },
      { name: '魔力涌流', type: 'skill', description: '获得 1 层集中。', applyStatus: { target: 'self', id: 'focus', stacks: 1 } },
    ],
    area: 'area1'
  },
  
  {
    id: 'mountain_king',
    name: '山岭之王',
    maxHp: 120,
    cardsPerTurn: 3,
    type: 'boss',
    intents: [
      { type: 'attack', value: 15, label: '山崩击 15' },
      { type: 'attack', value: 22, label: '地震波 22' },
      { type: 'block', value: 15, label: '岩甲 15' },
      { type: 'skill', label: '召唤' },
    ],
    deck: [
      { name: '山崩地裂', type: 'attack', value: 15, description: '造成 15 点伤害。' },
      { name: '地震冲击波', type: 'attack', value: 22, description: '造成 22 点伤害。' },
      { name: '岩石护甲', type: 'block', value: 15, description: '获得 15 点格挡。' },
      { name: '召唤小弟', type: 'skill', description: '召唤一个哥布林斥候。', summon: { enemyId: 'goblin_scout', count: 1 } },
      { name: '大地之力', type: 'skill', description: '获得 3 层力量。', applyStatus: { target: 'self', id: 'strength', stacks: 3 } },
    ],
    area: 'area1'
  },
  
  // ========== 第二区域：幽冥秘境 ==========
  
  {
    id: 'skeleton',
    name: '骷髅兵',
    maxHp: 38,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 8, label: '骨剑 8' },
      { type: 'block', value: 6, label: '骨盾 6' },
    ],
    deck: [
      { name: '骨剑挥砍', type: 'attack', value: 8, description: '造成 8 点伤害。' },
      { name: '白骨之盾', type: 'block', value: 6, description: '获得 6 点格挡。' },
      { name: '骨刺投掷', type: 'attack', value: 6, description: '造成 6 点伤害。' },
    ],
    area: 'area2'
  },
  
  {
    id: 'zombie',
    name: '僵尸',
    maxHp: 50,
    cardsPerTurn: 1,
    intents: [
      { type: 'attack', value: 10, label: '抓挠 10' },
      { type: 'skill', label: '感染' },
    ],
    deck: [
      { name: '腐烂抓挠', type: 'attack', value: 10, description: '造成 10 点伤害。' },
      { name: '尸毒感染', type: 'skill', description: '令玩家获得 2 层中毒。', applyStatus: { target: 'player', id: 'poison', stacks: 2 } },
      { name: '不死之躯', type: 'block', value: 8, description: '获得 8 点格挡。' },
    ],
    area: 'area2'
  },
  
  {
    id: 'ghost',
    name: '幽魂',
    maxHp: 32,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 7, label: '魂击 7' },
      { type: 'skill', label: '附身' },
      { type: 'block', value: 5, label: '虚化 5' },
    ],
    deck: [
      { name: '灵魂冲击', type: 'attack', value: 7, description: '造成 7 点伤害。' },
      { name: '虚弱附身', type: 'skill', description: '令玩家获得 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '虚化形态', type: 'block', value: 5, description: '获得 5 点格挡。' },
    ],
    area: 'area2'
  },
  
  {
    id: 'lich',
    name: '巫妖',
    maxHp: 85,
    cardsPerTurn: 3,
    type: 'elite',
    intents: [
      { type: 'attack', value: 12, label: '死亡之握 12' },
      { type: 'skill', label: '复活' },
      { type: 'skill', label: '诅咒' },
    ],
    deck: [
      { name: '死亡之握', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '骷髅复活', type: 'skill', description: '召唤一个骷髅兵。', summon: { enemyId: 'skeleton', count: 1 } },
      { name: '衰老诅咒', type: 'skill', description: '令玩家获得 3 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 3 } },
      { name: '亡灵护盾', type: 'block', value: 12, description: '获得 12 点格挡。' },
    ],
    area: 'area2'
  },
  
  {
    id: 'death_knight',
    name: '死亡骑士',
    maxHp: 95,
    cardsPerTurn: 3,
    type: 'elite',
    intents: [
      { type: 'attack', value: 14, label: '魔剑 14' },
      { type: 'attack', value: 20, label: '冲锋 20' },
      { type: 'block', value: 12, label: '板甲 12' },
    ],
    deck: [
      { name: '魔剑斩击', type: 'attack', value: 14, description: '造成 14 点伤害。' },
      { name: '死亡冲锋', type: 'attack', value: 20, description: '造成 20 点伤害。' },
      { name: '板甲护体', type: 'block', value: 12, description: '获得 12 点格挡。' },
      { name: '吸血打击', type: 'attack', value: 10, description: '造成 10 点伤害，恢复等量生命。', lifesteal: true },
    ],
    area: 'area2'
  },
  
  {
    id: 'bone_dragon',
    name: '骨龙',
    maxHp: 160,
    cardsPerTurn: 3,
    type: 'boss',
    intents: [
      { type: 'attack', value: 18, label: '龙息 18' },
      { type: 'attack', value: 25, label: '尾扫 25' },
      { type: 'skill', label: '召唤' },
      { type: 'block', value: 20, label: '龙骨 20' },
    ],
    deck: [
      { name: '幽冥龙息', type: 'attack', value: 18, description: '造成 18 点伤害，并施加 2 层中毒。', applyStatus: { target: 'player', id: 'poison', stacks: 2 } },
      { name: '骸骨尾扫', type: 'attack', value: 25, description: '造成 25 点伤害。' },
      { name: '龙骨护甲', type: 'block', value: 20, description: '获得 20 点格挡。' },
      { name: '亡灵大军', type: 'skill', description: '召唤两个骷髅兵。', summon: { enemyId: 'skeleton', count: 2 } },
      { name: '不死之躯', type: 'skill', description: '获得 2 层再生。', applyStatus: { target: 'self', id: 'regenerate', stacks: 2 } },
    ],
    area: 'area2'
  },
  
  // ========== 第三区域：天穹仙域 ==========
  
  {
    id: 'celestial_guard',
    name: '天界守卫',
    maxHp: 60,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 12, label: '天罚 12' },
      { type: 'block', value: 10, label: '圣盾 10' },
    ],
    deck: [
      { name: '天罚之光', type: 'attack', value: 12, description: '造成 12 点伤害。' },
      { name: '神圣之盾', type: 'block', value: 10, description: '获得 10 点格挡。' },
      { name: '圣光审判', type: 'attack', value: 10, description: '造成 10 点伤害，并施加 1 层易伤。', applyStatus: { target: 'player', id: 'vulnerable', stacks: 1 } },
    ],
    area: 'area3'
  },
  
  {
    id: 'phoenix_spawn',
    name: '凤凰幼雏',
    maxHp: 55,
    cardsPerTurn: 3,
    intents: [
      { type: 'attack', value: 10, label: '火焰 10' },
      { type: 'skill', label: '重生' },
      { type: 'block', value: 8, label: '羽翼 8' },
    ],
    deck: [
      { name: '烈焰冲击', type: 'attack', value: 10, description: '造成 10 点伤害，并施加 2 层燃烧。', applyStatus: { target: 'player', id: 'burn', stacks: 2 } },
      { name: '凤凰羽翼', type: 'block', value: 8, description: '获得 8 点格挡。' },
      { name: '浴火', type: 'skill', description: '获得 2 层再生。', applyStatus: { target: 'self', id: 'regenerate', stacks: 2 } },
    ],
    area: 'area3'
  },
  
  {
    id: 'dragon_whelp',
    name: '龙崽',
    maxHp: 65,
    cardsPerTurn: 2,
    intents: [
      { type: 'attack', value: 14, label: '龙爪 14' },
      { type: 'attack', value: 18, label: '吐息 18' },
    ],
    deck: [
      { name: '龙爪撕裂', type: 'attack', value: 14, description: '造成 14 点伤害。' },
      { name: '元素吐息', type: 'attack', value: 18, description: '造成 18 点伤害。' },
      { name: '龙鳞护体', type: 'block', value: 12, description: '获得 12 点格挡。' },
    ],
    area: 'area3'
  },
  
  {
    id: 'immortal',
    name: '仙人',
    maxHp: 100,
    cardsPerTurn: 3,
    type: 'elite',
    intents: [
      { type: 'attack', value: 15, label: '仙法 15' },
      { type: 'skill', label: '增益' },
      { type: 'block', value: 15, label: '仙障 15' },
    ],
    deck: [
      { name: '九天雷诀', type: 'attack', value: 15, description: '造成 15 点伤害。' },
      { name: '仙风道骨', type: 'skill', description: '获得 2 层力量和 2 层敏捷。', applyStatuses: [{ target: 'self', id: 'strength', stacks: 2 }, { target: 'self', id: 'dexterity', stacks: 2 }] },
      { name: '先天仙障', type: 'block', value: 15, description: '获得 15 点格挡。' },
      { name: '太极两仪', type: 'skill', description: '获得 3 层集中。', applyStatus: { target: 'self', id: 'focus', stacks: 3 } },
    ],
    area: 'area3'
  },
  
  {
    id: 'demon_lord',
    name: '魔尊',
    maxHp: 110,
    cardsPerTurn: 3,
    type: 'elite',
    intents: [
      { type: 'attack', value: 16, label: '魔功 16' },
      { type: 'attack', value: 24, label: '灭世 24' },
      { type: 'skill', label: '诅咒' },
    ],
    deck: [
      { name: '万魂幡', type: 'attack', value: 16, description: '造成 16 点伤害，并施加 3 层中毒。', applyStatus: { target: 'player', id: 'poison', stacks: 3 } },
      { name: '灭世魔功', type: 'attack', value: 24, description: '造成 24 点伤害。' },
      { name: '魔源护体', type: 'block', value: 14, description: '获得 14 点格挡。' },
      { name: '血祭', type: 'skill', description: '获得 4 层力量，但失去 5 点生命。', applyStatus: { target: 'self', id: 'strength', stacks: 4 }, cost: { hp: 5 } },
    ],
    area: 'area3'
  },
  
  {
    id: 'heaven_emperor',
    name: '天帝',
    maxHp: 200,
    cardsPerTurn: 4,
    type: 'boss',
    intents: [
      { type: 'attack', value: 20, label: '天威 20' },
      { type: 'attack', value: 30, label: '神罚 30' },
      { type: 'skill', label: '天命' },
      { type: 'block', value: 25, label: '神盾 25' },
    ],
    deck: [
      { name: '天威浩荡', type: 'attack', value: 20, description: '造成 20 点伤害，并施加 2 层虚弱。', applyStatus: { target: 'player', id: 'weak', stacks: 2 } },
      { name: '神罚降临', type: 'attack', value: 30, description: '造成 30 点伤害。' },
      { name: '天命所归', type: 'skill', description: '获得 3 层力量和 3 层敏捷。', applyStatuses: [{ target: 'self', id: 'strength', stacks: 3 }, { target: 'self', id: 'dexterity', stacks: 3 }] },
      { name: '九霄神盾', type: 'block', value: 25, description: '获得 25 点格挡。' },
      { name: '万仙朝拜', type: 'skill', description: '获得 5 层集中。', applyStatus: { target: 'self', id: 'focus', stacks: 5 } },
      { name: '轮回', type: 'skill', description: '复活，恢复 50% 生命（仅一次）。', oncePerBattle: true, heal: 0.5 },
    ],
    area: 'area3'
  },
];

/**
 * 根据 ID 获取敌人数据
 * @param {string} enemyId - 敌人 ID
 * @returns {Object|null} 敌人数据
 */
export function getEnemyById(enemyId) {
  return ENEMY_LIBRARY.find(e => e.id === enemyId) || null;
}

/**
 * 根据区域获取敌人列表
 * @param {string} areaId - 区域 ID
 * @returns {Array} 敌人列表
 */
export function getEnemiesByArea(areaId) {
  return ENEMY_LIBRARY.filter(e => e.area === areaId);
}

/**
 * 获取所有敌人
 * @returns {Array} 所有敌人
 */
export function getAllEnemies() {
  return ENEMY_LIBRARY;
}

export default { ENEMY_LIBRARY, getEnemyById, getEnemiesByArea, getAllEnemies };
