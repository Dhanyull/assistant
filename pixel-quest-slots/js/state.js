window.PQS = window.PQS || {};

PQS.SAVE_KEY = "pixelQuest_save_v1";
PQS.BETS = [5, 10, 25, 50, 100, 250];

PQS.SKILLS = [
  { id: "woodcutting", name: "Woodcut", icon: "axe" },
  { id: "mining", name: "Mining", icon: "pick" },
  { id: "fishing", name: "Fishing", icon: "rod" },
  { id: "magic", name: "Magic", icon: "staff" }
];

PQS.ITEMS = {
  bones: { name: "Bones", icon: "bones" },
  bread: { name: "Village Bread", icon: "bread" },
  logs: { name: "Willow Logs", icon: "logs" },
  ore: { name: "Iron Ore", icon: "ore" },
  fish: { name: "River Fish", icon: "fish" },
  potion: { name: "Vital Flask", icon: "potion" },
  scroll: { name: "Old Scroll", icon: "scroll" },
  gem: { name: "Green Topaz", icon: "gem" },
  ruby: { name: "Crimson Ruby", icon: "ruby" },
  hide: { name: "Beast Hide", icon: "hide" },
  cactus: { name: "Cactus Spine", icon: "cactus" },
  ash: { name: "Fire Ash", icon: "ash" },
  key: { name: "Brass Key", icon: "key" },
  trophy: { name: "Champion Cup", icon: "trophy" },
  scimitar: { name: "Azure Scimitar", icon: "scimitar" },
  hat: { name: "Hexer's Hat", icon: "hat" },
  chest: { name: "Oak Chest", icon: "chest" },
  sigil: { name: "Arcane Sigil", icon: "sigil" },
  coins_item: { name: "Coin Purse", icon: "coins" },
  dragonhide: { name: "Drake Hide", icon: "dragon" }
};

PQS.AREAS = [
  {
    id: "meadow",
    name: "Willowbend Meadow",
    short: "Willowbend",
    biome: "Meadow",
    level: 1,
    theme: "meadow",
    reelBg: "#0d3a28",
    reelBg2: "#0a2e20",
    monsters: ["rat", "goblin", "wolf"],
    boss: "warden",
    weights: { coins: 8, logs: 7, fish: 6, potion: 5, scroll: 5, hat: 4, chest: 4, ore: 3, staff: 3, scimitar: 3, sigil: 2, dragon: 1 }
  },
  {
    id: "dunes",
    name: "Sunscorch Dunes",
    short: "Sunscorch",
    biome: "Desert",
    level: 5,
    theme: "dunes",
    reelBg: "#4a3410",
    reelBg2: "#3a280c",
    monsters: ["scorpion", "lizard", "golem"],
    boss: "colossus",
    weights: { coins: 7, ore: 7, cactus: 0, potion: 5, scroll: 4, hat: 4, chest: 5, logs: 3, fish: 2, staff: 3, scimitar: 4, sigil: 3, dragon: 2 }
  },
  {
    id: "crater",
    name: "Emberwaste Crater",
    short: "Emberwaste",
    biome: "Volcano",
    level: 10,
    theme: "crater",
    reelBg: "#2a1010",
    reelBg2: "#1a0808",
    monsters: ["imp", "bat", "drake"],
    boss: "wyrm",
    weights: { coins: 6, ash: 0, potion: 4, scroll: 4, hat: 4, chest: 5, ore: 5, logs: 2, fish: 2, staff: 5, scimitar: 5, sigil: 4, dragon: 3 }
  }
];

PQS.MONSTERS = {
  rat:      { name: "Giant Rat",      sprite: "rat",      hp: 18,  atk: 3,  coins: 12, xp: 8,  drops: [["bones", 0.8], ["bread", 0.2]] },
  goblin:   { name: "Meadow Goblin",  sprite: "goblin",   hp: 28,  atk: 5,  coins: 20, xp: 14, drops: [["bones", 0.5], ["potion", 0.2], ["key", 0.1]] },
  wolf:     { name: "Grey Wolf",      sprite: "wolf",     hp: 36,  atk: 7,  coins: 28, xp: 18, drops: [["hide", 0.55], ["bones", 0.4]] },
  warden:   { name: "Willow Warden",  sprite: "warden",   hp: 70,  atk: 10, coins: 80, xp: 50, drops: [["trophy", 0.6], ["gem", 0.5], ["hide", 0.4]], boss: true },
  scorpion: { name: "Dune Scorpion",  sprite: "scorpion", hp: 40,  atk: 8,  coins: 32, xp: 22, drops: [["cactus", 0.6], ["ore", 0.3]] },
  lizard:   { name: "Sand Lizard",    sprite: "lizard",   hp: 48,  atk: 9,  coins: 40, xp: 26, drops: [["hide", 0.5], ["cactus", 0.3]] },
  golem:    { name: "Sand Golem",     sprite: "golem",    hp: 62,  atk: 11, coins: 55, xp: 34, drops: [["ore", 0.7], ["gem", 0.25]] },
  colossus: { name: "Dune Colossus",  sprite: "colossus", hp: 110, atk: 14, coins: 140,xp: 80, drops: [["trophy", 0.7], ["ruby", 0.5], ["ore", 0.6]], boss: true },
  imp:      { name: "Fire Imp",       sprite: "imp",      hp: 55,  atk: 11, coins: 50, xp: 32, drops: [["ash", 0.7], ["potion", 0.2]] },
  bat:      { name: "Ash Bat",        sprite: "bat",      hp: 64,  atk: 12, coins: 58, xp: 36, drops: [["ash", 0.5], ["hide", 0.3]] },
  drake:    { name: "Lava Drake",     sprite: "drake",    hp: 80,  atk: 15, coins: 75, xp: 45, drops: [["dragonhide", 0.45], ["ash", 0.4]] },
  wyrm:     { name: "Cinder Wyrm",    sprite: "wyrm",     hp: 160, atk: 18, coins: 220,xp: 120,drops: [["trophy", 0.8], ["ruby", 0.6], ["dragonhide", 0.5], ["sigil", 0.3]], boss: true }
};

