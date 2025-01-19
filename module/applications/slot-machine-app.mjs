import { gsap, TimelineLite } from "/scripts/greensock/esm/all.js";
import MODULE_CONST from "../constant.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class SlotMachineApp extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  constructor(options = {}) {
    super(options);
    this.#document = options.document;
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
    document: null,
  };

  /**
   * The Document instance associated with the application.
   * @type {Document}
   */
  get document() {
    return this.#document;
  }

  /** @type {Document} */
  #document;

  /** @type {TimelineLite} */
  #timeline;

  #currentIndex;

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
    return `Slot Machine: ${this.document.name}`;
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
    };
  }

  /**
   * Prepares results for display in the application.
   * @returns {Array<Object>} An array of result objects with icon and label.
   */
  _prepareResults() {
    const { DOCUMENT, COMPENDIUM, TEXT } = CONST.TABLE_RESULT_TYPES;

    const results = Array.from(this.document.results)
      .filter((r) => r.type !== TEXT)
      .map((r) => {
        let label;

        if (r.type === DOCUMENT) {
          label =
            game.collections.get(r.documentCollection)?.get(r.documentId)
              ?.name ?? null;
        } else if (r.type === COMPENDIUM) {
          label =
            game.packs.get(r.documentCollection)?.index.get(r.documentId)
              ?.name ?? null;
        }

        return {
          icon: r.icon,
          label,
          data: r.documentId,
        };
      });

    return results;
  }

  /* -------------------------------------------- */
  /*  Render Methods                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);

    // Set up the ring animation timeline
    this.#timeline = this.#setupRing(this.itemsElements, this.ringElement);
  }

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

    this._changeCurrentIndex(0);

    return gsap
      .timeline()
      .set(ring, { rotationX: 0 })
      .set(items, {
        rotateX: (i) => i * -angleIncrement, // Position items in a circle
        transformOrigin: `50% 50% -${radius}px`, // Set circle depth
        z: radius,
      });
  }

  /** @inheritDoc */
  _onRender(context, options) {
    super._onRender(context, options);

    this._performRingRoll({
      clearTimeline: false,
      rotationX: "-=360",
      duration: 3,
      ease: "power4.inOut",
      delay: 1,
    });
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
   * @param {string} itemImage
   * @param {string} itemName
   */
  _setItemAward(itemImage, itemName) {
    const img = this.element.querySelector(".reward-item.item-img");
    img.src = itemImage;
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

    const { results } = await this.document.draw({
      displayChat: false,
    });

    await this._rotateToItem(results[0].documentId, { rolls: 7, duration: 3 });
    this._setItemAward(results[0].icon, results[0].name);

    this.document.toMessage(results);
  }
}
