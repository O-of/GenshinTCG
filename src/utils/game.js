const prompt = require("prompt-sync")();
const util = require("./utils");
const { createCharacter, createCard } = require("./cardUtils");

const MAX_DICE = 8;
const MAX_ACTION_CARDS = 10;
const STARTING_ACTION_AMOUNT = 5;

class GameBoard {
  constructor(player1, player2) {
    this.players = [
      new Player(this, 0, player1.primaryCards, player1.cardDeck),
      new Player(this, 1, player2.primaryCards, player2.cardDeck),
    ];
  }

  run() {
    // Initial 5 cards
    for (let p of this.players) {
      p.drawCard(STARTING_ACTION_AMOUNT);

      console.log(
        `Player ${
          p.playerNumber
        }: Your Action Cards are ${p.getActionCardsStr()}`
      );
      let toRedraw = prompt("Enter cards to redraw: ")
        .split(",")
        .map((x) => parseInt(x))
        .filter((x) => x);
      console.log(`Redrawing: ${toRedraw.join(",") || "None"}`);

      p.redrawCard(toRedraw);
      console.log(
        `Player ${
          p.playerNumber
        }: Your Action Cards are ${p.getActionCardsStr()}\n`
      );
    }

    let startingPlayer = 0;
    let turnNumber = 0;

    let currentTurn = 0;
    while (!this.players[0].lose && !this.players[1].lose) {
      if (this.players[0].ended && this.players[1].ended) {
        turnNumber++;
        currentTurn = 1 - startingPlayer;

        console.log(`---------- TURN ${turnNumber} ----------`);

        for (let p of this.players) {
          p.startRollPhase();
          p.rollDice();

          console.log(`Player ${p.playerNumber}: Your Dice ${p.getDiceStr()}`);
          let toReroll = prompt("Enter dice to reroll: ")
            .split(",")
            .map((x) => parseInt(x))
            .filter((x) => x);

          console.log(`Rerolling: ${toReroll.join(",") || "None"}`);
          console.log(
            `Player ${p.playerNumber}: Your Dice ${p.getDiceStr()}\n`
          );

          p.rerollDice(toReroll);
        }
      } else {
        currentTurn = 1 - currentTurn;
        let p = this.players[currentTurn];
        p.drawCard(2);

        while (true) {
          console.log(
            `Opponent Characters:\n${this.players[
              1 - currentTurn
            ].getCharacterStr()}\n\nYour Characters:\n${p.getCharacterStr()}\n`
          );
          console.log(`Your Dice: ${p.getDiceStr()}`);
          console.log(`Your Action Cards: ${p.getActionCardsStr()}\n`);
          console.log(
            `Player ${currentTurn}, what to do: (1) Use Action Card (2) Tune Dice (3) Attack (4) Switch (5) end`
          );

          let action = parseInt(prompt("> "));

          if (action === 1) {
          } else if (action === 2) {
          } else if (action === 3) {
            console.log(`Enter dice to tune: ${p.getDiceStr()}`);
            let dIndex = parseInt(prompt("> "));
            if (!p.validToTune(dIndex)) {
              console.log("Try again.");
              continue;
            }

            console.log(`Enter card to sacrifice: ${p.getActionCardsStr()}`);
            let cIndex = parseInt(prompt("> "));

            if (p.validToSacrifice(cIndex)) {
              p.tuneDice(dIndex, cIndex);
            } else {
              console.log("Try again.");
            }
          } else if (action === 4) {
            console.log(`Enter character to switch to\n${p.getCharacterStr()}`);
            let cIndex = parseInt(prompt("> "));
            if (!p.validToSwitch(cIndex)) {
              console.log("Try again.");
              continue;
            }

            console.log(`Enter dice to switch to: ${p.getDiceStr()}`);
            let dIndex = parseInt(prompt("> "));

            if (0 < dIndex && dIndex <= p.dice.length) {
              p.switchCharacter(cIndex, dIndex);
              break;
            } else {
              console.log("Try again.");
            }
          } else if (action === 5) {
            console.log(this.players[1 - currentTurn].ended);
            if (!this.players[1 - currentTurn].ended) {
              startingPlayer = currentTurn;
            }
            p.endAttackPhase();
            break;
          } else {
            console.log("Please try again");
          }
        }
      }
    }
  }
}

