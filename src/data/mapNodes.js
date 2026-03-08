export const MAP_ROUTE_LIBRARY = [
  {
    id: 'trial_route_alpha',
    name: '青岚试炼路',
    nodes: [
      { id: 'n1', type: 'battle', name: '前山山道', enemyId: 'bandit_guard', rewardCount: 3, goldReward: 18 },
      { id: 'n2', type: 'event', name: '古松奇遇', eventPool: ['healer', 'merchant_cache', 'bat_ambush'] },
      { id: 'n3', type: 'shop', name: '山门小市' },
      { id: 'n4', type: 'elite', name: '断桥残亭', enemyId: 'jade_construct', rewardCount: 4, goldReward: 30 },
      { id: 'n5', type: 'rest', name: '灵泉歇脚', heal: 12 },
      { id: 'n6', type: 'battle', name: '古殿门前', enemyId: 'scarlet_bat', rewardCount: 3, goldReward: 20 },
    ],
  },
];
