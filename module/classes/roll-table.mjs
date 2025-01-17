import SlotMachineDrawApp from '../applications/slot-machine-draw.mjs';

const cls = CONFIG.RollTable.documentClass;

export default class RollTable extends cls {
  drawSlotMachine(options) {
    const app = new SlotMachineDrawApp({document: this});
    app.render({force: true});
  }
}
