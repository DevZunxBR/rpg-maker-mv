'use strict';
// Gera o banco de dados do MV (objetos originais; sem usar assets/engine proprietários).
const { cmdList, showText, setVar, setSwitch, callCommon, ifVar, ifSwitch, elseBranch,
  changeItem, tint, playSe, recoverAll } = require('./helpers');
const { SW, VAR } = require('./constants');

// ---- utilidades de traços/params ----
const trait = (code, dataId, value) => ({ code, dataId, value });
// curva de parâmetro por nível (100 entradas, índice 0 ignorado pelo MV)
function curve(base, perLevel, mult = 1) {
  const a = new Array(100).fill(0);
  for (let lv = 1; lv < 100; lv++) a[lv] = Math.round((base + perLevel * (lv - 1)) * mult);
  return a;
}
function classParams({ mhp, mmp, atk, def, mat, mdf, agi, luk }) {
  return [
    curve(mhp.b, mhp.g), curve(mmp.b, mmp.g), curve(atk.b, atk.g), curve(def.b, def.g),
    curve(mat.b, mat.g), curve(mdf.b, mdf.g), curve(agi.b, agi.g), curve(luk.b, luk.g),
  ];
}

// =====================================================================
// CLASSES
// =====================================================================
function classes() {
  const mk = (id, name, p, learnings, traits = []) => ({
    id, name, note: '',
    expParams: [30, 20, 30, 30],
    params: classParams(p),
    learnings,
    traits: [trait(23, 0, 1), trait(22, 1, 0.95), trait(41, 1, 0), ...traits],
  });
  return [null,
    mk(1, 'Selador', {
      mhp: { b: 520, g: 42 }, mmp: { b: 80, g: 7 }, atk: { b: 17, g: 4.2 }, def: { b: 16, g: 3.6 },
      mat: { b: 14, g: 3.0 }, mdf: { b: 14, g: 3.1 }, agi: { b: 15, g: 3.2 }, luk: { b: 12, g: 2.4 },
    }, [
      { level: 1, skillId: 2, note: '' }, { level: 3, skillId: 10, note: '' },
      { level: 7, skillId: 11, note: '' }, { level: 12, skillId: 12, note: '' },
      { level: 20, skillId: 13, note: '' },
    ]),
    mk(2, 'Arquimaga', {
      mhp: { b: 360, g: 28 }, mmp: { b: 160, g: 14 }, atk: { b: 10, g: 2.0 }, def: { b: 10, g: 2.2 },
      mat: { b: 22, g: 5.2 }, mdf: { b: 18, g: 4.0 }, agi: { b: 16, g: 3.4 }, luk: { b: 14, g: 2.8 },
    }, [
      { level: 1, skillId: 20, note: '' }, { level: 4, skillId: 21, note: '' },
      { level: 9, skillId: 22, note: '' }, { level: 15, skillId: 23, note: '' },
      { level: 24, skillId: 24, note: '' },
    ]),
    mk(3, 'Guardião', {
      mhp: { b: 640, g: 52 }, mmp: { b: 50, g: 4 }, atk: { b: 18, g: 4.0 }, def: { b: 22, g: 4.6 },
      mat: { b: 8, g: 1.4 }, mdf: { b: 16, g: 3.2 }, agi: { b: 11, g: 2.2 }, luk: { b: 10, g: 2.0 },
    }, [
      { level: 1, skillId: 30, note: '' }, { level: 5, skillId: 31, note: '' },
      { level: 11, skillId: 32, note: '' }, { level: 18, skillId: 33, note: '' },
    ]),
    mk(4, 'Lâmina Sombria', {
      mhp: { b: 420, g: 33 }, mmp: { b: 70, g: 6 }, atk: { b: 20, g: 4.8 }, def: { b: 12, g: 2.6 },
      mat: { b: 12, g: 2.4 }, mdf: { b: 11, g: 2.2 }, agi: { b: 22, g: 5.0 }, luk: { b: 18, g: 3.6 },
    }, [
      { level: 1, skillId: 40, note: '' }, { level: 6, skillId: 41, note: '' },
      { level: 13, skillId: 42, note: '' }, { level: 22, skillId: 43, note: '' },
    ]),
    mk(5, 'Druida', {
      mhp: { b: 400, g: 30 }, mmp: { b: 140, g: 12 }, atk: { b: 11, g: 2.2 }, def: { b: 13, g: 2.8 },
      mat: { b: 19, g: 4.4 }, mdf: { b: 20, g: 4.6 }, agi: { b: 15, g: 3.0 }, luk: { b: 16, g: 3.2 },
    }, [
      { level: 1, skillId: 50, note: '' }, { level: 4, skillId: 51, note: '' },
      { level: 10, skillId: 52, note: '' }, { level: 17, skillId: 53, note: '' },
    ]),
  ];
}

