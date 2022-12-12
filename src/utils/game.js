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

      console.log(`Player ${p.playerNumber}: ${p.getActionCardsStr()}`);
      let toRedraw = prompt("Enter cards to redraw: ")
        .split(",")
        .map((x) => parseInt(x))
        .filter((x) => x);
      console.log(`Redrawing: ${toRedraw.join(",") || "None"}`);

      p.redrawCard(toRedraw);
      console.log(`Player ${p.playerNumber}: ${p.getActionCardsStr()}\n`);
    }

    let startingPlayer = 0;
    let turnNumber = 0;

    let currentTurn = 1 - startingPlayer;
    while (!this.players[0].lose && !this.players[1].lose) {
      if (this.players[0].ended && this.players[1].ended) {
        turnNumber++;
        console.log(`---------- TURN ${turnNumber} ----------`);

        for (let p of this.players) {
          p.startRollPhase();
          p.rollDice();

          console.log(`Player ${p.playerNumber}: ${p.getDiceStr()}`);
          let toReroll = prompt("Enter dice to reroll: ")
            .split(",")
            .map((x) => parseInt(x))
            .filter((x) => x);

          console.log(`Rerolling: ${toReroll.join(",") || "None"}`);
          console.log(`Player ${p.playerNumber}: ${p.getDiceStr()}\n`);

          p.rerollDice(toReroll);
        }
      } else {
        currentTurn = 1 - currentTurn;
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
    this.activeCharacter = 0;
    this.cardDeck = util.shuffle(cardDeck.slice()); // Action card deck
    this.trashPile = []; // Trash pile so we can reuse!

    this.dice = []; // Dice they roll every turn
    this.actionCards = []; // Action cards in hand

    this.ended = true; // If turn was ended or not
    this.limits = {}; // limits per turn - resets every turn

    this.lose = false;
  }

  rollDice() {
    for (let i = 0; i < MAX_DICE; i++) {
      this.dice.push(util.rollDice());
    }

    this.dice.sort((a, b) => {
      return util.rollDiceCompare(a) - util.rollDiceCompare(b);
    });
  }

  rerollDice(toReroll) {
    for (let i of toReroll
      .filter((x) => 0 < x && x <= MAX_DICE)
      .sort()
      .reverse()) {
      this.dice.splice(i - 1, 1);
      this.dice.push(util.rollDice());
    }

    this.dice.sort((a, b) => {
      return util.rollDiceCompare(a) - util.rollDiceCompare(b);
    });
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

  redrawCard(toRedraw) {
    for (let i of toRedraw
      .filter((x) => 0 < x && x <= STARTING_ACTION_AMOUNT)
      .sort()
      .reverse()) {
      this.trashPile.push(
        ...this.actionCards.splice(i - 1, 1).map((x) => {
          x.id;
        })
      );
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

  getActionCardsStr() {
    return `Your Action cards are ${this.actionCards
      .map((card, i) => `(${i + 1}) ${card.cardInfo.name}`)
      .join(", ")}`;
  }

  getDiceStr() {
    return `Your Dice are ${this.dice
      .map((d, i) => `(${i + 1}) ${d}`)
      .join(", ")}`;
  }
}

module.exports = GameBoard;
