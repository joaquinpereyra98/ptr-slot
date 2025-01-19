import MODULE_CONST from "module/constant.mjs";
const cls = CONFIG.RollTable.documentClass;

export default class RollTable extends cls {
  drawSlotMachine() {
    const { SlotMachineApp } = game.modules.get(MODULE_CONST.moduleId).apps;
    const app = new SlotMachineApp({ document: this });
    app.render({ force: true });
  }
}
