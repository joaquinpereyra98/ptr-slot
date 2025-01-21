import MODULE_CONST from "../constant.mjs";

const cls = CONFIG.RollTable.documentClass;

export default class RollTable extends cls {
  /**
   * Draws a slot machine interface for rolling a table, associating it with a specific actor.
   *
   * @param {Object} options - Options for the slot machine draw.
   * @param {string} [options.actorUuid] - The UUID of the actor to associate with the roll.
   *                                         If not provided, defaults to the first controlled token
   *                                         or the user's character.
   */
  async drawSlotMachine(options = {}) {
    const { actorUuid } = options;

    const SlotMachineApp = game.modules.get(MODULE_CONST.moduleId)?.apps
      ?.SlotMachineApp;

    if (!SlotMachineApp) {
      throw new Error(
        `${MODULE_CONST.moduleId}| SlotMachineApp not found on game.modules.${MODULE_CONST.moduleId}`
      );
    }

    // Parse the provided actorUuid if available
    const { id } = actorUuid ? foundry.utils.parseUuid(actorUuid) : {};

    const actor = id
      ? await fromUuid(actorUuid)
      : canvas?.tokens?.controlled[0]?.actor ?? game.user.character;

    if (!actor) {
      ui.notifications.warn(
        `${MODULE_CONST.moduleId} | You must select a token before drawing the Slot Machine or provide an actorUuid in the arguments.`
      );
      return;
    }

    new SlotMachineApp({ rollTable: this, actor }).render({ force: true });
  }

  toDragData() {
    return { ...super.toDragData(), isSlotMachine: this.getFlag("ptr-slot", "isSlot") || false };
  }
  
}