// =====================================================================
// ACTORS
// =====================================================================
function actors() {
  const mk = (id, name, classId, nickname, profile, equips) => ({
    id, name, nickname, classId, note: '',
    battlerName: '', characterIndex: 0, characterName: '$Kael'.replace('$Kael', actorChar(id)),
    faceIndex: (id - 1) % 8, faceName: 'Actor' + Math.ceil(id / 8),
    equips, initialLevel: 1, maxLevel: 99, profile, traits: [],
  });
  function actorChar(id) { return 'Actor' + Math.ceil(id / 8); }
  return [null,
    mk(1, 'Kael', 1, 'Portador da Marca', 'Jovem de Auroria que desperta a marca de um antigo Selador.', [1, 0, 3, 4, 0]),
    mk(2, 'Lyra', 2, 'Arquimaga', 'Maga que perdeu parte da memória ao tocar um Fragmento.', [2, 0, 0, 4, 0]),
    mk(3, 'Bram', 3, 'O Guardião', 'Ex-mercenário em busca de redenção.', [4, 5, 3, 4, 0]),
    mk(4, 'Sora', 4, 'Lâmina Sombria', 'Assassina movida por vingança e dúvida.', [3, 0, 0, 4, 0]),
    mk(5, 'Eshe', 5, 'Druida', 'Guardiã do equilíbrio entre natureza e civilização.', [2, 0, 0, 4, 0]),
  ];
}

