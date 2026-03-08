import { DataRegistry } from '../systems/DataRegistry';
import { SfxManager } from '../systems/SfxManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createTextures();
    this.registry.set('dataRegistry', new DataRegistry());
    this.registry.set('sfxManager', new SfxManager());
    this.scene.start('MenuScene');
  }

  createTextures() {
    const panel = this.make.graphics({ add: false });
    panel.fillStyle(0x2a1d14, 1);
    panel.fillRoundedRect(0, 0, 320, 200, 10);
    panel.fillStyle(0x6f4f2d, 0.22);
    panel.fillRoundedRect(6, 6, 308, 188, 8);
    panel.fillStyle(0xe0c693, 0.9);
    panel.fillRoundedRect(16, 16, 288, 168, 6);
    panel.fillStyle(0xd1b27c, 0.34);
    panel.fillRoundedRect(16, 16, 288, 38, 6);
    panel.lineStyle(2, 0x8b5d24, 0.92);
    panel.strokeRoundedRect(1.5, 1.5, 317, 197, 10);
    panel.lineStyle(1, 0xf0d29c, 0.42);
    panel.strokeRoundedRect(8, 8, 304, 184, 8);
    panel.generateTexture('ui_panel', 320, 200);

    const card = this.make.graphics({ add: false });
    card.fillStyle(0x2b1d14, 1);
    card.fillRoundedRect(0, 0, 220, 300, 10);
    card.fillStyle(0xe6cea0, 0.98);
    card.fillRoundedRect(10, 10, 200, 280, 6);
    card.fillStyle(0xd3b483, 0.38);
    card.fillRoundedRect(10, 10, 200, 42, 6);
    card.fillStyle(0x5b3420, 0.08);
    card.fillRoundedRect(16, 78, 188, 120, 6);
    card.lineStyle(2, 0x8a5a24, 0.94);
    card.strokeRoundedRect(1.5, 1.5, 217, 297, 10);
    card.lineStyle(1, 0xf0d5a3, 0.5);
    card.strokeRoundedRect(8, 8, 204, 284, 6);
    card.lineStyle(1, 0x8a5a24, 0.55);
    card.strokeRect(22, 18, 176, 28);
    card.strokeRect(22, 238, 176, 30);
    card.generateTexture('ui_card_frame', 220, 300);

    const cardBack = this.make.graphics({ add: false });
    cardBack.fillStyle(0x2b1d14, 1);
    cardBack.fillRoundedRect(0, 0, 220, 300, 10);
    cardBack.fillStyle(0x8f6a36, 0.96);
    cardBack.fillRoundedRect(10, 10, 200, 280, 6);
    cardBack.fillStyle(0x5c3c1d, 0.22);
    cardBack.fillRoundedRect(22, 22, 176, 256, 6);
    cardBack.lineStyle(2, 0x8a5a24, 0.94);
    cardBack.strokeRoundedRect(1.5, 1.5, 217, 297, 10);
    cardBack.lineStyle(1, 0xf0d5a3, 0.46);
    cardBack.strokeRoundedRect(8, 8, 204, 284, 6);
    cardBack.lineStyle(1, 0xead19a, 0.28);
    cardBack.strokeCircle(110, 150, 56);
    cardBack.strokeCircle(110, 150, 32);
    cardBack.strokeRect(54, 94, 112, 112);
    cardBack.lineStyle(2, 0x6c4923, 0.45);
    cardBack.strokeRect(70, 110, 80, 80);
    cardBack.generateTexture('ui_card_back', 220, 300);

    const node = this.make.graphics({ add: false });
    node.fillStyle(0x2c1e15, 1);
    node.fillRoundedRect(0, 0, 240, 128, 9);
    node.fillStyle(0xe0c795, 0.94);
    node.fillRoundedRect(10, 10, 220, 108, 6);
    node.fillStyle(0xcfa866, 0.32);
    node.fillRoundedRect(10, 10, 220, 28, 6);
    node.lineStyle(2, 0x8b5d24, 0.9);
    node.strokeRoundedRect(1.5, 1.5, 237, 125, 9);
    node.lineStyle(1, 0xf3d8a7, 0.45);
    node.strokeRoundedRect(8, 8, 224, 112, 6);
    node.generateTexture('ui_node', 240, 128);

    const banner = this.make.graphics({ add: false });
    banner.fillStyle(0x6c4a28, 1);
    banner.fillRoundedRect(10, 18, 400, 44, 10);
    banner.fillStyle(0xe5c993, 0.95);
    banner.fillRoundedRect(22, 22, 376, 36, 8);
    banner.lineStyle(2, 0x8a5a24, 0.9);
    banner.strokeRoundedRect(10, 18, 400, 44, 10);
    banner.lineStyle(1, 0x8a5a24, 0.85);
    banner.strokeCircle(36, 40, 10);
    banner.strokeCircle(384, 40, 10);
    banner.fillStyle(0x8a5a24, 0.72);
    banner.fillCircle(36, 40, 4);
    banner.fillCircle(384, 40, 4);
    banner.generateTexture('ui_banner', 420, 80);

    const board = this.make.graphics({ add: false });
    board.fillStyle(0x23170f, 1);
    board.fillRoundedRect(0, 0, 760, 250, 6);
    board.fillStyle(0x6c4a28, 0.24);
    board.fillRoundedRect(6, 6, 748, 238, 4);
    board.fillStyle(0xdbc28f, 0.86);
    board.fillRoundedRect(12, 12, 736, 226, 4);
    board.fillStyle(0xcaa46a, 0.28);
    board.fillRoundedRect(12, 12, 736, 26, 4);
    board.lineStyle(2, 0x8b5d24, 0.92);
    board.strokeRoundedRect(1.5, 1.5, 757, 247, 6);
    board.lineStyle(1, 0xf0d3a1, 0.45);
    board.strokeRoundedRect(6, 6, 748, 238, 4);
    board.lineStyle(1, 0x7a4d1f, 0.62);
    board.strokeRect(28, 60, 704, 158);
    board.lineStyle(1, 0xa77d42, 0.45);
    board.strokeRoundedRect(168, 82, 424, 114, 4);
    board.generateTexture('ui_battle_board', 760, 250);

    const talisman = this.make.graphics({ add: false });
    talisman.fillStyle(0xe3c995, 0.96);
    talisman.fillRoundedRect(0, 0, 132, 164, 8);
    talisman.lineStyle(2, 0x8a5a24, 0.82);
    talisman.strokeRoundedRect(1.5, 1.5, 129, 161, 8);
    talisman.fillStyle(0x8d5d25, 0.78);
    talisman.fillRect(58, 18, 16, 100);
    talisman.fillStyle(0x6b1f1a, 0.8);
    talisman.fillRect(42, 124, 48, 10);
    talisman.lineStyle(1, 0x8a5a24, 0.6);
    talisman.strokeRect(22, 18, 88, 120);
    talisman.generateTexture('ui_talisman', 132, 164);

    const playerAvatar = this.make.graphics({ add: false });
    playerAvatar.fillStyle(0x8b5d24, 0.16);
    playerAvatar.fillCircle(48, 48, 44);
    playerAvatar.fillStyle(0x7b4f1f, 1);
    playerAvatar.fillRoundedRect(24, 44, 48, 40, 8);
    playerAvatar.fillStyle(0x593616, 1);
    playerAvatar.fillRoundedRect(24, 44, 10, 40, 8);
    playerAvatar.fillStyle(0xf0c890, 1);
    playerAvatar.fillCircle(48, 28, 16);
    playerAvatar.fillStyle(0x2b1b14, 1);
    playerAvatar.fillRoundedRect(31, 11, 34, 16, 7);
    playerAvatar.fillStyle(0xd3a24c, 1);
    playerAvatar.fillRect(29, 16, 38, 3);
    playerAvatar.fillStyle(0xffffff, 0.95);
    playerAvatar.fillEllipse(42, 29, 8, 5);
    playerAvatar.fillEllipse(54, 29, 8, 5);
    playerAvatar.fillStyle(0x4f3218, 1);
    playerAvatar.fillCircle(42, 29, 2.2);
    playerAvatar.fillCircle(54, 29, 2.2);
    playerAvatar.lineStyle(2, 0xc49343, 0.84);
    playerAvatar.strokeCircle(48, 48, 43);
    playerAvatar.generateTexture('avatar_player', 96, 96);

    const enemyAvatar = this.make.graphics({ add: false });
    enemyAvatar.fillStyle(0x8b5d24, 0.14);
    enemyAvatar.fillCircle(48, 48, 44);
    enemyAvatar.fillStyle(0x6b3d1f, 1);
    enemyAvatar.fillRoundedRect(24, 44, 48, 40, 8);
    enemyAvatar.fillStyle(0x4b2712, 1);
    enemyAvatar.fillRoundedRect(24, 44, 10, 40, 8);
    enemyAvatar.fillStyle(0xd8b888, 1);
    enemyAvatar.fillCircle(48, 28, 16);
    enemyAvatar.fillStyle(0x2a1b13, 1);
    enemyAvatar.fillRoundedRect(30, 10, 36, 18, 8);
    enemyAvatar.fillStyle(0xffffff, 0.85);
    enemyAvatar.fillEllipse(42, 29, 8, 5);
    enemyAvatar.fillEllipse(54, 29, 8, 5);
    enemyAvatar.fillStyle(0x6a2e18, 1);
    enemyAvatar.fillCircle(42, 29, 2.4);
    enemyAvatar.fillCircle(54, 29, 2.4);
    enemyAvatar.lineStyle(2, 0xb07a34, 0.84);
    enemyAvatar.strokeCircle(48, 48, 43);
    enemyAvatar.generateTexture('avatar_enemy', 96, 96);

    const badge = this.make.graphics({ add: false });
    badge.fillStyle(0x8a5a24, 1);
    badge.fillCircle(24, 24, 20);
    badge.fillStyle(0xe6c98f, 0.9);
    badge.fillCircle(24, 24, 13);
    badge.lineStyle(1, 0xf0d3a1, 0.7);
    badge.strokeCircle(24, 24, 18);
    badge.generateTexture('ui_badge', 48, 48);
  }
}
