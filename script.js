const grid = document.getElementById("grid");
const coinsDisplay = document.getElementById("coins");

const inventoryDisplay = document.getElementById("inventory");
const pickaxeInventoryDisplay = document.getElementById("pickaxeInventory");
const sellBtn = document.getElementById("sellBtn");

const openInventoryBtn = document.getElementById("openInventoryBtn");
const inventoryModal = document.getElementById("inventoryModal");
const closeInventoryBtn = document.getElementById("closeInventoryBtn");

const craftingList = document.getElementById("craftingList");
const openCraftingBtn = document.getElementById("openCraftingBtn");
const craftingPopup = document.getElementById("craftingPopup");
const closeCraftingBtn = document.getElementById("closeCraftingBtn");

const optionsModal = document.getElementById("optionsModal");
const openOptionsBtn = document.getElementById("openOptionsBtn");
const closeOptionsBtn = document.getElementById("closeOptionsBtn");
const wipeSaveBtn = document.getElementById("wipeSaveBtn");
const openCodesBtn = document.getElementById("openCodesBtn");

const codesModal = document.getElementById("codesModal");
const closeCodesBtn = document.getElementById("closeCodesBtn");
const submitCodeBtn = document.getElementById("submitCodeBtn");
const codeInput = document.getElementById("codeInput");
const codeMessage = document.getElementById("codeMessage");

const tabOres = document.getElementById("tabOres");
const tabPickaxes = document.getElementById("tabPickaxes");

let coins = 0;
let coinMultiplier = 1;

let inventory = {};
let pickaxeInventory = [];
let currentPickaxe = null;
let pickaxePower = 1;

const blockTypes = [
  { type: "rock", hp: 3, value: 1, chance: 0.4 },
  { type: "iron", hp: 6, value: 4, chance: 0.25 },
  { type: "gold", hp: 10, value: 7, chance: 0.15 },
  { type: "emerald", hp: 18, value: 15, chance: 0.1 },
  { type: "diamond", hp: 30, value: 30, chance: 0.07 },
  { type: "voidite", hp: 50, value: 60, chance: 0.03 }
];

const craftingRecipes = blockTypes.map((block, index) => ({
  name: `${block.type.charAt(0).toUpperCase() + block.type.slice(1)} Pickaxe`,
  costCoins: 25 + index * 50,
  costItems: { [block.type]: 3 },
  pickaxePower: 2 + index * 2,
  requiresPickaxe: index === 0 ? false : `${blockTypes[index - 1].type.charAt(0).toUpperCase() + blockTypes[index - 1].type.slice(1)} Pickaxe`
}));

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
  el.innerText = blockData.hp;

  el.addEventListener("click", () => {
    let hp = parseInt(el.dataset.hp) - pickaxePower;
    if (hp <= 0) {
      const oreType = blockData.type.toLowerCase();
      inventory[oreType] = (inventory[oreType] || 0) + 1;
      updateInventory();
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

function updateInventory() {
  inventoryDisplay.innerHTML = "";
  pickaxeInventoryDisplay.innerHTML = "";

  for (const ore in inventory) {
    const capitalizedOre = ore.charAt(0).toUpperCase() + ore.slice(1);
    const li = document.createElement("li");
    li.textContent = `${capitalizedOre} x${inventory[ore]}`;
    inventoryDisplay.appendChild(li);
  }

  pickaxeInventory.forEach(pickaxe => {
    const li = document.createElement("li");
    li.textContent = pickaxe.name;
    pickaxeInventoryDisplay.appendChild(li);
  });

  saveGame();
}

function updateCoins() {
  coinsDisplay.textContent = coins;
  saveGame();
}

function canCraft(recipe) {
  if (recipe.requiresPickaxe && !pickaxeInventory.some(p => p.name === recipe.requiresPickaxe)) return false;
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
  pickaxeInventory.push({ name: recipe.name, power: recipe.pickaxePower });

  updateInventory();
  updateCoins();
  renderCraftingList();
}

function renderCraftingList() {
  craftingList.innerHTML = "";
  craftingRecipes.forEach(recipe => {
    const li = document.createElement("li");
    li.textContent = `${recipe.name} — ${recipe.costCoins} coins + ${Object.entries(recipe.costItems).map(([k,v]) => `${v} ${k}`).join(", ")}`;

    const btn = document.createElement("button");
    btn.textContent = "Craft";
    btn.disabled = !canCraft(recipe);
    btn.addEventListener("click", () => craftPickaxe(recipe));

    li.appendChild(btn);
    craftingList.appendChild(li);
  });
}

sellBtn.addEventListener("click", () => {
  let total = 0;
  for (const ore in inventory) {
    const block = blockTypes.find(b => b.type === ore);
    if (block) total += block.value * inventory[ore] * coinMultiplier;
  }
  coins += total;
  inventory = {};
  updateInventory();
  updateCoins();
});

openInventoryBtn.addEventListener("click", () => {
  inventoryModal.style.display = "block";
});

closeInventoryBtn.addEventListener("click", () => {
  inventoryModal.style.display = "none";
});

openCraftingBtn.addEventListener("click", () => {
  craftingPopup.style.display = "block";
});

closeCraftingBtn.addEventListener("click", () => {
  craftingPopup.style.display = "none";
});

openOptionsBtn.addEventListener("click", () => {
  optionsModal.style.display = "block";
});

closeOptionsBtn.addEventListener("click", () => {
  optionsModal.style.display = "none";
});

openCodesBtn.addEventListener("click", () => {
  codesModal.style.display = "block";
});

closeCodesBtn.addEventListener("click", () => {
  codesModal.style.display = "none";
});

wipeSaveBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to wipe your saved data? This cannot be undone.")) {
    localStorage.removeItem("lowdepths");
    coins = 0;
    coinMultiplier = 1;
    inventory = {};
    pickaxeInventory = [];
    currentPickaxe = null;
    pickaxePower = 1;
    updateInventory();
    updateCoins();
    renderCraftingList();
    optionsModal.style.display = "none";
  }
});

