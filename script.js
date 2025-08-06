const grid = document.getElementById("grid");
const coinsDisplay = document.getElementById("coins");
const multiplierBtn = document.getElementById("multiplierBtn");
const inventoryDisplay = document.getElementById("inventory");
const pickaxeInventoryList = document.getElementById("pickaxeInventoryList");
const sellBtn = document.getElementById("sellBtn");

const craftingModal = document.getElementById("craftingModal");
const inventoryModal = document.getElementById("inventoryModal");
const pickaxeModal = document.getElementById("pickaxeModal");

const openCraftingBtn = document.getElementById("openCraftingBtn");
const openInventoryBtn = document.getElementById("openInventoryBtn");
const openPickaxeBtn = document.getElementById("openPickaxeBtn");

const closeCraftingBtn = document.getElementById("closeCraftingBtn");
const closeInventoryBtn = document.getElementById("closeInventoryBtn");
const closePickaxeBtn = document.getElementById("closePickaxeBtn");

const craftingList = document.getElementById("craftingList");

let coins = 0;
let pickaxePower = 1;
let coinMultiplier = 1;
let multiplierCost = 500;
let currentPickaxe = null;

let inventory = {};
let pickaxeInventory = [];

const blockTypes = [
  { type: "rock", hp: 3, value: 1, chance: 0.4 },
  { type: "iron", hp: 6, value: 4, chance: 0.25 },
  { type: "gold", hp: 10, value: 7, chance: 0.15 },
  { type: "emerald", hp: 18, value: 15, chance: 0.1 },
  { type: "diamond", hp: 30, value: 30, chance: 0.07 },
  { type: "voidite", hp: 50, value: 60, chance: 0.03 }
];

const craftingRecipes = [
  {
    name: "Stone Pickaxe",
    costCoins: 25,
    costItems: { rock: 3 },
    pickaxePower: 2,
    requiresPickaxe: null,
  },
  {
    name: "Iron Pickaxe",
    costCoins: 50,
    costItems: { iron: 3 },
    pickaxePower: 4,
    requiresPickaxe: "Stone Pickaxe",
  },
  {
    name: "Gold Pickaxe",
    costCoins: 100,
    costItems: { gold: 5 },
    pickaxePower: 6,
    requiresPickaxe: "Iron Pickaxe",
  },
  {
    name: "Emerald Pickaxe",
    costCoins: 200,
    costItems: { emerald: 5 },
    pickaxePower: 10,
    requiresPickaxe: "Gold Pickaxe",
  },
  {
    name: "Diamond Pickaxe",
    costCoins: 500,
    costItems: { diamond: 5 },
    pickaxePower: 16,
    requiresPickaxe: "Emerald Pickaxe",
  },
  {
    name: "Voidite Pickaxe",
    costCoins: 1000,
    costItems: { voidite: 5 },
    pickaxePower: 25,
    requiresPickaxe: "Diamond Pickaxe",
  }
];

function getRandomBlockType() {
  const rand = Math.random();
  let total = 0;
  for (let block of blockTypes) {
    total += block.chance;
    if (rand < total) return block;
  }
  return blockTypes[0];
}