// =====================================================================
// SKILLS  (1-2 básicos; 10+ por classe)
// =====================================================================
function dmg(type, elementId, formula, variance = 20, critical = false) {
  return { type, elementId, formula, variance, critical };
}
function skills() {
  const base = (id, o) => Object.assign({
    id, animationId: 1, description: '', effects: [], hitType: 1, iconIndex: 0,
    message1: '', message2: '', mpCost: 0, name: '', note: '', occasion: 0, repeats: 1,
    requiredWtypeId1: 0, requiredWtypeId2: 0, scope: 1, speed: 0, stypeId: 1,
    successRate: 100, tpCost: 0, tpGain: 5, damage: dmg(0, 0, '0'),
  }, o);
  return [null,
    base(1, { name: 'Atacar', iconIndex: 76, stypeId: 0, hitType: 1, message1: ' ataca!', damage: dmg(1, 1, 'a.atk * 4 - b.def * 2'), tpGain: 10 }),
    base(2, { name: 'Defender', iconIndex: 81, stypeId: 0, scope: 11, occasion: 1, effects: [{ code: 21, dataId: 0, value1: 1, value2: 0 }] }),
    // Selador
    base(10, { name: 'Corte de Luz', iconIndex: 87, mpCost: 6, message1: ' golpeia com luz!', damage: dmg(1, 2, 'a.atk * 4 - b.def * 1.5 + a.mat') }),
    base(11, { name: 'Escudo Selante', iconIndex: 64, mpCost: 10, scope: 11, occasion: 1, effects: [{ code: 21, dataId: 14, value1: 1, value2: 0 }] }),
    base(12, { name: 'Juízo Áureo', iconIndex: 66, mpCost: 22, scope: 2, damage: dmg(1, 10, '(a.atk + a.mat) * 3') }),
    base(13, { name: 'Aurora Restauradora', iconIndex: 72, mpCost: 30, scope: 8, damage: dmg(3, 0, '300 + a.mat * 4') }),
    // Arquimaga
    base(20, { name: 'Faísca', iconIndex: 64, mpCost: 5, damage: dmg(1, 4, 'a.mat * 3 - b.mdf * 1.5') }),
    base(21, { name: 'Lança de Gelo', iconIndex: 65, mpCost: 9, damage: dmg(1, 5, 'a.mat * 4 - b.mdf * 1.5') }),
    base(22, { name: 'Tempestade Elétrica', iconIndex: 66, mpCost: 18, scope: 2, damage: dmg(1, 6, 'a.mat * 3.2 - b.mdf') }),
    base(23, { name: 'Meteoro', iconIndex: 67, mpCost: 34, scope: 2, damage: dmg(1, 4, 'a.mat * 4.2 - b.mdf') }),
    base(24, { name: 'Singularidade', iconIndex: 68, mpCost: 48, scope: 2, damage: dmg(1, 3, 'a.mat * 5.5 - b.mdf') }),
    // Guardião
    base(30, { name: 'Provocar', iconIndex: 13, mpCost: 4, scope: 1, effects: [{ code: 21, dataId: 13, value1: 1, value2: 0 }] }),
    base(31, { name: 'Investida', iconIndex: 78, mpCost: 8, damage: dmg(1, 1, 'a.atk * 4.5 - b.def * 2') }),
    base(32, { name: 'Muralha', iconIndex: 52, mpCost: 14, scope: 11, occasion: 1, effects: [{ code: 21, dataId: 6, value1: 1, value2: 0 }] }),
    base(33, { name: 'Baluarte', iconIndex: 53, mpCost: 20, scope: 14, effects: [{ code: 21, dataId: 6, value1: 1, value2: 0 }] }),
    // Lâmina Sombria
    base(40, { name: 'Golpe Veloz', iconIndex: 76, mpCost: 5, damage: dmg(1, 1, 'a.atk * 3.5 - b.def * 1.2', 20, true) }),
    base(41, { name: 'Punhalada Sombria', iconIndex: 77, mpCost: 9, damage: dmg(1, 3, 'a.atk * 4.5 - b.def', 20, true) }),
    base(42, { name: 'Dança das Lâminas', iconIndex: 78, mpCost: 16, repeats: 3, damage: dmg(1, 1, 'a.atk * 2 - b.def') }),
    base(43, { name: 'Execução', iconIndex: 79, mpCost: 26, damage: dmg(1, 3, 'a.atk * 6 - b.def * 1.5', 30, true) }),
    // Druida
    base(50, { name: 'Folha Curativa', iconIndex: 72, mpCost: 8, scope: 7, damage: dmg(3, 0, '150 + a.mat * 3') }),
    base(51, { name: 'Espinhos', iconIndex: 71, mpCost: 7, damage: dmg(1, 8, 'a.mat * 3.4 - b.mdf') }),
    base(52, { name: 'Bênção da Floresta', iconIndex: 72, mpCost: 20, scope: 8, damage: dmg(3, 0, '220 + a.mat * 3') }),
    base(53, { name: 'Vínculo Natural', iconIndex: 73, mpCost: 18, scope: 8, effects: [{ code: 22, dataId: 4, value1: 1, value2: 0 }] }),
  ];
}

