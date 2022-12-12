let shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const DICE = [
  "any",
  "anemo",
  "cryo",
  "dendro",
  "electro",
  "geo",
  "hydro",
  "pyro",
];

let rollDice = () => DICE[Math.floor(Math.random() * 8)];

let rollDiceCompare = (dice) => {
  return DICE.indexOf(dice);
};

module.exports = {
  shuffle,
  rollDice,
  rollDiceCompare
};
