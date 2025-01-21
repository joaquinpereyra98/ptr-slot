import { gsap, TimelineLite } from "/scripts/greensock/esm/all.js";
import MODULE_CONST from "../constant.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class SlotMachineApp extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  constructor(options = {}) {
    super(options);
    this.#rollTable = options.rollTable;
    this.#actor = options.actor;
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["ptr-slot"],
    window: {
      icon: "fa-solid fa-slot-machine",
      minimizable: true,
      resizable: true,
    },
    position: {
      width: 450,
    },
    actions: {
      rollSingle: SlotMachineApp.rollSingle,
    },
    rollTable: null,
    actor: null,
  };

  /**
   * The RollTable instance associated with the application.
   * @type {Document}
   */
  get rollTable() {
    return this.#rollTable;
  }

  get actor() {
    return this.#actor;
  }

  /** @type {Object} */
  awardItem = null;

  /** @type {Document} */
  #rollTable;

  /** @type {Document} */
  #actor;

  /** @type {TimelineLite} */
  #timeline;

  /** @type {Number} */
  #currentIndex = 0;

  /**
   * The ring element used for animation.
   * @returns {HTMLElement} The ring DOM element.
   */
  get ringElement() {
    return this.element.querySelector(".ring");
  }

  /**
   * The item elements to be animated within the ring.
   * @returns {NodeList} A NodeList of item elements.
   */
  get itemsElements() {
    return this.element.querySelectorAll(".item");
  }

  /** @override */
  static PARTS = {
    body: {
      template: `modules/${MODULE_CONST.moduleId}/templates/body-part.hbs`,
    },
  };

  /** @inheritDoc */
  get title() {
    return `Slot Machine: ${this.rollTable.name}`;
  }

  /* -------------------------------------------- */
  /*  Context Methods                             */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const baseContext = super._prepareContext(options);
    return {
      ...baseContext,
      results: this._prepareResults(),
      actorMoney: this.actor.system.money ?? 0,
      tableCost: this.rollTable.getFlag("ptr-slot", "slotCost") ?? 0,
      awardItem: this.awardItem,
      actorAnchor: this.actor.toAnchor().outerHTML,
    };
  }

  /**
   * Prepares results for display in the application.
   * @returns {Array<Object>} An array of result objects with icon and label.
   */
  _prepareResults() {
    const { TEXT } = CONST.TABLE_RESULT_TYPES;

    const results = Array.from(this.rollTable.results)
      .filter((r) => r.type !== TEXT)
      .map((r) => ({
        icon: r.icon,
        label: r.text,
        data: r.documentId,
      }));

    if(results.length === 0) return results;

    while (results.length < 10) results.push(...results);

    return results;
  }

  /* -------------------------------------------- */
  /*  Render Methods                              */
  /* -------------------------------------------- */

  /**
   * Sets up the ring and items with their initial 3D positions.
   * @param {NodeList} items - The items to position in the ring.
   * @param {HTMLElement} ring - The ring element.
   * @returns {TimelineLite} The GSAP timeline for the animation.
   * @private
   */
  #setupRing(items, ring) {
    const itemCount = items.length ?? 1;

    // Calculate the radius for the circular layout
    const radius = (itemCount * 100 + 120) / (2 * Math.PI);
    // Calculate the angle increment between items
    const angleIncrement = 360 / itemCount;

    const currentIndex = this.#currentIndex ?? 0;

    this._changeCurrentIndex(currentIndex);

    return gsap
      .timeline()
      .set(ring, { rotationX: currentIndex * angleIncrement })
      .set(items, {
        rotateX: (i) => i * -angleIncrement, // Position items in a circle
        transformOrigin: `50% 50% -${radius}px`, // Set circle depth
        z: radius,
      });
  }

  /** @inheritDoc */
  _onRender(context, options) {
    super._onRender(context, options);
    this.#timeline = this.#setupRing(this.itemsElements, this.ringElement);
  }

  /* -------------------------------------------- */
  /*  GSAP Animations Handlers                    */
  /* -------------------------------------------- */

  /**
   * Animates a single roll of the ring to a specified angle with configurable timing and easing options.
   *
   * @private
   * @param {Object} options - Configuration options for the animation.
   * @param {boolean} [options.clearTimeline=true] - Whether to clear the timeline before starting the animation.
   * @param {number|string|Function} [options.rotationX=0] - The angle of the rotation of the ring on the X-axis.
   * @param {number|string|Function} [options.delay=0] - The delay before the animation starts.
   * @param {number|string|Function} [options.duration=3] - The duration of the animation.
   * @param {string} [options.ease=""] - The easing function to use for the animation.
   * @param {Function} [options.onComplete=()=>{}] - A callback function executed after the animation completes.
   */
  async _performRingRoll({
    clearTimeline = true,
    rotationX = 0,
    delay = 0,
    duration = 3,
    ease = "",
    onComplete = () => {},
  }) {
    this._disableInteraction();

    if (clearTimeline) this.#timeline.clear();

    await this.#timeline.to(this.ringElement, {
      rotationX,
      delay,
      duration,
      ease,
      onComplete: () => {
        this._enableInteraction();
        onComplete();
      },
    });
  }

  /**
   * Rotate the ring to position the item with the given documentId at the front,
   * with multiple rolls before stopping.
   * @param {string} documentId - The data-document-id to search for.
   * @param {Object} options
   * @param {number} [options.rolls=3] - The number of full rolls before stopping.
   * @param {number} [options.duration=3] - Duration of the animation in seconds.
   */
  async _rotateToItem(documentId, { rolls = 3, duration = 3 } = {}) {
    const items = this.itemsElements;

    // Get the index of the target item
    const targetIndex = Array.from(items).findIndex(
      (i) => i.dataset.documentId === documentId
    );

    // Calculate the angle increment and total rotation
    const angleIncrement = 360 / items.length;

    const targetRotation = (targetIndex - this.#currentIndex) * angleIncrement;

    const totalRotation = rolls * 360 - targetRotation;

    await this._performRingRoll({ 
      rotationX: `-=${totalRotation}`,
      duration,
      ease: "elastic.out",
      delay: 0.5,
      onComplete: () => {
        this._changeCurrentIndex(targetIndex);
      },
    });
  }

  /* -------------------------------------------- */

  /**
   * Method for disabled all the important interaction bafore animations are being performed
   * @private
   */
  _disableInteraction() {
    this.element
      .querySelectorAll(".slot-btn")
      .forEach((btn) => (btn.disabled = true));
  }

  /**
   * Method to enable all important interaction when animations have already been performed.
   * @private
   */
  _enableInteraction() {
    this.element
      .querySelectorAll(".slot-btn")
      .forEach((btn) => (btn.disabled = false));
  }

  /* -------------------------------------------- */

  /**
   *
   * @param {Item} item
   */
  async _setItemAward(item) {
    const awardItem = {
      img: item.img,
      anchor: item.toAnchor().outerHTML,
      uuid: item.uuid,
    };
    this.awardItem = awardItem;

    this.render();
  }

  /**
   *
   * @param {number} newIndex
   */
  _changeCurrentIndex(newIndex) {
    if (!Number.isInteger(newIndex)) return;

    const oldItem = Array.from(this.itemsElements)[this.#currentIndex];
    oldItem?.classList?.remove("active");
    const currentItem = Array.from(this.itemsElements)[newIndex];
    currentItem?.classList?.add("active");

    this.#currentIndex = newIndex;
  }

  async _updateActorMoney(newValue) {
    const moneyInput = this.element.querySelector(
      ".input-slotmachine.actorMoney"
    );
    moneyInput.value = newValue;

    return await this.actor.update({ "system.money": newValue });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle header control button clicks to display actor portrait artwork.
   * @this {SlotMachineApp}
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defines the [data-action]
   */
  static async rollSingle(event, target) {
    event.preventDefault();

    const actorMoney = this.actor.system.money ?? 0;
    const tableCost = this.rollTable.getFlag("ptr-slot", "slotCost") ?? 0;

    if (actorMoney < tableCost) {
      return;
    }

    await this._updateActorMoney(actorMoney - tableCost);
    ui.notifications.info(`${MODULE_CONST.moduleId} | The amount of money of actor, ${this.actor.name}, was reduced by ${tableCost}`)

    const { results } = await this.rollTable.draw({
      displayChat: false,
    });

    await this._rotateToItem(results[0].documentId, { rolls: 12, duration: 4 });

    const item = await getDocFromResult(results[0]);

    const actorItem = await this.#createItemOnActor(item);
    
    this._setItemAward(actorItem);
  }

  async #createItemOnActor(item) {
    const itemOnActor = this.actor.items.getName(item.name);
    if (itemOnActor) {
      ui.notifications.info(`${MODULE_CONST.moduleId} | The quantity of the item ${itemOnActor.name} was increased by one on actor ${this.actor.name}`);
      return await itemOnActor.update({
        "system.quantity": Number(itemOnActor.system?.quantity) + 1,
      });
    } else {
      ui.notifications.info(`${MODULE_CONST.moduleId} | A new item ${item.name} was created on actor ${this.actor.name}`);
      return await Item.implementation.create(item.toObject(), {
        parent: this.actor,
      });
    }
  }
}

async function getDocFromResult(result) {
  const { DOCUMENT, COMPENDIUM } = CONST.TABLE_RESULT_TYPES;
  return result.type === DOCUMENT
    ? game.collections.get(result.documentCollection)?.get(result.documentId)
    : result.type === COMPENDIUM
    ? await game.packs
        .get(result.documentCollection)
        ?.getDocument(result.documentId)
    : null;
}
