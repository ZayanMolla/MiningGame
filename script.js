const grid = document.getElementById("grid");
const coinsDisplay = document.getElementById("coins");
const upgradeBtn = document.getElementById("upgradeBtn");

let coins = 0;
let pickaxePower = 1;
let upgradeCost = 20;

const blockTypes = [
  { type: "rock", hp: 3, value: 1 },
  { type: "coal", hp: 6, value: 3 },
  { type: "gold", hp: 10, value: 7 },
];

function createBlock() {
  const blockData = blockTypes[Math.floor(Math.random() * blockTypes.length)];
  const el = document.createElement("div");
  el.classList.add("block", blockData.type);
  el.dataset.hp = blockData.hp;
  el.dataset.value = blockData.value;
  el.innerText = blockData.hp;

  el.addEventListener("click", () => {
    let hp = parseInt(el.dataset.hp) - pickaxePower;
    if (hp <= 0) {
      coins += parseInt(el.dataset.value);
      coinsDisplay.textContent = coins;

      // trigger pop animation then replace
      el.classList.add("pop");
      el.style.pointerEvents = "none";
      setTimeout(() => {
        el.replaceWith(createBlock());
      }, 200);
    } else {
      el.dataset.hp = hp;
      el.innerText = hp;
    }
  });

  return el;
}

function renderGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    grid.appendChild(createBlock());
  }
}

upgradeBtn.addEventListener("click", () => {
  if (coins >= upgradeCost) {
    coins -= upgradeCost;
    pickaxePower++;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    upgradeBtn.textContent = `Upgrade Pickaxe (Cost: ${upgradeCost})`;
    coinsDisplay.textContent = coins;
  }
});

renderGrid();