// =====================================================================
// ITEMS
// =====================================================================
function items() {
  const base = (id, o) => Object.assign({
    id, animationId: 0, consumable: true, description: '', effects: [], hitType: 0,
    iconIndex: 176, itypeId: 1, name: '', note: '', occasion: 0, price: 0, repeats: 1,
    scope: 7, speed: 0, successRate: 100, tpGain: 0, damage: dmg(0, 0, '0'),
  }, o);
  const heal = (hp) => [{ code: 11, dataId: 0, value1: 0, value2: hp }];
  const healMp = (mp) => [{ code: 12, dataId: 0, value1: 0, value2: mp }];
  return [null,
    base(1, { name: 'Poção', iconIndex: 176, price: 50, description: 'Recupera 200 de HP.', effects: heal(200) }),
    base(2, { name: 'Poção Maior', iconIndex: 177, price: 200, description: 'Recupera 700 de HP.', effects: heal(700) }),
    base(3, { name: 'Éter', iconIndex: 184, price: 120, description: 'Recupera 80 de MP.', effects: healMp(80) }),
    base(4, { name: 'Erva Cristalina', iconIndex: 72, price: 0, itypeId: 1, description: 'Erva rara usada em uma sidequest.' }),
    base(5, { name: 'Antídoto', iconIndex: 176, price: 30, description: 'Cura veneno.', effects: [{ code: 22, dataId: 4, value1: 1, value2: 0 }] }),
    base(6, { name: 'Fênix-Pluma', iconIndex: 180, price: 500, scope: 9, description: 'Revive um aliado caído.', effects: [{ code: 22, dataId: 1, value1: 1, value2: 0 }, { code: 11, dataId: 0, value1: 0.5, value2: 0 }] }),
    // Itens-chave (itypeId 2)
    base(20, { name: 'Fragmento de Aurora', iconIndex: 73, itypeId: 2, consumable: false, price: 0, description: 'Um dos seis Fragmentos. Reúna todos.' }),
    base(21, { name: 'Mapa de Aethelgard', iconIndex: 191, itypeId: 2, consumable: false, price: 0, description: 'Revela os reinos do continente.' }),
    base(22, { name: 'Diário de Missões', iconIndex: 121, itypeId: 2, consumable: false, price: 0, description: 'Acompanha suas missões ativas.' }),
  ];
}

// =====================================================================
// WEAPONS / ARMORS
// =====================================================================
function weapons() {
  const mk = (id, name, wtypeId, atk, price, iconIndex, etc = {}) => Object.assign({
    id, name, wtypeId, etypeId: 1, price, iconIndex, animationId: 0, description: '', note: '',
    params: [0, 0, atk, 0, etc.mat || 0, 0, etc.agi || 0, 0],
    traits: [trait(31, 1, 0), trait(22, 0, etc.hit || 0.95)],
  }, {});
  return [null,
    mk(1, 'Espada de Ferro', 1, 14, 200, 96),
    mk(2, 'Cajado de Carvalho', 2, 6, 180, 113, { mat: 16 }),
    mk(3, 'Adaga Sombria', 3, 11, 220, 110, { agi: 8 }),
    mk(4, 'Machado de Batalha', 4, 20, 320, 101),
    mk(5, 'Espada de Aurora', 1, 34, 1500, 99, { mat: 18 }),
    mk(6, 'Arco Élfico', 5, 16, 400, 108, { agi: 6 }),
  ];
}
function armors() {
  const mk = (id, name, atypeId, etypeId, def, price, iconIndex, etc = {}) => ({
    id, name, atypeId, etypeId, price, iconIndex, description: '', note: '',
    params: [etc.mhp || 0, etc.mmp || 0, 0, def, 0, etc.mdf || 0, 0, 0],
    traits: [trait(22, 1, etc.eva || 0)],
  });
  return [null,
    mk(1, 'Escudo de Madeira', 5, 2, 8, 120, 128),
    mk(2, 'Escudo de Aço', 5, 2, 16, 360, 129),
    mk(3, 'Elmo de Couro', 0, 3, 6, 100, 138, { mhp: 30 }),
    mk(4, 'Túnica de Viajante', 1, 4, 10, 150, 144, { mhp: 50 }),
    mk(5, 'Cota de Malha', 2, 4, 20, 420, 145, { mhp: 120 }),
    mk(6, 'Manto Mágico', 4, 4, 12, 500, 146, { mmp: 40, mdf: 16 }),
    mk(7, 'Anel da Aurora', 0, 5, 4, 800, 162, { mhp: 80, mmp: 20 }),
  ];
}

