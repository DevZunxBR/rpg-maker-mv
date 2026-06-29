'use strict';
// Construtor de listas de comando do RPG Maker MV com controle CORRETO de indentação.
// O MV navega ramificações pela indentação e por marcadores: condição 111/411(else)/412(fim);
// escolhas 102/402(when)/403(cancel)/404(fim). Esta classe emite tudo certinho.

// Passos de rota de movimento (usados em cenas como os soldados marchando).
const R = {
  down: () => ({ code: 1, parameters: [] }),
  left: () => ({ code: 2, parameters: [] }),
  right: () => ({ code: 3, parameters: [] }),
  up: () => ({ code: 4, parameters: [] }),
  toward: () => ({ code: 10, parameters: [] }),
  away: () => ({ code: 11, parameters: [] }),
  forward: () => ({ code: 12, parameters: [] }),
  turnDown: () => ({ code: 16, parameters: [] }),
  turnLeft: () => ({ code: 17, parameters: [] }),
  turnRight: () => ({ code: 18, parameters: [] }),
  turnUp: () => ({ code: 19, parameters: [] }),
  wait: (f = 30) => ({ code: 15, parameters: [f] }),
  speed: (s = 4) => ({ code: 29, parameters: [s] }),
  freq: (f = 4) => ({ code: 30, parameters: [f] }),
  image: (name, idx = 0) => ({ code: 41, parameters: [name, idx] }),
  walkOn: () => ({ code: 33, parameters: [] }),
  throughOn: () => ({ code: 37, parameters: [] }),
  throughOff: () => ({ code: 38, parameters: [] }),
  transpOn: () => ({ code: 39, parameters: [] }),
  transpOff: () => ({ code: 40, parameters: [] }),
  jump: (dx, dy) => ({ code: 14, parameters: [dx, dy] }),
  se: (name, opt = {}) => ({ code: 44, parameters: [{ name, volume: 90, pitch: 100, pan: 0, ...opt }] }),
};

class Script {
  constructor() { this.list = []; this.indent = 0; }

  raw(code, parameters = []) {
    this.list.push({ code, indent: this.indent, parameters });
    return this;
  }

  // -------- texto --------
  text(lines, { face = '', faceIndex = 0, background = 0, position = 2 } = {}) {
    this.raw(101, [face, faceIndex, background, position]);
    for (const ln of [].concat(lines)) this.raw(401, [ln]);
    return this;
  }
  scroll(lines, { speed = 2, noFast = false } = {}) {
    this.raw(105, [speed, noFast]);
    for (const ln of [].concat(lines)) this.raw(405, [ln]);
    return this;
  }

  // -------- escolhas --------
  // labels: string[]; handlers: array de fn(s) na mesma ordem; opts.cancel: fn ou índice
  choice(labels, handlers, { defaultType = 0, cancel = -2, background = 0, positionType = 2 } = {}) {
    // cancelType: -2 ramo "Cancelar", -1 desabilitado, ou índice
    let cancelType = -2;
    if (typeof cancel === 'number') cancelType = cancel;
    else if (typeof cancel !== 'function') cancelType = -1;
    this.raw(102, [labels.slice(), cancelType, defaultType, positionType, background]);
    labels.forEach((label, i) => {
      this.raw(402, [i, label]);
      this.indent++;
      if (handlers[i]) handlers[i](this);
      this.indent--;
    });
    if (typeof cancel === 'function') {
      this.raw(403, []);
      this.indent++;
      cancel(this);
      this.indent--;
    }
    this.raw(404, []);
    return this;
  }

  // -------- condições --------
  ifSwitch(id, thenFn, elseFn, on = true) {
    this.raw(111, [0, id, on ? 0 : 1]);
    this._branch(thenFn, elseFn);
    return this;
  }
  // op: 0 =, 1 >=, 2 <=, 3 >, 4 <, 5 !=
  ifVar(id, value, op, thenFn, elseFn) {
    this.raw(111, [1, id, 0, value, op]);
    this._branch(thenFn, elseFn);
    return this;
  }
  ifItem(itemId, thenFn, elseFn) {
    this.raw(111, [4, itemId]);
    this._branch(thenFn, elseFn);
    return this;
  }
  _branch(thenFn, elseFn) {
    this.indent++;
    if (thenFn) thenFn(this);
    this.indent--;
    if (elseFn) {
      this.raw(411, []);
      this.indent++;
      elseFn(this);
      this.indent--;
    }
    this.raw(412, []);
  }

