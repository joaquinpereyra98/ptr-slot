/**
 * Hook to configure the roll table settings.
 *
 * @param {Application} application - The application instance.
 * @param {JQuery} $html - A jQuery-wrapped HTML element.
 * @param {Object} data - Data context for the application.
 */
export default function onRenderRollTable(application, [html], data) {
  const lastFormGroup = html.querySelector(".form-group:last-of-type");
  const sheetFooter = html.querySelector("footer.sheet-footer");

  if (!lastFormGroup || !sheetFooter) return;

  const rollTableDocument = application.document;
  const isSlot = rollTableDocument.getFlag("ptr-slot", "isSlot") ?? false;
  const slotCost = rollTableDocument.getFlag("ptr-slot", "slotCost") ?? 0;

  // Inject slot container
  lastFormGroup.insertAdjacentHTML(
    "afterend",
    createSlotContainerHTML(isSlot, slotCost)
  );

  if (isSlot)
    sheetFooter.insertAdjacentHTML(
      "beforeend",
      `<button class="ptr-slot-draw" type="button">
      <i class="fa-regular fa-slot-machine"></i> 
      Draw Slot Machine!
      </button>`
    );

  // Set up event listeners
  const slotCheckbox = html.querySelector("input.ptr-slot");
  const slotCostInput = html.querySelector("input.ptr-slot-cost");
  const drawSlotMachine = html.querySelector("button.ptr-slot-draw");

  if (slotCheckbox) {
    slotCheckbox.addEventListener("change", async (event) => {
      const enabled = event.target.checked;
      await rollTableDocument.setFlag("ptr-slot", "isSlot", enabled);
      if (slotCostInput) slotCostInput.disabled = !enabled;
    });
  }

  if (slotCostInput) {
    slotCostInput.disabled = !isSlot;
    slotCostInput.addEventListener("change", async (event) => {
      await rollTableDocument.setFlag(
        "ptr-slot",
        "slotCost",
        ensurePositiveInteger(event.target.value)
      );
    });
  }

  if (drawSlotMachine) {
    drawSlotMachine.addEventListener("click", async (event) => {
      event.preventDefault();
      await rollTableDocument.drawSlotMachine();
    });
  }
}

/**
 * Creates the HTML for the slot container.
 *
 * @param {boolean} isSlot - Whether the slot machine is enabled.
 * @param {number} slotCost - Current slot cost value.
 * @returns {string} - HTML string for the slot container.
 */
function createSlotContainerHTML(isSlot, slotCost) {
  return `
    <div class="ptr-slot fields-container">
      <h3>PTR Slot Machine</h3>
      ${createCheckboxHTML(isSlot)}
      ${createCostInputHTML(slotCost, isSlot)}
    </div>
  `;
}

/**
 * Creates the HTML for the 'isSlot' checkbox.
 *
 * @param {boolean} isSlot - Current state of the 'isSlot' flag.
 * @returns {string} - HTML string for the checkbox.
 */
function createCheckboxHTML(isSlot) {
  return `
    <div class="form-group">
      <label>Is a slot machine?</label>
      <div class="form-fields">
        <input class="ptr-slot" type="checkbox" ${isSlot ? "checked" : ""} />
      </div>
      <p class="hint">Enable this option to allow the table to function as a slot machine.</p>
    </div>
  `;
}

/**
 * Creates the HTML for the 'slotCost' input.
 *
 * @param {number} slotCost - Current slot cost value.
 * @param {boolean} isSlot - Whether the slot machine is enabled.
 * @returns {string} - HTML string for the cost input.
 */
function createCostInputHTML(slotCost, isSlot) {
  return `
    <div class="form-group">
      <label>Slot cost</label>
      <div class="form-fields">
        <input class="ptr-slot-cost" type="number" value="${slotCost}" min="0" ${
    isSlot ? "" : "disabled"
  } />
      </div>
      <p class="hint">Set the cost required to roll the slot machine. This value determines the amount needed for each spin.</p>
    </div>
  `;
}

/**
 * Ensures a given value is a positive integer.
 *
 * @param {any} value - The value to validate and sanitize.
 * @returns {number} - A positive integer, or 0 if the value is invalid.
 */
function ensurePositiveInteger(value) {
  const num = parseInt(value, 10);
  return Number.isInteger(num) && num > 0 ? num : 0;
}
