import MODULE_CONST from "./constant.mjs";

import * as classes from "./classes/_module.mjs";
import * as apps from "./applications/_module.mjs";
import * as hooks from "./hooks/_module.mjs";

Hooks.on("renderRollTableConfig", hooks.onRenderRollTable);

Hooks.on("init", () => {
  const module = game.modules.get(MODULE_CONST.moduleId);

  Object.assign(module, {
    classes,
    apps,
    hooks,
  });

  CONFIG.RollTable.documentClass = classes.RollTable;
});