class Player {
  // primaryCards = [name, name, name]
  // cardDeck = [name, name, name, name]
  constructor(gameBoard, playerNumber, primaryCards, cardDeck) {
    this.gameBoard = gameBoard;
    this.playerNumber = playerNumber;

    this.primaryCards = primaryCards.map(createCharacter); // Primary characters who are doing things
    this.activeCharacterIndex = 0;
    this.cardDeck = util.shuffle(cardDeck.slice()); // Action card deck
    this.trashPile = []; // Trash pile so we can reuse!

    this.dice = []; // Dice they roll every turn
    this.actionCards = []; // Action cards in hand

    this.ended = true; // If turn was ended or not
    this.limits = {}; // limits per turn - resets every turn

    this.lose = false;
  }

  get activeCharacter() {
    return this.primaryCards[this.activeCharacterIndex];
  }

  sortDice() {
    this.dice.sort((a, b) => {
      return util.rollDiceCompare(a) - util.rollDiceCompare(b);
    });
  }

  rollDice() {
    for (let i = 0; i < MAX_DICE; i++) {
      this.dice.push(util.rollDice());
    }

    this.sortDice();
  }

  rerollDice(toReroll) {
    for (let i of toReroll
      .filter((x) => 0 < x && x <= MAX_DICE)
      .sort()
      .reverse()) {
      this.dice.splice(i - 1, 1);
      this.dice.push(util.rollDice());
    }

    this.sortDice();
  }

  drawCard(amount) {
    for (let i = 0; i < amount; i++) {
      if (this.actionCards.length > MAX_ACTION_CARDS) return;
      if (!this.cardDeck.length) {
        this.cardDeck = util.shuffle(this.trashPile);
        this.trashPile = [];
      }

      if (this.cardDeck.length) {
        this.actionCards.push(createCard(this.cardDeck.shift()));
      }
    }
  }

  discardCard(cardIndex) {
    this.trashPile.push(
      ...this.actionCards.splice(cardIndex - 1, 1).map((x) => {
        x.id;
      })
    );
  }

  redrawCard(toRedraw) {
    for (let i of toRedraw
      .filter((x) => 0 < x && x <= STARTING_ACTION_AMOUNT)
      .sort()
      .reverse()) {
      this.discardCard(i);
      this.drawCard(1);
    }
  }

  // Resets everything for a new turn, next will be rolling the actual dice
  startRollPhase() {
    this.ended = false;
    this.dice = [];
    this.limits = {};
  }

  // Starts the attack phase, misc events
  startAttackPhase() {
    // start turn event
  }

  // Ends your current turn
  endAttackPhase() {
    this.ended = true;

    // end turn event
  }

  // Attack character
  attackCharacter(attackId) {
    // Check if can use dice
    // Return false if can't, otherwise use dice
    // Use attack on other character
    // this.activeCharacter.attack(attackId, this.gameBoard.getPlayer(1 - playerNumber))
  }

  // Receive an Attack
  receiveAttack(amount) {}

  // Use action card
  useActionCard(index) {}

  getCharacterStr() {
    return `${this.primaryCards
      .map(
        (c, i) =>
          `${i === this.activeCharacterIndex ? "\x1b[1m" : ""}(${
            i + 1
          }) ${c.toString()}\x1b[0m`
      )
      .join("\n")}`;
  }

  getActionCardsStr() {
    return `${this.actionCards
      .map((card, i) => `(${i + 1}) ${card.cardInfo.name}`)
      .join(", ")}`;
  }

  getDiceStr() {
    return `${this.dice.map((d, i) => `(${i + 1}) ${d}`).join(", ")}`;
  }

  validToSwitch(characterIndex) {
    return (
      this.primaryCards[characterIndex - 1]?.hp > 0 &&
      characterIndex !== this.activeCharacterIndex
    );
  }

  switchCharacter(characterIndex, diceIndex) {
    if (
      this.validToSwitch(characterIndex) &&
      0 < diceIndex &&
      diceIndex <= this.dice.length
    ) {
      this.activeCharacterIndex = characterIndex - 1;
      this.dice.splice(diceIndex - 1, 1);
    }
  }

  validToTune(diceIndex) {
    return (
      this.dice[diceIndex - 1] !== "any" &&
      this.dice[diceIndex - 1] !== this.activeCharacter.characterData.element
    );
  }

  tuneDice(diceIndex, cardIndex) {
    if (this.validToTune(diceIndex) && this.validToSacrifice(cardIndex)) {
      this.dice[diceIndex - 1] = this.activeCharacter.characterData.element;
      this.discardCard(cardIndex);
      this.sortDice();
    }
  }

  validToSacrifice(cardIndex) {
    return 0 < cardIndex && cardIndex <= this.actionCards.length;
  }
}

module.exports = GameBoard;
