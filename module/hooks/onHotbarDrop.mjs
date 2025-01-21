/**
 * Default handling of the drop event can be prevented by returning false within the hooked function.
 * @param {Hotbar} hotbar - The Hotbar application instance
 * @param {Object} data - The dropped data object
 * @param {Number} slot - The target hotbar slot
 * @returns
 */
export default function onHotbarDrop(hotbar, data, slot) {
  const existingMacro = game.macros.get(game.user.hotbar[slot]);

  if ((existingMacro && hotbar.locked) || !data.isSlotMachine) return true;

  createSlotMachineMacro(data, slot);
  return false;
}

async function createSlotMachineMacro(data, slot) {
  const cls = getDocumentClass(data.type);
  const doc = await cls?.fromDropData(data);
  if (!doc) return true;
  const command = `const table = await fromUuid("${doc.uuid}");\nawait table.drawSlotMachine();`;
  const macro = await Macro.implementation.create({
    name: `${game.i18n.localize("TABLE.Roll")} ${doc.name}`,
    type: "script",
    img: doc.img,
    command,
  });
  await game.user.assignHotbarMacro(macro, slot, { fromSlot: data.slot });
}
