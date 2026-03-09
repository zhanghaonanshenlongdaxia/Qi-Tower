/**
 * UI 辅助工具 - 九宫格面板生成
 */

export class UIHelper {
  /**
   * 创建九宫格拉伸面板
   * @param {Phaser.Scene} scene - 场景对象
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {number} width - 目标宽度
   * @param {number} height - 目标高度
   * @param {string} texture - 纹理键名（默认 'panel_bg_nineslice'）
   * @returns {Phaser.GameObjects.NineSlice}
   */
  static createNineSlicePanel(scene, x, y, width, height, texture = 'panel_bg_nineslice') {
    // 九宫格切割参数
    // 缩小后纹理约 558x837（原图 1672x2508 的 1/3）
    // 边距之和必须 <= 目标面板最小尺寸
    // 动态计算确保不超过目标尺寸
    const maxLR = Math.floor(width / 2) - 1;
    const maxTB = Math.floor(height / 2) - 1;
    const leftWidth = Math.min(250, maxLR);
    const rightWidth = Math.min(250, maxLR);
    const topHeight = Math.min(250, maxTB);
    const bottomHeight = Math.min(250, maxTB);

    const panel = scene.add.nineslice(
      x, y,
      texture,
      undefined, // frame (不使用 sprite sheet)
      width, height,
      leftWidth, rightWidth, topHeight, bottomHeight
    );

    return panel;
  }

  /**
   * 替换现有的 ui_panel 图片为九宫格面板
   * @param {Phaser.Scene} scene - 场景对象
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {number} width - 显示宽度
   * @param {number} height - 显示高度
   * @returns {Phaser.GameObjects.NineSlice}
   */
  static createPanel(scene, x, y, width, height) {
    return UIHelper.createNineSlicePanel(scene, x, y, width, height);
  }
}