// =====================================================================
// STATES
// =====================================================================
function states() {
  const base = (id, o) => Object.assign({
    id, autoRemovalTiming: 1, chanceByDamage: 100, iconIndex: 0, maxTurns: 3, minTurns: 1,
    message1: '', message2: '', message3: '', message4: '', motion: 0, name: '', note: '',
    overlay: 0, priority: 50, releaseByDamage: false, removeAtBattleEnd: false,
    removeByDamage: false, removeByRestriction: false, removeByWalking: false,
    restriction: 0, stepsToRemove: 100, traits: [],
  }, o);
  return [null,
    base(1, { name: 'Morto', iconIndex: 1, restriction: 4, priority: 100, message1: ' caiu!', message3: ' caiu!', motion: 3, removeAtBattleEnd: false, traits: [trait(22, 0, 0), trait(63, 0, 1)] }),
    base(2, { name: 'Defesa', iconIndex: 81, autoRemovalTiming: 1, maxTurns: 1, minTurns: 1, motion: 0 }),
    base(4, { name: 'Veneno', iconIndex: 2, message1: ' está envenenado!', message4: ' está envenenado!', maxTurns: 5, minTurns: 3, removeByWalking: true, traits: [trait(22, 7, 0.9)], note: '<slipDamage:5>' }),
    base(5, { name: 'Atordoado', iconIndex: 3, restriction: 4, maxTurns: 2, minTurns: 1, removeByDamage: true, message1: ' está atordoado!' }),
    base(6, { name: 'Proteção', iconIndex: 52, maxTurns: 3, minTurns: 3, traits: [trait(21, 3, 1.5)] }),
    base(13, { name: 'Provocado', iconIndex: 13, maxTurns: 3, minTurns: 2 }),
    base(14, { name: 'Selo de Luz', iconIndex: 64, maxTurns: 3, minTurns: 2, traits: [trait(21, 5, 1.4)] }),
  ];
}

// =====================================================================
// ENEMIES
// =====================================================================
function enemies() {
  const mk = (id, name, p, exp, gold, drops = [], actions = [{ conditionParam1: 0, conditionParam2: 0, conditionType: 0, rating: 5, skillId: 1 }]) => ({
    id, name, note: '', battlerName: 'Slime'.replace('Slime', enemyImg(id)), battlerHue: (id * 30) % 360,
    params: [p.mhp, p.mmp, p.atk, p.def, p.mat, p.mdf, p.agi, p.luk],
    exp, gold, dropItems: drops.length ? drops : [noDrop(), noDrop(), noDrop()],
    actions, traits: [trait(22, 0, 0.95)],
  });
  function enemyImg(id) { const imgs = ['Slime', 'Bat', 'Orc', 'Wolf', 'Goblin', 'Skeleton', 'Ghost', 'Minotaur']; return imgs[id % imgs.length]; }
  const noDrop = () => ({ dataId: 1, denominator: 1, kind: 0 });
  const drop = (kind, dataId, denom) => ({ kind, dataId, denominator: denom });
  return [null,
    mk(1, 'Slime Selvagem', { mhp: 120, mmp: 0, atk: 18, def: 8, mat: 0, mdf: 5, agi: 8, luk: 5 }, 12, 20, [drop(1, 1, 4)]),
    mk(2, 'Morcego das Cavernas', { mhp: 90, mmp: 0, atk: 22, def: 6, mat: 0, mdf: 6, agi: 18, luk: 6 }, 14, 18),
    mk(3, 'Orc Saqueador', { mhp: 320, mmp: 0, atk: 38, def: 18, mat: 0, mdf: 10, agi: 10, luk: 6 }, 40, 60, [drop(1, 1, 3)]),
    mk(4, 'Lobo Sombrio', { mhp: 200, mmp: 0, atk: 34, def: 12, mat: 0, mdf: 8, agi: 24, luk: 8 }, 32, 40),
    mk(5, 'Goblin Arqueiro', { mhp: 150, mmp: 0, atk: 28, def: 10, mat: 0, mdf: 8, agi: 16, luk: 10 }, 24, 35),
    mk(6, 'Esqueleto Guerreiro', { mhp: 380, mmp: 0, atk: 44, def: 24, mat: 0, mdf: 12, agi: 12, luk: 6 }, 55, 80, [drop(2, 1, 6)]),
    mk(7, 'Espectro', { mhp: 260, mmp: 40, atk: 20, def: 10, mat: 38, mdf: 22, agi: 20, luk: 12 }, 50, 70),
    // CHEFES
    mk(50, 'Golem Guardião do Cristal', { mhp: 2200, mmp: 0, atk: 60, def: 40, mat: 10, mdf: 30, agi: 14, luk: 10 }, 400, 600, [drop(2, 20, 1)],
      [{ conditionParam1: 0, conditionParam2: 0, conditionType: 0, rating: 6, skillId: 1 }]),
    mk(51, 'O Devorador de Auroras', { mhp: 9000, mmp: 999, atk: 95, def: 55, mat: 90, mdf: 50, agi: 40, luk: 30 }, 5000, 9999, [],
      [{ conditionParam1: 0, conditionParam2: 0, conditionType: 0, rating: 7, skillId: 1 }]),
  ];
}