  // -------- variáveis / switches --------
  setSwitch(id, on = true) { return this.raw(121, [id, id, on ? 0 : 1]); }
  setVar(id, value, op = 0) { return this.raw(122, [id, id, op, 0, value]); }

  // -------- itens / ouro / grupo --------
  gold(value, op = 0) { return this.raw(125, [op, 0, value]); }      // 0 ganhar, 1 perder
  item(itemId, value, op = 0) { return this.raw(126, [itemId, op, 0, value]); }
  weapon(id, value, op = 0) { return this.raw(127, [id, op, 0, value, false]); }
  armor(id, value, op = 0) { return this.raw(128, [id, op, 0, value, false]); }
  party(actorId, add = true) { return this.raw(129, [actorId, add ? 0 : 1, 1]); }
  recoverAll() { return this.raw(314, [0, 0]); }

  // -------- tela / som --------
  transfer(mapId, x, y, { dir = 0, fade = 0 } = {}) { return this.raw(201, [0, mapId, x, y, dir, fade]); }
  tint(tone, dur = 60, wait = true) { return this.raw(223, [tone, dur, wait]); }
  flash(color, dur = 60, wait = true) { return this.raw(224, [color, dur, wait]); }
  shake(power = 5, speed = 5, dur = 60, wait = true) { return this.raw(225, [power, speed, dur, wait]); }
  wait(frames = 60) { return this.raw(230, [frames]); }
  fadeOut() { return this.raw(221, []); }
  fadeIn() { return this.raw(222, []); }
  scrollMap(dir, distance, speed) { return this.raw(204, [dir, distance, speed]); }
  bgm(name, opt = {}) { return this.raw(241, [{ name, volume: 90, pitch: 100, pan: 0, ...opt }]); }
  fadeoutBgm(sec = 3) { return this.raw(242, [sec]); }
  me(name, opt = {}) { return this.raw(249, [{ name, volume: 90, pitch: 100, pan: 0, ...opt }]); }
  se(name, opt = {}) { return this.raw(250, [{ name, volume: 90, pitch: 100, pan: 0, ...opt }]); }

  // -------- diversos --------
  callCommon(id) { return this.raw(117, [id]); }
  move(charId, steps, { wait = true, repeat = false, skippable = true } = {}) {
    const rl = [].concat(steps).map((s) => (typeof s === 'function' ? s() : s));
    rl.push({ code: 0, parameters: [] });
    return this.raw(205, [charId, { list: rl, repeat, skippable, wait }]);
  }
  showAnimAll() { return this.raw(212, [-1, 1, false]); }
  battle(troopId, { canEscape = true, canLose = false } = {}) {
    return this.raw(301, [0, troopId, canEscape, canLose]);
  }
  shop(goods, purchaseOnly = false) {
    const norm = (g) => [g[0], g[1], g[2] || 0, g[3] || 0];
    this.raw(302, [...norm(goods[0]), purchaseOnly]);
    for (let i = 1; i < goods.length; i++) this.raw(605, [...norm(goods[i]), purchaseOnly]);
    return this;
  }
  label(name) { return this.raw(118, [name]); }
  jumpToLabel(name) { return this.raw(119, [name]); }
  comment(text) { return this.raw(108, [text]); }

  // finaliza a lista com o terminador obrigatório {code:0}
  build() {
    return this.list.concat([{ code: 0, indent: 0, parameters: [] }]);
  }
}

/** Açúcar: cria um Script, roda fn e retorna a lista pronta. */
function script(fn) {
  const s = new Script();
  fn(s);
  return s.build();
}

module.exports = { Script, script, R };
