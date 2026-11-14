window.PQS = window.PQS || {};

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function setText(sel, text) { $$(sel).forEach((el) => { el.textContent = text; }); }
  function setWidth(sel, pct) { $$(sel).forEach((el) => { el.style.width = pct + "%"; }); }

  function buildMerlons() {
    $$(".merlons").forEach((row) => {
      if (row.childElementCount) return;
      const n = 9;
      for (let i = 0; i < n; i++) row.appendChild(document.createElement("span"));
    });
  }

  function renderSkills() {
    $$(".js-skills").forEach((box) => {
      box.innerHTML = "";
      PQS.SKILLS.forEach((def) => {
        const sk = PQS.state.skills[def.id];
        const need = PQS.skillXpToNext(sk.level);
        const el = document.createElement("div");
        el.className = "skill";
        const c = document.createElement("canvas");
        c.width = 20; c.height = 20;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        PQS.drawSpriteFit(ctx, def.icon, 0, 0, 20, 1);
        el.appendChild(c);
        const nm = document.createElement("span");
        nm.className = "s-name";
        nm.textContent = def.name;
        const lv = document.createElement("span");
        lv.className = "s-lv";
        lv.textContent = "Lv " + sk.level;
        const bar = document.createElement("div");
        bar.className = "s-bar";
        const i = document.createElement("i");
        i.style.width = Math.min(100, (sk.xp / need) * 100) + "%";
        bar.appendChild(i);
        el.appendChild(nm);
        el.appendChild(lv);
        el.appendChild(bar);
        box.appendChild(el);
      });
    });
  }

  function renderMute() {
    const label = PQS.state.muted ? "MUTED" : "SOUND";
    $$(".js-mute").forEach((btn) => {
      btn.textContent = label;
      btn.classList.toggle("muted", PQS.state.muted);
    });
  }

  PQS.ui = {
    $, $$,
    initChrome() {
      buildMerlons();
      $$(".js-crest").forEach((c) => PQS.paintCrest(c));
    },

    renderHUD() {
      const s = PQS.state;
      const need = PQS.xpToNext(s.level);
      const area = PQS.getArea();
      setText(".js-level", String(s.level));
      setText(".js-xp", "XP: " + s.xp.toLocaleString() + " / " + need.toLocaleString());
      setWidth(".js-xp-fill", Math.min(100, (s.xp / need) * 100));
      setText(".js-coins", s.coins.toLocaleString());
      setText(".js-area-name", area.short);
      setText(".js-area-biome", area.biome);
      const mhp = PQS.maxHp(s.level);
      setText(".js-player-hp", s.hp + "/" + mhp);
      setWidth(".js-player-hp-fill", Math.max(0, (s.hp / mhp) * 100));
      renderSkills();
      renderMute();
      const betEl = document.getElementById("betText");
      if (betEl) betEl.textContent = String(PQS.getBet());
    },

    renderMonster() {
      const m = PQS.state.monster;
      const canvas = document.getElementById("monsterSprite");
      const nameEl = document.getElementById("monsterName");
      if (!canvas || !m) return;
      const def = PQS.MONSTERS[m.id];
      if (nameEl) nameEl.textContent = (def.boss ? "BOSS  " : "") + def.name;
      setText(".js-monster-hp", m.hp + "/" + m.maxHp);
      setWidth(".js-monster-hp-fill", Math.max(0, (m.hp / m.maxHp) * 100));
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0a1210";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      PQS.drawSpriteFit(ctx, def.sprite, 0, 0, canvas.width, 4);
    },

    float(text, kind) {
      const layer = document.getElementById("floatLayer");
      if (!layer) return;
      const el = document.createElement("div");
      el.className = "floater " + (kind || "");
      el.textContent = text;
      layer.appendChild(el);
      setTimeout(() => el.remove(), 950);
    },

    setResult(text) {
      const el = document.getElementById("result");
      if (el) el.textContent = text;
    },

    applyAreaTheme() {
      const area = PQS.getArea();
      const frame = document.getElementById("reelFrame");
      if (frame) {
        frame.classList.remove("meadow", "dunes", "crater");
        frame.classList.add(area.theme);
      }
    },

    showScreen(id) {
      ["screenHub", "screenSlots", "screenGame"].forEach((sid) => {
        const el = document.getElementById(sid);
        if (el) el.classList.toggle("hidden", sid !== id);
      });
      if (id === "screenSlots" && PQS.slots) PQS.slots.onShow();
    },

    closeOverlay() {
      const ov = document.getElementById("overlay");
      if (ov) ov.classList.add("hidden");
    },

    openOverlay(html) {
      const ov = document.getElementById("overlay");
      const panel = document.getElementById("overlayPanel");
      panel.innerHTML = html;
      ov.classList.remove("hidden");
      panel.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => PQS.ui.closeOverlay()));
      return panel;
    },

    openBank() {
      const bank = PQS.state.bank;
      const ids = Object.keys(bank).filter((k) => bank[k] > 0);
      let body;
      if (!ids.length) {
        body = '<p class="bank-empty">Your bank chest is empty. Win spins and defeat monsters to fill it.</p>';
      } else {
        body = '<div class="bank-grid">' + ids.map((id) => {
          const it = PQS.ITEMS[id];
          return '<div class="bank-cell" data-item="' + id + '"><canvas width="32" height="32"></canvas><span class="nm">' +
            (it ? it.name : id) + '</span><span class="qty">×' + bank[id] + "</span></div>";
        }).join("") + "</div>";
      }
      const panel = PQS.ui.openOverlay("<h3>BANK CHEST</h3>" + body + '<div class="row-btns"><button data-close type="button">CLOSE</button></div>');
      panel.querySelectorAll(".bank-cell").forEach((cell) => {
        const id = cell.getAttribute("data-item");
        const it = PQS.ITEMS[id];
        const c = cell.querySelector("canvas");
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        PQS.drawSpriteFit(ctx, it ? it.icon : "chest", 0, 0, 32, 1);
      });
    },

    openMap() {
      const cur = PQS.state.area;
      const rows = PQS.AREAS.map((a) => {
        const unlocked = PQS.areaUnlocked(a);
        const current = a.id === cur;
        const rq = unlocked ? (current ? "You are here" : "Travel here") : ("Unlocks at level " + a.level);
        return '<button type="button" class="map-area' + (unlocked ? "" : " locked") + (current ? " current" : "") +
          '" data-area="' + a.id + '"' + (unlocked ? "" : " disabled") + ">" +
          '<canvas width="40" height="40" data-icon="tile_' + a.id + '"></canvas>' +
          '<span class="info"><span class="nm">' + a.name + '</span><span class="rq">' + rq + "</span></span></button>";
      }).join("");
      const panel = PQS.ui.openOverlay("<h3>WORLD MAP</h3><div class='map-list'>" + rows +
        "</div><div class='row-btns'><button data-close type='button'>CLOSE</button></div>");
      panel.querySelectorAll("canvas[data-icon]").forEach((c) => {
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        const spr = PQS.spriteCanvas(c.getAttribute("data-icon"), 2);
        if (spr) ctx.drawImage(spr, 0, Math.floor((40 - spr.height) / 2));
      });
      panel.querySelectorAll(".map-area:not(.locked)").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-area");
          if (id === PQS.state.area) { PQS.ui.closeOverlay(); return; }
          PQS.state.area = id;
          PQS.state.monster = null;
          PQS.save();
          PQS.ui.applyAreaTheme();
          if (PQS.slots) PQS.slots.nextMonster(true);
          PQS.ui.renderHUD();
          PQS.ui.closeOverlay();
          PQS.audio.play("click");
          PQS.ui.setResult("Traveled to " + PQS.getArea().name + ".");
        });
      });
    },

    openComingSoon(game) {
      PQS.ui.openOverlay(
        "<h3>" + game.name.toUpperCase() + "</h3>" +
        '<p>' + (game.comingSoon || "Coming soon.") + "</p>" +
        '<div class="row-btns"><button data-close type="button">BACK TO TAVERN</button></div>'
      );
    },

    toastLevel(level) {
      PQS.audio.play("level");
      PQS.ui.openOverlay(
        "<h3>LEVEL UP</h3><p>You are now level " + level + "! Your wounds are healed.</p>" +
        '<div class="row-btns"><button data-close type="button">ONWARD</button></div>'
      );
    },

    toastArea(area) {
      PQS.ui.openOverlay(
        "<h3>NEW AREA</h3><p>" + area.name + " is now unlocked on your map!</p>" +
        '<div class="row-btns"><button data-close type="button">OPEN MAP</button></div>'
      );
      const btn = document.querySelector("#overlayPanel button");
      if (btn) {
        btn.removeAttribute("data-close");
        btn.addEventListener("click", () => PQS.ui.openMap());
      }
    },

    toastDeath(lost) {
      PQS.audio.play("lose");
      PQS.ui.openOverlay(
        "<h3>YOU FALL</h3><p>The village healer drags you back to safety. You drop " + lost + " coins.</p>" +
        '<div class="row-btns"><button data-close type="button">I RISE AGAIN</button></div>'
      );
    },

    toastPurse(n) {
      PQS.ui.openOverlay(
        "<h3>VILLAGE PURSE</h3><p>A kind villager slips you " + n + " coins so you can keep playing. Free play only — no real money.</p>" +
        '<div class="row-btns"><button data-close type="button">THANKS</button></div>'
      );
    }
  };
})();
