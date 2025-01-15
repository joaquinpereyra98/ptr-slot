/**
 * Hook to configure the roll table settings.
 *
 * @param {Application} application - The application instance.
 * @param {JQuery} param1 - A jQuery-wrapped HTML element.
 * @param {Object} data - Data context for the application.
 */
export default function onRenderRollTable(application, [html], data) {
    const lastFormGroup = html.querySelector(".form-group:last-of-type");
    if (!lastFormGroup) return;
  
    const rollTableDocument = application.document;
  
    const isSlot = rollTableDocument.getFlag("ptr-slot", "isSlot") ?? false;
    const slotCost = rollTableDocument.getFlag("ptr-slot", "slotCost") ?? 0;
  
    // Create the container for slot options
    const slotContainerHTML = `
      <div class="ptr-slot fields-container">
        <h3>PTR Slot Machine</h3>
        ${getIsSlotHTML(isSlot)}
        ${getSlotCostHTML(slotCost, isSlot)}
      </div>
    `;
  
    // Inject the container after the last form group
    lastFormGroup.insertAdjacentHTML("afterend", slotContainerHTML);
  
    // Set up the event listeners
    const slotCheckbox = html.querySelector("input.ptr-slot");
    if (slotCheckbox) {
      slotCheckbox.addEventListener("change", async (event) => {
        await rollTableDocument.setFlag("ptr-slot", "isSlot", event.target.checked);
        const slotCostInput = html.querySelector("input.ptr-slot-cost");
        if (slotCostInput) {
          // Enable/disable the slot cost input based on isSlot
          slotCostInput.disabled = !event.target.checked;
        }
      });
    }
  
    // Ensure that the slot cost input is disabled or enabled on load
    const slotCostInput = html.querySelector("input.ptr-slot-cost");
    if (slotCostInput) {
      slotCostInput.disabled = !isSlot;
    }
  
    if (slotCostInput) {
      slotCostInput.addEventListener("change", async (event) => {
        await rollTableDocument.setFlag(
          "ptr-slot",
          "slotCost",
          ensurePositiveInteger(event.target.value)
        );
      });
    }
  }
  
  /**
   * Generates the HTML for the 'isSlot' checkbox.
   *
   * @param {boolean} isSlot - Current state of the 'isSlot' flag.
   * @returns {string} - HTML string for the 'isSlot' checkbox.
   */
  function getIsSlotHTML(isSlot) {
    return `
      <div class="form-group">
        <label>Is a slot machine?</label>
        <div class="form-fields">
          <input 
            class="ptr-slot" 
            type="checkbox" 
            ${isSlot ? "checked" : ""} 
          />
        </div>
        <p class="hint">
          Enable this option to allow the table to function as a slot machine.
        </p>
      </div>
    `;
  }
  
  /**
   * Generates the HTML for the 'slotCost' input.
   *
   * @param {number} slotCost - Current slot cost value.
   * @param {boolean} isSlot - Whether the slot machine is enabled.
   * @returns {string} - HTML string for the 'slotCost' input.
   */
  function getSlotCostHTML(slotCost, isSlot) {
    return `
      <div class="form-group">
        <label>Slot cost</label>
        <div class="form-fields">
          <input 
            class="ptr-slot-cost" 
            type="number" 
            value="${slotCost}" 
            min="0" 
            ${isSlot ? "" : "disabled"} 
          />
        </div>
        <p class="hint">
          Set the cost required to roll the slot machine. This value determines the amount needed for each spin.
        </p>
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
  