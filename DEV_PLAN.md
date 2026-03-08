# Game2 开发计划 - 目标是杀戮尖塔级别

_臭豆骚咪的开发路线图_

## 📋 阶段划分

### 阶段 1：核心系统完善（优先级最高）
- [ ] 状态效果系统 (`statusEffects.js`)
- [ ] 遭遇/遭遇战配置 (`encounters.js`)
- [ ] 地图系统完善（节点类型：战斗、事件、商店、休息、Boss）
- [ ] 奖励系统（三选一卡牌）
- [ ] 商店系统（买卡、买遗物、 healing）
- [ ] 休息点系统（升级卡牌/治疗）

### 阶段 2：内容扩充
- [ ] 卡牌扩充到 50+ 张（多职业/多流派）
- [ ] 敌人扩充到 15+ 种（小怪、精英、Boss）
- [ ] 遗物扩充到 30+ 个
- [ ] Boss 战机制（3 个 Boss，各有特色）

### 阶段 3：游戏循环
- [ ] 存档系统（JSON 本地存储）
- [ ] 局外成长（解锁新职业、新卡牌）
- [ ] 多职业系统（至少 2 个职业）
- [ ] 难度系统（进阶等级）

### 阶段 4：美术资源
- [ ] 卡牌插画（每张卡 unique 图）
- [ ] 角色立绘（玩家、敌人）
- [ ] UI 美化（按钮、面板、图标）
- [ ] 背景图（菜单、战斗、地图）
- [ ] 特效（出牌、伤害、状态）
- [ ] 游戏封面/宣传图

### 阶段 5：音频
- [ ] BGM（菜单、战斗、Boss、地图）
- [ ] SFX（抽牌、出牌、伤害、胜利、失败）
- [ ] 音频管理器集成

### 阶段 6：打磨
- [ ] 教程/新手引导
- [ ] 平衡性调整
- [ ] Bug 修复
- [ ] 性能优化

---

## 🎯 第一阶段任务清单

### 1. 状态效果系统
创建 `src/data/statusEffects.js`，定义：
- 虚弱 (Weak) - 伤害降低
- 易伤 (Vulnerable) - 受到伤害增加
- 护体 (Shielding) - 抵消状态伤害
- 中毒 (Poison) - 回合结束掉血
- 燃烧 (Burn) - 回合结束掉血
- 力量提升 (Strength) - 伤害增加
- 敏捷提升 (Dexterity) - 格挡增加
- 眩晕 (Stun) - 跳过回合
- ...

### 2. 遭遇系统
创建 `src/data/encounters.js`，定义：
- 普通遭遇（小怪 1-3 个）
- 精英遭遇（强敌）
- Boss 遭遇
- 遭遇池按区域划分

### 3. 地图系统
完善 `src/scenes/MapScene.js`：
- 节点类型：战斗、精英、事件、商店、休息、Boss、宝箱
- 路径生成算法
- 节点奖励

### 4. 奖励系统
完善 `src/scenes/RewardScene.js`：
- 三选一卡牌
- 三选一遗物
- 卡牌升级选项

### 5. 商店系统
新建 `src/scenes/ShopScene.js`：
- 金币系统
- 购买卡牌
- 购买遗物
- 治疗服务
- 卡牌移除服务

---

## 📁 文件结构（目标）

```
Game2/
├─ index.html
├─ package.json
├─ README.md
├─ DEV_PLAN.md
├─ assets/
│  ├─ images/
│  │  ├─ cards/          # 卡牌插画
│  │  ├─ characters/     # 角色立绘
│  │  ├─ enemies/        # 敌人图
│  │  ├─ ui/             # UI 元素
│  │  ├─ backgrounds/    # 背景图
│  │  └─ icons/          # 图标
│  ├─ audio/
│  │  ├─ music/          # BGM
│  │  └─ sfx/            # 音效
│  └─ fonts/            # 字体
└─ src/
   ├─ main.js
   ├─ style.css
   ├─ config/
   │  └─ gameConfig.js
   ├─ data/
   │  ├─ cards.js
   │  ├─ enemies.js
   │  ├─ relics.js
   │  ├─ statusEffects.js    # NEW
   │  ├─ encounters.js       # NEW
   │  ├─ events.js           # NEW
   │  └─ starterDecks.js
   ├─ scenes/
   │  ├─ BootScene.js
   │  ├─ MenuScene.js
   │  ├─ MapScene.js
   │  ├─ BattleScene.js
   │  ├─ RewardScene.js
   │  ├─ ShopScene.js        # NEW
   │  ├─ EventScene.js       # NEW
   │  └─ RestScene.js        # NEW
   ├─ systems/
   │  ├─ DataRegistry.js
   │  ├─ BattleState.js
   │  ├─ GameState.js        # NEW
   │  ├─ SaveSystem.js       # NEW
   │  └─ AudioManager.js     # NEW
   └─ utils/
      ├─ cardGenerator.js    # NEW
      └─ pathfinding.js      # NEW
```

---

## 🚀 开始执行

第一阶段，今天完成：
1. ✅ 状态效果数据
2. ✅ 遭遇数据
3. ⏳ 地图系统完善
4. ⏳ 奖励系统完善

---

_最后更新：2026-03-08_