// =====================================================================
// TROOPS
// =====================================================================
function troops() {
  const member = (enemyId, x, y, hidden = false) => ({ enemyId, x, y, hidden });
  const emptyPage = () => ({ conditions: { actorHp: 50, actorId: 1, actorValid: false, enemyHp: 50, enemyIndex: 0, enemyValid: false, switchId: 1, switchValid: false, turnA: 0, turnB: 0, turnEnding: false, turnValid: false }, list: [{ code: 0, indent: 0, parameters: [] }], span: 0 });
  const mk = (id, name, members) => ({ id, name, members, pages: [emptyPage()] });
  return [null,
    mk(1, 'Slime x2', [member(1, 340, 300), member(1, 460, 320)]),
    mk(2, 'Morcegos x3', [member(2, 300, 280), member(2, 420, 300), member(2, 520, 290)]),
    mk(3, 'Orc + Lobos', [member(3, 400, 300), member(4, 280, 320), member(4, 520, 320)]),
    mk(4, 'Goblins', [member(5, 320, 300), member(5, 480, 300), member(2, 400, 260)]),
    mk(5, 'Esqueletos', [member(6, 360, 300), member(6, 480, 300)]),
    mk(6, 'Espectros', [member(7, 340, 290), member(7, 500, 290)]),
    mk(10, 'CHEFE: Golem do Cristal', [member(50, 420, 300)]),
    mk(11, 'CHEFE FINAL: Devorador', [member(51, 420, 280)]),
  ];
}

// =====================================================================
// ANIMATIONS / TILESETS
// =====================================================================
function animations() {
  // Animações mínimas válidas (sem assets reais — o MV apenas precisa das entradas).
  const mk = (id, name) => ({
    id, name, animation1Name: '', animation1Hue: 0, animation2Name: '', animation2Hue: 0,
    position: 1, frames: [[[0, 0, 0, 100, 100, 0, 1, 0]]],
    timings: [],
  });
  const arr = [null];
  for (let i = 1; i <= 20; i++) arr.push(mk(i, 'Anim ' + i));
  return arr;
}

function tilesets() {
  const flags = new Array(8192).fill(0);
  const mk = (id, name, names) => ({ id, name, mode: 1, note: '', flags: flags.slice(), tilesetNames: names });
  const N = (a) => { const x = ['', '', '', '', '', '', '', '', '']; a.forEach((v, i) => x[i] = v); return x; };
  return [null,
    mk(1, 'Exterior', N(['Outside_A1', 'Outside_A2', 'Outside_A3', 'Outside_A4', 'Outside_A5', 'Outside_B', 'Outside_C'])),
    mk(2, 'Interior', N(['Inside_A1', 'Inside_A2', 'Inside_A3', 'Inside_A4', 'Inside_A5', 'Inside_B', 'Inside_C'])),
    mk(3, 'Masmorra', N(['Dungeon_A1', 'Dungeon_A2', 'Dungeon_A4', 'Dungeon_A5', '', 'Dungeon_B', 'Dungeon_C'])),
    mk(4, 'Mundo', N(['World_A1', 'World_A2', '', '', '', 'World_B', 'World_C'])),
  ];
}

module.exports = {
  classes, actors, skills, items, weapons, armors, states, enemies, troops, animations, tilesets,
  curve, trait,
};