function defaultState() {
  const skills = {};
  PQS.SKILLS.forEach((s) => { skills[s.id] = { level: 1, xp: 0 }; });
  return {
    coins: 500,
    betIndex: 1,
    level: 1,
    xp: 0,
    hp: 30,
    area: "meadow",
    skills,
    bank: {},
    kills: 0,
    muted: false,
    monster: null
  };
}

function maxHp(level) { return 25 + level * 5; }
function xpToNext(level) { return Math.floor(40 * level + 12 * level * level); }
function skillXpToNext(level) { return Math.floor(25 * level + 8 * level * level); }

PQS.xpToNext = xpToNext;
PQS.skillXpToNext = skillXpToNext;
PQS.maxHp = maxHp;

PQS.state = defaultState();

PQS.getArea = function (id) {
  return PQS.AREAS.find((a) => a.id === (id || PQS.state.area)) || PQS.AREAS[0];
};

PQS.areaUnlocked = function (area) {
  return PQS.state.level >= area.level;
};

PQS.save = function () {
  try {
    const s = PQS.state;
    localStorage.setItem(PQS.SAVE_KEY, JSON.stringify({
      coins: s.coins, betIndex: s.betIndex, level: s.level, xp: s.xp,
      hp: s.hp, area: s.area, skills: s.skills, bank: s.bank,
      kills: s.kills, muted: s.muted
    }));
  } catch (e) {}
};

PQS.load = function () {
  try {
    const raw = localStorage.getItem(PQS.SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    const s = PQS.state;
    if (typeof d.coins === "number") s.coins = d.coins;
    if (typeof d.betIndex === "number") s.betIndex = d.betIndex;
    if (typeof d.level === "number") s.level = d.level;
    if (typeof d.xp === "number") s.xp = d.xp;
    if (typeof d.hp === "number") s.hp = d.hp;
    if (typeof d.area === "string" && PQS.AREAS.some((a) => a.id === d.area)) s.area = d.area;
    if (d.skills && typeof d.skills === "object") {
      PQS.SKILLS.forEach((sk) => {
        if (d.skills[sk.id]) s.skills[sk.id] = {
          level: d.skills[sk.id].level || 1,
          xp: d.skills[sk.id].xp || 0
        };
      });
    }
    if (d.bank && typeof d.bank === "object") s.bank = d.bank;
    if (typeof d.kills === "number") s.kills = d.kills;
    if (typeof d.muted === "boolean") s.muted = d.muted;
    s.hp = Math.min(s.hp, maxHp(s.level));
    s.hp = Math.max(1, s.hp);
  } catch (e) {}
};

PQS.getBet = function () { return PQS.BETS[PQS.state.betIndex] || 10; };

PQS.addCoins = function (n) {
  PQS.state.coins = Math.max(0, Math.floor(PQS.state.coins + n));
  return PQS.state.coins;
};

PQS.addLoot = function (itemId, qty) {
  if (!PQS.ITEMS[itemId]) return;
  qty = qty || 1;
  PQS.state.bank[itemId] = (PQS.state.bank[itemId] || 0) + qty;
};

PQS.addXP = function (amount) {
  const notes = [];
  const s = PQS.state;
  s.xp += amount;
  while (s.xp >= xpToNext(s.level)) {
    s.xp -= xpToNext(s.level);
    s.level += 1;
    s.hp = maxHp(s.level);
    notes.push({ type: "level", level: s.level });
    const newly = PQS.AREAS.filter((a) => a.level === s.level);
    newly.forEach((a) => notes.push({ type: "area", area: a }));
  }
  return notes;
};

PQS.addSkillXP = function (skillId, amount) {
  const sk = PQS.state.skills[skillId];
  if (!sk) return null;
  sk.xp += amount;
  let leveled = false;
  while (sk.xp >= skillXpToNext(sk.level)) {
    sk.xp -= skillXpToNext(sk.level);
    sk.level += 1;
    leveled = true;
  }
  return leveled ? sk.level : null;
};

PQS.refillIfBroke = function () {
  const minBet = PQS.BETS[0];
  if (PQS.state.coins < minBet) {
    PQS.state.coins += 200;
    return 200;
  }
  return 0;
};

PQS.healFull = function () { PQS.state.hp = maxHp(PQS.state.level); };
