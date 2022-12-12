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
    this.startingPlayer = 0;
    this.turnNumber = 0;
  }

  run() {
    // Initial 5 cards
    for (let p of this.players) {
      p.drawCard(STARTING_ACTION_AMOUNT);

      console.log(`Player ${p.playerNumber}: ${p.getActionCardsStr()}`);
      let toRedraw = prompt("Which cards to redraw: ")
        .split(",")
        .map(parseInt)
        .filter((x) => x);
      console.log(`Redrawing ${toRedraw.join(",")}`);

      p.redrawCard(toRedraw);
      console.log(`Player ${p.playerNumber}: ${p.getActionCardsStr()}`);
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

    this.ended = false; // If turn was ended or not
    this.limits = {}; // limits per turn - resets every turn
  }

  rollDice() {
    for (let i = 0; i < MAX_DICE; i++) {
      this.dice.push(util.rollDice());
    }
    this.dice.sort();
  }

  rerollDice(toReroll) {
    for (let i of toReroll
      .filter((x) => 0 < x && x <= MAX_DICE)
      .sort()
      .reverse()) {
      this.dice.splice(i - 1, 1);
      this.dice.push(util.rollDice());
    }

    this.dice.sort();
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
      .map((card, i) => "(" + (i + 1) + ") " + card.cardInfo.name)
      .join(", ")}`;
  }
}

module.exports = GameBoard;
