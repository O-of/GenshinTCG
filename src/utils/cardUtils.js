const actionCards = require("../data/action_cards.json");
const characters = require("../data/characters.json");
const combatStatus = require("../data/combat_status.json");
const summons = require("../data/summons.json");

class CharacterCard {
  constructor(name) {
    this.characterData = characters[name];

    this.hp = 10;
    this.element = null;

    this.weapon = null;
    this.artifact = null;
  }
}

class ActionCard {
  constructor(id) {
    this.id = id;
    this.cardInfo = actionCards[id];
  }
}

class CombatStatus {
  constructor(id) {}
}

class Summon {
  constructor(id) {}
}

const createCharacter = (name) => {
  return new CharacterCard(name);
};

const createCard = (id) => {
  return new ActionCard(id);
};

const createSummon = (id) => {
  return new Summon(id);
};

const createCombatStatus = (id) => {
  return new CombatStatus(id);
};

module.exports = {
  createCharacter,
  createCard,
  createSummon,
  createCombatStatus,
};
