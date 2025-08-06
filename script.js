const grid = document.getElementById("grid");
const coinsDisplay = document.getElementById("coins");
const multiplierBtn = document.getElementById("multiplierBtn");
const inventoryDisplay = document.getElementById("inventory");
const sellBtn = document.getElementById("sellBtn");
const toggleInventoryBtn = document.getElementById("toggleInventoryBtn");
const inventoryContainer = document.getElementById("inventoryContainer");

const toggleCraftingBtn = document.getElementById("toggleCraftingBtn");
const craftingList = document.getElementById("craftingList");

const togglePickaxeInventoryBtn = document.getElementById("togglePickaxeInventoryBtn");
const pickaxeInventoryContainer = document.getElementById("pickaxeInventoryContainer");
const pickaxeInventoryList = document.getElementById("pickaxeInventoryList");

let coins = 0;
let pickaxePower = 1;
let coinMultiplier = 1;
let multiplierCost = 500;

let inventory = {};
let ownedPickaxes = [];

const blockTypes = [
  { type: "rock", hp: 3, value: 1, chance: 0.4 },
  { type: "iron", hp: 6, value: 4, chance: 0.25 },
  { type: "gold", hp: 10, value: 7, chance: 0.15 },
  { type: "emerald", hp: 18, value: 15, chance: 0.1 },
  { type: "diamond", hp: 30, value: 30, chance: 0.07 },
  { type: "voidite", hp: 50, value: 60, chance: 0.03 }
];

// Updated Crafting recipes for pickaxes of each ore
const craftingRecipes = [
  {
    name: "Stone Pickaxe",
    costCoins: 25,
    costItems: { rock: 3 },
    pickaxePower: 2,
    requiresPickaxe: false,
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
    pickaxePower: 7,
    requiresPickaxe: "Iron Pickaxe",
  },
  {
    name: "Emerald Pickaxe",
    costCoins: 250,
    costItems: { emerald: 7 },
    pickaxePower: 12,
    requiresPickaxe: "Gold Pickaxe",
  },
  {
    name: "Diamond Pickaxe",
    costCoins: 500,
    costItems: { diamond: 10 },
    pickaxePower: 20,
    requiresPickaxe: "Emerald Pickaxe",
  },
  {
    name: "Voidite Pickaxe",
    costCoins: 1000,
    costItems: { voidite: 15 },
    pickaxePower: 35,
    requiresPickaxe: "Diamond Pickaxe",
  },
];

let currentPickaxe = null;

function getRandomBlockType() {
  const rand = Math.random();
  let total = 0;
  for (let block of blockTypes) {
    total += block.chance;
    if (rand < total) return block;
  }
  return blockTypes[0];
}

function updateInventoryDisplay() {
  inventoryDisplay.innerHTML = "";
  for (const ore in inventory) {
    const name = ore.charAt(0).toUpperCase() + ore.slice(1);
    const li = document.createElement("li");
    li.textContent = `${name} x${inventory[ore]}`;
    inventoryDisplay.appendChild(li);
  }
}

function updateCoinsDisplay() {
  coinsDisplay.textContent = coins;
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
      renderCraftingList();
      renderPickaxeInventory();

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

function hasRequiredPickaxe(requirement) {
  if (!requirement) return true;
  return currentPickaxe === requirement;
}

function canCraft(recipe) {
  if (!hasRequiredPickaxe(recipe.requiresPickaxe)) {
    return false;
  }
  if (coins < recipe.costCoins) {
    return false;
  }
  for (const item in recipe.costItems) {
    if (!inventory[item] || inventory[item] < recipe.costItems[item]) {
      return false;
    }
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

  if (!ownedPickaxes.includes(recipe.name)) {
    ownedPickaxes.push(recipe.name);
  }

  updateInventoryDisplay();
  updateCoinsDisplay();
  renderCraftingList();
  renderPickaxeInventory();
}

function renderCraftingList() {
  craftingList.innerHTML = "";
  craftingRecipes.forEach((recipe) => {
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

  ownedPickaxes.forEach((pickaxeName) => {
    const li = document.createElement("li");
    li.textContent = pickaxeName;

    if (pickaxeName === currentPickaxe) {
      li.classList.add("current");
      li.textContent += " (Equipped)";
    }

    li.addEventListener("click", () => {
      currentPickaxe = pickaxeName;
      const recipe = craftingRecipes.find(r => r.name === pickaxeName);
      if (recipe) {
        pickaxePower = recipe.pickaxePower;
      }
      renderPickaxeInventory();
      renderCraftingList();
    });

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
  let totalCoinsGained = 0;
  for (const ore in inventory) {
    const oreData = blockTypes.find(b => b.type === ore);
    if (oreData) {
      totalCoinsGained += oreData.value * inventory[ore] * coinMultiplier;
    }
  }
  coins += totalCoinsGained;
  inventory = {};
  updateInventoryDisplay();
  updateCoinsDisplay();
});

toggleInventoryBtn.addEventListener("click", () => {
  if (inventoryContainer.style.display === "none") {
    inventoryContainer.style.display = "block";
    toggleInventoryBtn.textContent = "Inventory ▲";
  } else {
    inventoryContainer.style.display = "none";
    toggleInventoryBtn.textContent = "Inventory ▼";
  }
});

toggleCraftingBtn.addEventListener("click", () => {
  if (craftingList.style.display === "none") {
    craftingList.style.display = "block";
    toggleCraftingBtn.textContent = "Craft Pickaxe ▲";
  } else {
    craftingList.style.display = "none";
    toggleCraftingBtn.textContent = "Craft Pickaxe ▼";
  }
});

togglePickaxeInventoryBtn.addEventListener("click", () => {
  if (pickaxeInventoryContainer.style.display === "none") {
    pickaxeInventoryContainer.style.display = "block";
    togglePickaxeInventoryBtn.textContent = "Pickaxes ▲";
  } else {
    pickaxeInventoryContainer.style.display = "none";
    togglePickaxeInventoryBtn.textContent = "Pickaxes ▼";
  }
});

currentPickaxe = null;

renderGrid();
renderCraftingList();
renderPickaxeInventory();
updateCoinsDisplay();
updateInventoryDisplay();
multiplierBtn.textContent = `Increase Coin Multiplier (Cost: ${multiplierCost})`;
