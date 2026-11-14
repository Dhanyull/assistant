window.PQS = window.PQS || {};

PQS.registerGame({
  id: "blackjack",
  name: "Blackjack",
  blurb: "Beat the tavern dealer to 21",
  locked: true,
  icon: "tile_blackjack",
  comingSoon: "The dealer is still shuffling a fresh deck of painted cards. Blackjack tables open in a later update."
});

PQS.registerGame({
  id: "wheel",
  name: "Prize Wheel",
  blurb: "Spin the carnival prize wheel",
  locked: true,
  icon: "tile_wheel",
  comingSoon: "The prize wheel is being oiled and painted with new wedges. Come back when the fair returns."
});

PQS.registerGame({
  id: "roulette",
  name: "Roulette",
  blurb: "Call a color and watch the ball",
  locked: true,
  icon: "tile_roulette",
  comingSoon: "The ivory ball is missing and the wheelwright is carving a new one. Roulette will open soon."
});

PQS.registerGame({
  id: "poker",
  name: "Poker",
  blurb: "Wager on a five-card hand",
  locked: true,
  icon: "tile_poker",
  comingSoon: "A rowdy adventuring party still holds this table. Poker night returns in a later update."
});

PQS.registerGame({
  id: "scratch",
  name: "Scratch Cards",
  blurb: "Scratch a lucky tavern ticket",
  locked: true,
  icon: "tile_scratch",
  comingSoon: "The scribe is still inking a fresh batch of lucky tickets. Scratch cards are coming soon."
});

function renderHubTiles() {
  const grid = document.getElementById("gameGrid");
  if (!grid) return;
  grid.innerHTML = "";
  PQS.listGames().forEach((game) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "game-tile" + (game.locked ? " locked" : " open");
    btn.setAttribute("data-game", game.id);
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#140e0a";
    ctx.fillRect(0, 0, 64, 64);
    PQS.drawSpriteFit(ctx, game.icon, 0, 0, 64, 2);
    const name = document.createElement("span");
    name.className = "tile-name";
    name.textContent = game.name;
    const st = document.createElement("span");
    st.className = "tile-status";
    st.textContent = game.locked ? "Coming Soon" : "Open";
    btn.appendChild(c);
    btn.appendChild(name);
    btn.appendChild(st);
    btn.addEventListener("click", () => {
      PQS.audio.unlock();
      PQS.audio.play("click");
      if (game.locked) PQS.ui.openComingSoon(game);
      else if (typeof game.open === "function") game.open();
    });
    grid.appendChild(btn);
  });
}

function bindShared() {
  document.querySelectorAll(".js-bank").forEach((b) => b.addEventListener("click", () => {
    PQS.audio.unlock(); PQS.audio.play("click"); PQS.ui.openBank();
  }));
  document.querySelectorAll(".js-map").forEach((b) => b.addEventListener("click", () => {
    PQS.audio.unlock(); PQS.audio.play("click"); PQS.ui.openMap();
  }));
  document.querySelectorAll(".js-mute").forEach((b) => b.addEventListener("click", () => {
    PQS.audio.unlock();
    PQS.state.muted = PQS.audio.toggle();
    PQS.audio.setMuted(PQS.state.muted);
    PQS.save();
    PQS.ui.renderHUD();
  }));
  document.querySelectorAll(".js-tavern").forEach((b) => b.addEventListener("click", () => {
    if (PQS.slots && PQS.slots.spinning()) return;
    PQS.audio.unlock(); PQS.audio.play("click");
    PQS.ui.showScreen("screenHub");
    PQS.ui.renderHUD();
  }));

  const minus = document.getElementById("betMinus");
  const plus = document.getElementById("betPlus");
  const spin = document.getElementById("btnSpin");
  if (minus) minus.addEventListener("click", () => PQS.slots.changeBet(-1));
  if (plus) plus.addEventListener("click", () => PQS.slots.changeBet(1));
  if (spin) spin.addEventListener("click", () => PQS.slots.spin());

  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") PQS.ui.closeOverlay();
  });

  window.addEventListener("resize", () => {
    if (PQS.slots) PQS.slots.resize();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") PQS.save();
  });
}

function boot() {
  PQS.load();
  PQS.audio.setMuted(!!PQS.state.muted);
  PQS.ui.initChrome();
  renderHubTiles();
  bindShared();
  PQS.ui.renderHUD();
  PQS.ui.applyAreaTheme();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  window.__PQS = {
    ready: true,
    getState() { return PQS.state; },
    goHub() { PQS.ui.showScreen("screenHub"); },
    goSlots() { PQS.ui.showScreen("screenSlots"); },
    spin() { return PQS.slots.spin(); },
    spinning() { return PQS.slots.spinning(); },
    setCoins(n) { PQS.state.coins = n; PQS.ui.renderHUD(); },
    setLevel(n) { PQS.state.level = n; PQS.ui.renderHUD(); }
  };
}

document.addEventListener("DOMContentLoaded", boot);
