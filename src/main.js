import Phaser from 'phaser';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import './style.css';
import { GAME_CONFIG } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { BattleScene } from './scenes/BattleScene';
import { MapScene } from './scenes/MapScene';
import { RewardScene } from './scenes/RewardScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#0c0f18',
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI',
      },
    ],
  },
  scene: [BootScene, MenuScene, HeroSelectScene, MapScene, BattleScene, RewardScene],
};

new Phaser.Game(config);
