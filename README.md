# Slot Machine Roll Table Integration for FoundryVTT

This module introduces a **Slot Machine Interface** for rolling RollTables in FoundryVTT, providing an engaging visual and interactive experience.

## Key Features

1. **Slot Machine UI**: A visually appealing slot machine to represent Roll Table results.
2. **Actor Integration**: Links rolls to specific actors, ensuring contextual relevance.
3. **Customizable Animations**: Smooth, configurable animations using GSAP.
4. **Dynamic UI**: Automatically updates and renders item awards and actor states.

---

## Usage

1. **Setup**:
   - Install the module using the [manifest](https://github.com/joaquinpereyra98/ptr-slot/releases/latest/download/module.json) link or unzip the module.zip directly into your modules folder, look [releases](https://github.com/joaquinpereyra98/ptr-slot/releases).
   - Ensure the `ptr-slot` module is installed and enabled in FoundryVTT.
   - Lunch the world, navigate to *"Module Magnament"* menu, activate the module and restart the world.

2. **Use**:
   1.  Open the RollTable window, look for the options added by the module.
   2.  Check the checkbox to set the RollTable as SlotMachine.
   3.  Modify the cost of the roll and use the button incorporated in the footer of the window. 
   - Alternatively you can drag the RollTable to the Hotbar for automatic macro creation using the module api (see below).

---

## API

### `RollTable#drawSlotMachine`

The `drawSlotMachine` method is a utility function designed to render the a slot machine app. 

#### Parameters

- **options** (*Object*): An optional object to configure the behavior of the slot machine.

   - **actorUuid** (*String*) *Optional*: UUID of the actor to associate with the roll.
    
        If no uuid is provided, the firts selected token actor will be used by default.
#### Examples
**Case 1:** To launch the SlotMachine app linked to the selected token's actor:
```js
const table = await fromUuuid("uuid of the RollTable here");
await table.drawSlotMachine();
```
**Case 2:** To launch the SlotMachine app linked to the user's character:
```js
const table = await fromUuuid("uuid of the RollTable here");

const character = game.user.character;

await table.drawSlotMachine({actorUuid: character?.uuid });
```
**Case 3:** To launch the SlotMachine app linked to any actor using her uuid:
```js
const table = await fromUuuid("uuid of the RollTable here");

const uuid = "uuid of the actor here";

await table.drawSlotMachine({actorUuid: uuid });
```

---

## Dependencies
- FoundryVTT 12V+ compatibility.
- Pokemon Tabletop Reunited, FoundryVTT system.

---

## Reporting Issues or Suggestions
If you encounter any bugs or have suggestions for improvement, please report them on GitHub. Follow these steps:

1. Navigate to the GitHub repository for this project.
2. Go to the "Issues" tab.
3. Click on "New Issue."
4. Provide a clear and descriptive title for your issue.
5. Fill out the issue template with as much detail as possible, including steps to reproduce the bug or describe the suggestion.
6. Submit the issue.

This helps us track and address issues efficiently.

## Supporting the Project
You can support the development of this project in the following ways:
### Contribute via Pull Requests

Contributions are welcome! To contribute:

1. Fork the repository on GitHub.
1. Clone your fork locally.
1. Create a new branch for your feature or bugfix.
1. Make your changes and commit them with clear and descriptive messages.
2. Push your branch to your fork.
3. Submit a pull request to the main repository.

Your contributions will be reviewed and, if approved, merged into the project. Thank you for your support!

## Contact
If you need to get in touch, feel free to reach out through the following methods:
- GitHub Discussions: Use the Discussions tab on the GitHub repository to ask questions or share ideas.
- Email: You can email me directly at `joaquinpereyra98@gmail.com`. Please include "PTR-Slot Module" in the subject line for quick identification.
- Discord: Send me a Direct Message on my account `joaquinp98`.

Your feedback and questions are always welcome!