window.addEventListener("click", (e) => {
  if (e.target === inventoryModal) inventoryModal.style.display = "none";
  if (e.target === craftingPopup) craftingPopup.style.display = "none";
  if (e.target === optionsModal) optionsModal.style.display = "none";
  if (e.target === codesModal) codesModal.style.display = "none";
});

// Tabs logic
tabOres.addEventListener("click", () => {
  tabOres.classList.add("active");
  tabPickaxes.classList.remove("active");
  inventoryDisplay.style.display = "block";
  pickaxeInventoryDisplay.style.display = "none";
});

tabPickaxes.addEventListener("click", () => {
  tabPickaxes.classList.add("active");
  tabOres.classList.remove("active");
  inventoryDisplay.style.display = "none";
  pickaxeInventoryDisplay.style.display = "block";
});

// Cheat code logic
submitCodeBtn.addEventListener("click", () => {
  const code = codeInput.value.trim().toLowerCase();
  if (code === "aug6") {
    coins += 1000;
    codeMessage.textContent = "Code 'aug6' redeemed! +1000 coins.";
  } else if (code === "zayanmolla") {
    coins += 5000;
    codeMessage.textContent = "Code 'zayanmolla' redeemed! +5000 coins.";
  } else {
    codeMessage.textContent = "Invalid code!";
  }
  updateCoins();
  codeInput.value = "";
});

// Save/load game
function saveGame() {
  localStorage.setItem("lowdepths", JSON.stringify({
    coins,
    coinMultiplier,
    inventory,
    pickaxeInventory,
    currentPickaxe,
    pickaxePower
  }));
}

function loadGame() {
  const saved = localStorage.getItem("lowdepths");
  if (!saved) return;
  const data = JSON.parse(saved);
  coins = data.coins || 0;
  coinMultiplier = data.coinMultiplier || 1;
  inventory = data.inventory || {};
  pickaxeInventory = data.pickaxeInventory || [];
  currentPickaxe = data.currentPickaxe || null;
  pickaxePower = data.pickaxePower || 1;
}

loadGame();
renderGrid();
renderCraftingList();
updateInventory();
updateCoins();