function createBlock() {
  const blockData = getRandomBlockType();
  const el = document.createElement("div");
  el.classList.add("block", blockData.type);
  el.dataset.hp = blockData.hp;
  el.dataset.value = blockData.value;
  el.innerText = blockData.hp;

  el.addEventListener("click", () => {
    let hp = parseInt(el.dataset.hp) - pickaxePower;
    if (hp <= 0) {
      const oreType = blockData.type.toLowerCase();
      inventory[oreType] = (inventory[oreType] || 0) + 1;
      updateInventoryDisplay();

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

function hasRequiredPickaxe(required) {
  if (!required) return true;
  return currentPickaxe === required;
}

function canCraft(recipe) {
  if (!hasRequiredPickaxe(recipe.requiresPickaxe)) return false;
  if (coins < recipe.costCoins) return false;
  for (const item in recipe.costItems) {
    if (!inventory[item] || inventory[item] < recipe.costItems[item]) return false;
  }
  return true;
}

function craftPickaxe(recipe) {
  if (!canCraft(recipe)) return;

  coins -= recipe.costCoins;
  for (const item in recipe.costItems) {
    inventory[item] -= recipe.costItems[item];
    if (inventory[item] <= 0) delete inventory[item];
  }

  pickaxePower = recipe.pickaxePower;
  currentPickaxe = recipe.name;
  pickaxeInventory.push(recipe.name);

  updateInventoryDisplay();
  updateCoinsDisplay();
  renderCraftingList();
  renderPickaxeInventory();
}

function updateInventoryDisplay() {
  inventoryDisplay.innerHTML = "";
  for (const item in inventory) {
    const li = document.createElement("li");
    li.textContent = `${item.charAt(0).toUpperCase() + item.slice(1)} x${inventory[item]}`;
    inventoryDisplay.appendChild(li);
  }
}

function updateCoinsDisplay() {
  coinsDisplay.textContent = coins;
}

function renderCraftingList() {
  craftingList.innerHTML = "";
  craftingRecipes.forEach(recipe => {
    const li = document.createElement("li");
    const costText = [];

    if (recipe.costCoins > 0) costText.push(`${recipe.costCoins} coins`);
    for (const item in recipe.costItems) {
      costText.push(`${recipe.costItems[item]} ${item}`);
    }
    if (recipe.requiresPickaxe) costText.push(`Requires: ${recipe.requiresPickaxe}`);

    li.textContent = `${recipe.name} — Cost: ${costText.join(", ")}`;

    const btn = document.createElement("button");
    btn.textContent = "Craft";
    btn.disabled = !canCraft(recipe);
    btn.addEventListener("click", () => craftPickaxe(recipe));

    li.appendChild(btn);
    craftingList.appendChild(li);
  });
}

function renderPickaxeInventory() {
  pickaxeInventoryList.innerHTML = "";
  pickaxeInventory.forEach(pickaxe => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = "Equip";
    btn.addEventListener("click", () => {
      currentPickaxe = pickaxe;
      const recipe = craftingRecipes.find(r => r.name === pickaxe);
      if (recipe) pickaxePower = recipe.pickaxePower;
    });

    li.textContent = pickaxe;
    li.appendChild(btn);
    pickaxeInventoryList.appendChild(li);
  });
}

multiplierBtn.addEventListener("click", () => {
  if (coins >= multiplierCost) {
    coins -= multiplierCost;
    coinMultiplier++;
    multiplierCost = Math.floor(multiplierCost * 2.2);
    multiplierBtn.textContent = `Increase Coin Multiplier (Cost: ${multiplierCost})`;
    updateCoinsDisplay();
  }
});

sellBtn.addEventListener("click", () => {
  let totalCoins = 0;
  for (const item in inventory) {
    const block = blockTypes.find(b => b.type === item);
    if (block) {
      totalCoins += block.value * inventory[item] * coinMultiplier;
    }
  }
  coins += totalCoins;
  inventory = {};
  updateInventoryDisplay();
  updateCoinsDisplay();
});

// Modal open/close
openCraftingBtn.onclick = () => craftingModal.style.display = "block";
openInventoryBtn.onclick = () => inventoryModal.style.display = "block";
openPickaxeBtn.onclick = () => pickaxeModal.style.display = "block";

closeCraftingBtn.onclick = () => craftingModal.style.display = "none";
closeInventoryBtn.onclick = () => inventoryModal.style.display = "none";
closePickaxeBtn.onclick = () => pickaxeModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === craftingModal) craftingModal.style.display = "none";
  if (e.target === inventoryModal) inventoryModal.style.display = "none";
  if (e.target === pickaxeModal) pickaxeModal.style.display = "none";
};

renderGrid();
renderCraftingList();
updateCoinsDisplay();
updateInventoryDisplay();
renderPickaxeInventory();
