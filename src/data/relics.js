export const RELIC_LIBRARY = [
  {
    id: 'bronze_mirror',
    name: '青铜灵镜',
    description: '战斗开始时获得 3 点格挡。',
    onBattleStart: { block: 3 },
  },
  {
    id: 'spirit_ring',
    name: '聚灵戒',
    description: '每回合开始额外获得 1 点格挡。',
    onTurnStart: { block: 1 },
  },
  {
    id: 'jade_pendant',
    name: '温玉佩',
    description: '战斗开始时额外获得 4 点格挡。',
    onBattleStart: { block: 4 },
  },
  {
    id: 'cloud_talisman',
    name: '行云符',
    description: '每回合开始额外获得 2 点格挡。',
    onTurnStart: { block: 2 },
  },
];
