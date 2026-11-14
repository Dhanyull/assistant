window.PQS = window.PQS || {};

PQS.games = {};
PQS.gameOrder = [];

PQS.registerGame = function (def) {
  if (!def || !def.id) throw new Error("Game needs an id");
  PQS.games[def.id] = Object.assign({
    name: def.id,
    blurb: "",
    locked: true,
    icon: "tile_slots",
    comingSoon: "The croupier is still setting this table. Come back soon, adventurer.",
    open() {},
    close() {}
  }, def);
  if (!PQS.gameOrder.includes(def.id)) PQS.gameOrder.push(def.id);
};

PQS.getGame = function (id) { return PQS.games[id]; };
PQS.listGames = function () { return PQS.gameOrder.map((id) => PQS.games[id]); };
