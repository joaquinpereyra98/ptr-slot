import { gsap } from "/scripts/greensock/esm/all.js";

import MODULE_CONST from "../constant.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class SlotMachineDrawApp extends HandlebarsApplicationMixin(
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
      rollSingle: SlotMachineDrawApp.rollSingle,
    },
    document: null,
  };

  /**
   * The Document instance associated with the application.
   * @type {ClientDocument}
   */
  get document() {
    return this.#document;
  }

  #document;

  #timeline;

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
    const { DOCUMENT, COMPENDIUM } = CONST.TABLE_RESULT_TYPES;

    const results = Array.from(this.document.results).map((r) => {
      let label;

      if (r.type === DOCUMENT) {
        label =
          game.collections.get(r.documentCollection)?.get(r.documentId)?.name ??
          null;
      } else if (r.type === COMPENDIUM) {
        label =
          game.packs.get(r.documentCollection)?.index.get(r.documentId)?.name ??
          null;
      } else {
        label = r.text;
      }

      return {
        icon: r.icon,
        label,
      };
    });

    return results;
  }

  /** @inheritDoc */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);

    // Set up the ring animation timeline
    this.#timeline = this._setupRing(this.itemsElements, this.ringElement);
  }

  /**
   * Sets up the ring and items with their initial 3D positions.
   * @param {NodeList} items - The items to position in the ring.
   * @param {HTMLElement} ring - The ring element.
   * @returns {Timeline} The GSAP timeline for the animation.
   */
  _setupRing(items, ring) {
    const itemCount = items.length ?? 1;

    // Calculate the radius for the circular layout
    const radius = (itemCount * 100 + 120) / (2 * Math.PI);
    // Calculate the angle increment between items
    const angleIncrement = 360 / itemCount;
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

    // Perform the first roll when rendering the app
    this._performSingleRoll(1);
  }

  /**
   * Performs a single 360-degree roll of the ring.
   */
  _performSingleRoll(delay = 0) {
    this.#timeline.to(this.ringElement, {
      rotationX: "-=360",
      duration: 3,
      ease: "power4.inOut",
      delay,
    });
  }

  static rollSingle() {
    this._performSingleRoll();
  }
}
