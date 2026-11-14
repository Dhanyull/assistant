window.PQS = window.PQS || {};

(function () {
  const COLS = 5, ROWS = 3;
  const SYMBOLS = [
    { id: "coins",    icon: "coins",    name: "Gold Coins",      pay: [0, 0, 2, 5, 15],  skill: null,          sword: false },
    { id: "logs",     icon: "logs",     name: "Willow Logs",     pay: [0, 0, 2, 4, 12],  skill: "woodcutting", sword: false },
    { id: "ore",      icon: "ore",      name: "Iron Ore",        pay: [0, 0, 3, 6, 16],  skill: "mining",      sword: false },
    { id: "fish",     icon: "fish",     name: "River Fish",      pay: [0, 0, 2, 5, 14],  skill: "fishing",     sword: false },
    { id: "potion",   icon: "potion",   name: "Vital Flask",     pay: [0, 0, 3, 8, 20],  skill: null,          sword: false },
    { id: "scroll",   icon: "scroll",   name: "Old Scroll",      pay: [0, 0, 3, 8, 20],  skill: "magic",       sword: false },
    { id: "hat",      icon: "hat",      name: "Hexer's Hat",     pay: [0, 0, 5, 12, 30], skill: "magic",       sword: false },
    { id: "chest",    icon: "chest",    name: "Oak Chest",       pay: [0, 0, 4, 10, 25], skill: null,          sword: false },
    { id: "staff",    icon: "staff",    name: "Oak Staff",       pay: [0, 0, 4, 10, 28], skill: "magic",       sword: false },
    { id: "scimitar", icon: "scimitar", name: "Azure Scimitar",  pay: [0, 0, 6, 15, 40], skill: null,          sword: true },
    { id: "sigil",    icon: "sigil",    name: "Arcane Sigil",    pay: [0, 0, 8, 20, 50], skill: "magic",       sword: false, wild: true },
    { id: "dragon",   icon: "dragon",   name: "Drake Head",      pay: [0, 0, 10, 25, 80],skill: null,          sword: false }
  ];
  const SYM = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

  const LINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1]
  ];

  const STRIP_LEN = 24;
  let grid = [];
  let strips = [];
  let offsets = [];
  let targets = [];
  let spinning = false;
  let raf = 0;
  let cell = 64, gap = 6, pad = 8;
  let winCells = [];
  let winFlash = 0;

  function canvas() { return document.getElementById("reels"); }

  function pickSymbol() {
    const area = PQS.getArea();
    const entries = SYMBOLS.map((s) => [s.id, area.weights[s.id] || 2]);
    let total = 0;
    entries.forEach((e) => { total += e[1]; });
    let r = Math.random() * total;
    for (const [id, w] of entries) {
      r -= w;
      if (r <= 0) return id;
    }
    return "coins";
  }

  function fillStrip() {
    const arr = [];
    for (let i = 0; i < STRIP_LEN; i++) arr.push(pickSymbol());
    return arr;
  }

  function ensureGrid() {
    if (grid.length) return;
    grid = [];
    strips = [];
    offsets = [];
    targets = [];
    for (let c = 0; c < COLS; c++) {
      const col = [];
      const strip = fillStrip();
      strips.push(strip);
      offsets.push(0);
      targets.push(0);
      for (let r = 0; r < ROWS; r++) col.push(strip[r]);
      grid.push(col);
    }
  }

  function scaleLayout() {
    const c = canvas();
    if (!c) return;
    const w = c.clientWidth || 360;
    const h = c.clientHeight || 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const usableW = w - pad * 2;
    const usableH = h - pad * 2;
    cell = Math.floor(Math.min(usableW / COLS, usableH / ROWS) - 4);
    gap = Math.max(3, Math.floor(cell * 0.06));
  }

  function colX(i, w) {
    const total = COLS * cell + (COLS - 1) * gap;
    const left = Math.floor((w - total) / 2);
    return left + i * (cell + gap);
  }

  function rowY(r, h) {
    const total = ROWS * cell + (ROWS - 1) * gap;
    const top = Math.floor((h - total) / 2);
    return top + r * (cell + gap);
  }

  function drawSymbolInCell(ctx, id, x, y, size, highlight) {
    const area = PQS.getArea();
    ctx.fillStyle = area.reelBg2;
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = highlight ? "#f5d76a" : "rgba(0,0,0,.55)";
    ctx.lineWidth = highlight ? 3 : 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    if (highlight) {
      ctx.fillStyle = "rgba(245, 215, 106, 0.18)";
      ctx.fillRect(x, y, size, size);
    }
    const icon = (SYM[id] && SYM[id].icon) || id;
    PQS.drawSpriteFit(ctx, icon, x, y, size, 4);
  }

  function draw(now) {
    const c = canvas();
    if (!c) return;
    const w = c.clientWidth || 360;
    const h = c.clientHeight || 220;
    const ctx = c.getContext("2d");
    const area = PQS.getArea();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = area.reelBg;
    ctx.fillRect(0, 0, w, h);

    const patternSize = 16;
    ctx.strokeStyle = area.reelBg2;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    for (let y = 0; y < h; y += patternSize) {
      for (let x = 0; x < w; x += patternSize) {
        ctx.strokeRect(x + 2, y + 2, 8, 8);
      }
    }
    ctx.globalAlpha = 1;

    const step = cell + gap;
    const flashOn = winCells.length && Math.floor((now || 0) / 180) % 2 === 0;

    for (let i = 0; i < COLS; i++) {
      const x = colX(i, w);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, rowY(0, h), cell, ROWS * cell + (ROWS - 1) * gap);
      ctx.clip();

      const off = offsets[i] || 0;
      const base = Math.floor(off);
      const frac = off - base;
      const strip = strips[i];

      for (let r = -1; r <= ROWS; r++) {
        const idx = ((base + r) % strip.length + strip.length) % strip.length;
        const y = rowY(0, h) + r * step - frac * step;
        const id = strip[idx];
        let highlight = false;
        if (!spinning && flashOn) {
          const visRow = r;
          if (visRow >= 0 && visRow < ROWS) {
            highlight = winCells.some((wc) => wc.c === i && wc.r === visRow);
          }
        }
        drawSymbolInCell(ctx, id, x, y, cell, highlight);
      }
      ctx.restore();

      ctx.strokeStyle = "#2a180c";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, rowY(0, h) - 1, cell + 2, ROWS * cell + (ROWS - 1) * gap + 2);
    }

    if (spinning || (winCells.length && winFlash > (now || 0))) {
      raf = requestAnimationFrame(draw);
    }
  }

  function syncGridFromStrips() {
    for (let c = 0; c < COLS; c++) {
      const base = Math.round(offsets[c]) % strips[c].length;
      grid[c] = [];
      for (let r = 0; r < ROWS; r++) {
        const idx = (base + r + strips[c].length) % strips[c].length;
        grid[c][r] = strips[c][idx];
      }
    }
  }

  function evaluate() {
    const wins = [];
    let total = 0;
    let swords = 0;
    const cells = [];
    const skillGain = { woodcutting: 0, mining: 0, fishing: 0, magic: 0 };

    for (let li = 0; li < LINES.length; li++) {
      const line = LINES[li];
      const seq = line.map((row, col) => grid[col][row]);
      let face = null;
      for (let i = 0; i < seq.length; i++) {
        if (!SYM[seq[i]].wild) { face = seq[i]; break; }
      }
      if (!face) face = seq[0];
      let count = 0;
      for (let i = 0; i < seq.length; i++) {
        const s = SYM[seq[i]];
        if (seq[i] === face || s.wild) count++;
        else break;
      }
      if (count >= 3) {
        const pay = SYM[face].pay[count - 1] || 0;
        const amount = pay * PQS.getBet();
        total += amount;
        wins.push({ line: li, count, face, amount });
        for (let i = 0; i < count; i++) {
          cells.push({ c: i, r: line[i] });
          if (SYM[seq[i]].sword) swords++;
          const sk = SYM[seq[i]].skill;
          if (sk) skillGain[sk] += 8;
        }
        if (SYM[face].sword) swords += count;
      }
    }

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const s = SYM[grid[c][r]];
        if (s && s.skill) skillGain[s.skill] += 1;
      }
    }

    return { wins, total, swords, cells, skillGain };
  }

  function scaleMonster(def) {
    const lv = PQS.state.level;
    const area = PQS.getArea();
    const areaBonus = area.id === "crater" ? 1.4 : area.id === "dunes" ? 1.2 : 1;
    const hp = Math.round(def.hp * (0.85 + lv * 0.12) * areaBonus);
    const atk = Math.round(def.atk * (0.9 + lv * 0.08) * areaBonus);
    return { hp, atk };
  }

  function spawnMonster(forceBoss) {
    const area = PQS.getArea();
    const isBoss = forceBoss || ((PQS.state.kills + 1) % 5 === 0);
    const id = isBoss ? area.boss : area.monsters[Math.floor(Math.random() * area.monsters.length)];
    const def = PQS.MONSTERS[id];
    const sc = scaleMonster(def);
    PQS.state.monster = { id, hp: sc.hp, maxHp: sc.hp, atk: sc.atk, boss: !!def.boss };
    PQS.ui.renderMonster();
    PQS.ui.setResult((def.boss ? "A BOSS appears: " : "A wild ") + def.name + " approaches!");
  }

  function grantDrops(def, fromWin) {
    const got = [];
    (def.drops || []).forEach(([item, chance]) => {
      if (Math.random() < chance) {
        PQS.addLoot(item, 1);
        got.push(item);
      }
    });
    if (fromWin && fromWin.total > 0 && Math.random() < 0.35) {
      const lootIds = ["potion", "scroll", "logs", "ore", "fish", "gem", "key", "bread"];
      const item = lootIds[Math.floor(Math.random() * lootIds.length)];
      PQS.addLoot(item, 1);
      got.push(item);
    }
    return got;
  }

  function handleNotes(notes) {
    notes.forEach((n, i) => {
      setTimeout(() => {
        if (n.type === "level") PQS.ui.toastLevel(n.level);
        if (n.type === "area") PQS.ui.toastArea(n.area);
      }, 400 + i * 600);
    });
  }

  function applyCombat(result) {
    const m = PQS.state.monster;
    if (!m) spawnMonster();
    const mon = PQS.state.monster;
    const def = PQS.MONSTERS[mon.id];

    if (result.total > 0) {
      const base = Math.max(1, Math.round(result.total / PQS.getBet() * 3 + result.wins.length * 2));
      const dmg = base + result.swords * 4;
      mon.hp = Math.max(0, mon.hp - dmg);
      PQS.ui.float("-" + dmg, "hit");
      PQS.audio.play("hit");
      PQS.ui.renderMonster();

      if (mon.hp <= 0) {
        const coins = def.coins + Math.floor(PQS.getBet() * (def.boss ? 2 : 0.5));
        const xp = def.xp;
        PQS.addCoins(coins);
        const notes = PQS.addXP(xp);
        PQS.state.kills += 1;
        const drops = grantDrops(def, result);
        PQS.audio.play("kill");
        PQS.ui.float("+" + coins + "  +" + xp + " XP", "coins");
        const dropNames = drops.map((id) => (PQS.ITEMS[id] ? PQS.ITEMS[id].name : id));
        PQS.ui.setResult("Defeated " + def.name + "! +" + coins + " coins, +" + xp + " XP" +
          (dropNames.length ? ". Loot: " + dropNames.join(", ") : "."));
        handleNotes(notes);
        setTimeout(() => spawnMonster(), 700);
        return;
      }
    } else {
      const dmg = mon.atk;
      PQS.state.hp = Math.max(0, PQS.state.hp - dmg);
      PQS.ui.float("-" + dmg + " HP", "dmg");
      PQS.audio.play("hurt");
      if (PQS.state.hp <= 0) {
        const lost = Math.max(10, Math.floor(PQS.state.coins * 0.2));
        PQS.addCoins(-lost);
        PQS.healFull();
        PQS.state.monster = null;
        PQS.ui.toastDeath(lost);
        spawnMonster();
        return;
      }
    }
    PQS.ui.renderMonster();
  }

  function finishSpin() {
    spinning = false;
    for (let i = 0; i < COLS; i++) {
      const base = Math.round(offsets[i]);
      const start = Math.max(0, base - 2);
      strips[i] = strips[i].slice(start);
      offsets[i] -= start;
      targets[i] = offsets[i];
    }
    syncGridFromStrips();
    const result = evaluate();
    winCells = result.cells;
    winFlash = performance.now() + 1800;

    Object.keys(result.skillGain).forEach((sk) => {
      const amt = result.skillGain[sk];
      if (amt > 0) {
        const lv = PQS.addSkillXP(sk, amt);
        if (lv) PQS.ui.float(sk + " Lv " + lv, "xp");
      }
    });

    if (result.total > 0) {
      PQS.addCoins(result.total);
      const notes = PQS.addXP(Math.max(1, Math.round(result.total / PQS.getBet())));
      handleNotes(notes);
      if (result.total >= PQS.getBet() * 20) PQS.audio.play("bigwin");
      else PQS.audio.play("win");
      const best = result.wins.slice().sort((a, b) => b.amount - a.amount)[0];
      PQS.ui.setResult("WIN " + result.total + "! " + result.wins.length + " line" + (result.wins.length > 1 ? "s" : "") +
        (best ? " — " + SYM[best.face].name + " x" + best.count : "") +
        (result.swords ? ". Scimitar bonus damage!" : ""));
      PQS.ui.float("+" + result.total, "coins");
      if (Math.random() < 0.4) {
        const drops = grantDrops({ drops: [] }, result);
        if (drops.length) PQS.audio.play("drop");
      }
    } else {
      PQS.ui.setResult("No line. The enemy strikes!");
    }

    applyCombat(result);

    const refill = PQS.refillIfBroke();
    if (refill) setTimeout(() => PQS.ui.toastPurse(refill), 500);

    PQS.save();
    PQS.ui.renderHUD();
    const btn = document.getElementById("btnSpin");
    if (btn) btn.disabled = false;
    raf = requestAnimationFrame(draw);
  }

  function animateSpin(start) {
    const now = performance.now();
    let done = true;
    for (let i = 0; i < COLS; i++) {
      const delay = 180 * i;
      const dur = 900 + i * 220;
      const t = now - start - delay;
      if (t < 0) { done = false; continue; }
      const tgt = targets[i];
      if (t >= dur) {
        offsets[i] = tgt;
      } else {
        done = false;
        const p = t / dur;
        const eased = 1 - Math.pow(1 - p, 3);
        const startOff = tgt - (STRIP_LEN + 8 + i * 3);
        offsets[i] = startOff + (tgt - startOff) * eased;
        if (Math.random() < 0.08) PQS.audio.play("tick");
      }
    }
    draw(now);
    if (done) {
      PQS.audio.play("stop");
      finishSpin();
    } else {
      raf = requestAnimationFrame(() => animateSpin(start));
    }
  }

  function spin() {
    if (spinning) return;
    PQS.audio.unlock();
    const bet = PQS.getBet();
    if (PQS.state.coins < bet) {
      const n = PQS.refillIfBroke();
      if (n) PQS.ui.toastPurse(n);
      PQS.ui.renderHUD();
      return;
    }
    PQS.addCoins(-bet);
    PQS.ui.renderHUD();
    spinning = true;
    winCells = [];
    const btn = document.getElementById("btnSpin");
    if (btn) btn.disabled = true;
    PQS.audio.play("spin");
    PQS.ui.setResult("The reels whirl...");

    ensureGrid();
    for (let i = 0; i < COLS; i++) {
      const extra = fillStrip();
      strips[i] = strips[i].concat(extra);
      const stop = strips[i].length - ROWS - Math.floor(Math.random() * 6) - 1;
      targets[i] = stop;
    }
    animateSpin(performance.now());
  }

  function changeBet(dir) {
    if (spinning) return;
    const s = PQS.state;
    s.betIndex = Math.max(0, Math.min(PQS.BETS.length - 1, s.betIndex + dir));
    PQS.ui.renderHUD();
    PQS.save();
    PQS.audio.play("click");
  }

  PQS.slots = {
    spinning() { return spinning; },
    spin,
    changeBet,
    nextMonster() { spawnMonster(false); },
    forceBoss() { spawnMonster(true); },
    onShow() {
      ensureGrid();
      scaleLayout();
      PQS.ui.applyAreaTheme();
      if (!PQS.state.monster) spawnMonster();
      else PQS.ui.renderMonster();
      PQS.ui.renderHUD();
      draw(performance.now());
    },
    resize() {
      scaleLayout();
      draw(performance.now());
    }
  };

  PQS.registerGame({
    id: "slots",
    name: "Slots",
    blurb: "Spin reels to battle beasts and train skills",
    locked: false,
    icon: "tile_slots",
    comingSoon: "",
    open() { PQS.ui.showScreen("screenSlots"); },
    close() { PQS.ui.showScreen("screenHub"); }
  });
})();
