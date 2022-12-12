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

let rollDice = () =>
  ["any", "anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"][
    Math.floor(Math.random() * 8)
  ];

module.exports = {
  shuffle,
  rollDice,
};