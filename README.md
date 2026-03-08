# Game2

一个基于 `Vite + Phaser 3` 的数据驱动卡牌项目基础结构。

## 当前结构

```text
Game2/
├─ index.html
├─ package.json
├─ README.md
└─ src/
   ├─ main.js
   ├─ style.css
   ├─ config/
   │  └─ gameConfig.js
   ├─ data/
   │  ├─ cards.js
   │  ├─ enemies.js
   │  ├─ starterDecks.js
   │  └─ relics.js
   ├─ scenes/
   │  ├─ BootScene.js
   │  ├─ MenuScene.js
   │  └─ BattleScene.js
   └─ systems/
      ├─ DataRegistry.js
      └─ BattleState.js
```

## 数据驱动原则

- `src/data` 只放静态数据
- `DataRegistry` 负责统一读取和构建数据对象
- `BattleState` 只消费数据，不直接写死卡牌内容
- 场景层只负责表现，不直接耦合数据源定义

## 已完成内容

- 卡牌库
- 敌人库
- 初始卡组
- 遗物库
- 数据注册层
- 最小战斗循环
- 菜单场景与战斗场景

## 运行

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

## 下一步建议

- 增加 `src/data/statusEffects.js`
- 增加 `src/data/encounters.js`
- 增加奖励选牌与地图节点
- 增加多职业初始卡组
- 增加存档与局外成长
