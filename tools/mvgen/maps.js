'use strict';
const MB = require('./mapbuilder');
const { TILE, blankData, setTile, fillRect, border, makeEvent, page, makeMap } = MB;
const { Script, R } = require('./helpers');
const { SW, VAR } = require('./constants');

const MAPS = {};
const INFO = {};
function register(id, name, mapObj, parentId = 0) { MAPS[id] = mapObj; INFO[id] = { name, parentId }; }

// ---------------- helpers de evento ----------------
function ev(opts) { return makeEvent(opts); }
function pg(o) { return page(o); }
function S(fn) { const s = new Script(); fn(s); return s; }

// NPC que fala (gatilho: botão de ação)
function npc(id, x, y, { name = 'NPC', char = 'People1', idx = 0, dir = 2, lines, build, cond }) {
  return ev({ id, name, x, y, pages: [pg({
    characterName: char, characterIndex: idx, direction: dir, trigger: 0, priorityType: 1,
    conditions: cond || {},
    list: S((s) => { if (build) build(s); else s.text(lines, { position: 2 }); }),
  })] });
}
// Porta / transferência por toque
function door(id, x, y, build, { char = '', idx = 0, priority = 0 } = {}) {
  return ev({ id, name: 'porta', x, y, pages: [pg({
    characterName: char, characterIndex: idx, trigger: 1, priorityType: priority, through: char === '',
    list: S(build),
  })] });
}
// Placa
function sign(id, x, y, lines) {
  return ev({ id, name: 'placa', x, y, pages: [pg({
    trigger: 0, priorityType: 1, list: S((s) => s.text(lines, { background: 1, position: 1 })),
  })] });
}
// serviço genérico (chama common event)
function service(id, x, y, { name, char, idx = 0, common }) {
  return ev({ id, name, x, y, pages: [pg({
    characterName: char, characterIndex: idx, trigger: 0, priorityType: 1,
    list: S((s) => s.callCommon(common)),
  })] });
}
// saída para o world map em (wx,wy)
function exitTo(id, x, y, wx, wy) {
  return ev({ id, name: 'saída', x, y, pages: [pg({
    trigger: 1, priorityType: 0, through: true,
    list: S((s) => s
      .text(['Voltar ao mapa de Aethelgard?'], { background: 1, position: 1 })
      .choice(['Sim', 'Não'], [(b) => b.transfer(1, wx, wy, { fade: 0 }), null], { cancel: 1 })),
  })] });
}

// =====================================================================
// INTRO CINEMATOGRÁFICA (mapa 100) — texto rolando + soldados até a porta
// =====================================================================
function buildIntro() {
  const w = 17, h = 17;
  const data = blankData(w, h, TILE.DIRT);
  // caminho de terra batida no centro + grama nas laterais
  fillRect(data, w, h, 0, 0, w - 1, h - 1, 0, TILE.GRASS);
  fillRect(data, w, h, 6, 2, 10, 16, 0, TILE.DIRT);
  // "casa" no topo com porta
  fillRect(data, w, h, 5, 0, 11, 2, 2, TILE.ROOF);
  fillRect(data, w, h, 5, 3, 11, 3, 1, TILE.WALL);

  // Soldados (eventos 2..5) — começam embaixo
  const soldiers = [
    { id: 2, x: 7, y: 15, idx: 0 },
    { id: 3, x: 9, y: 15, idx: 1 },
    { id: 4, x: 6, y: 16, idx: 4 },
    { id: 5, x: 10, y: 16, idx: 5 },
  ].map((sd) => ev({ id: sd.id, name: 'soldado', x: sd.x, y: sd.y, pages: [pg({
    characterName: 'People3', characterIndex: sd.idx, direction: 8, trigger: 0, priorityType: 1,
    walkAnime: true,
  })] }));

  // Porta (evento 6) — só gráfico
  const doorEv = ev({ id: 6, name: 'porta', x: 8, y: 3, pages: [pg({
    tileId: 0, characterName: '!Door1', characterIndex: 0, direction: 2, trigger: 0, priorityType: 0,
  })] });

  // Diretor da cena (evento 1, autorun)
  const director = ev({ id: 1, name: 'INTRO', x: 0, y: 0, pages: [pg({
    trigger: 3, priorityType: 0, through: true,
    list: S((s) => {
      s.raw(241, [{ name: 'Theme6', volume: 80, pitch: 100, pan: 0 }]); // BGM
      s.tint([-255, -255, -255, 255], 1, false); // tela preta
      s.move(-1, [R.transpOn()], { wait: true }); // esconde o herói
      s.wait(30);
      // ----- TEXTO ROLANDO -----
      s.scroll([
        '\\C[6]As Crônicas de Aethelgard\\C[0]',
        '',
        'Há trezentos anos, os Seladores',
        'aprisionaram o Devorador de Auroras —',
        'aquele que consome a luz do mundo.',
        '',
        'Mas a selagem se desfaz.',
        'As auroras minguam no céu.',
        'Vilarejos perdem a cor... e a memória.',
        '',
        'E numa noite sem estrelas,',
        'em Vilar de Auroria,',
        'a marca de um antigo Selador desperta',
        'na pele de um jovem chamado \\C[6]Kael\\C[0].',
        '',
        'Naquela mesma noite,',
        'soldados do Reino batem à sua porta...',
        '',
      ], { speed: 3 });
      // ----- CENA: revela a noite -----
      s.tint([-120, -110, -40, 100], 90, true); // noite azulada
      s.wait(30);
      // ----- SOLDADOS MARCHAM ATÉ A PORTA (em paralelo) -----
      const march = (steps) => [R.speed(4), R.walkOn(), ...Array(steps).fill(0).map(() => R.up())];
      s.move(2, march(10), { wait: false });
      s.move(3, march(10), { wait: false });
      s.move(4, [R.speed(4), R.walkOn(), ...Array(2).fill(0).map(() => R.up()), R.right(),
        ...Array(8).fill(0).map(() => R.up())], { wait: false });
      s.move(5, [R.speed(4), R.walkOn(), ...Array(2).fill(0).map(() => R.up()), R.left(),
        ...Array(8).fill(0).map(() => R.up())], { wait: true });
      s.wait(40);
      // os soldados se viram para a porta
      s.move(2, [R.turnUp()], { wait: false });
      s.move(3, [R.turnUp()], { wait: false });
      s.wait(20);
      // ----- BATEM NA PORTA -----
      s.se('Knock', { volume: 100 });
      s.wait(45);
      s.se('Knock', { volume: 100 });
      s.wait(30);
      s.text(['\\C[4]Soldado\\C[0]: É esta. A casa do jovem da marca.'], { background: 1, position: 2 });
      s.text(['\\C[4]Capitão\\C[0]: O Rei o quer vivo. Abram a porta.'], { background: 1, position: 2 });
      // porta abre
      s.se('Door1', { volume: 100 });
      s.flash([255, 255, 230, 160], 30, true);
      s.move(6, [R.transpOn()], { wait: true }); // porta "abre" (some)
      s.wait(30);
      s.text(['\\C[6]Kael\\C[0]: ...o que vocês querem comigo a esta hora?'], { background: 1, position: 2 });
      s.text(['A partir de agora, o destino de Aethelgard está em suas mãos.'], { background: 1, position: 1 });
      s.wait(20);
      // encerra a intro e entrega o controle ao jogador
      s.tint([0, 0, 0, 0], 60, true);
      s.fadeoutBgm(2);
      s.setSwitch(SW.INTRO_DONE, true);
      s.setSwitch(SW.MQ1_ACTIVE, true);
      s.setVar(VAR.MAIN_STAGE, 1, 0);
      s.item(21, 1, 0); // Mapa de Aethelgard
      s.item(22, 1, 0); // Diário de Missões
      s.move(-1, [R.transpOff()], { wait: true }); // mostra o herói de novo
      s.transfer(2, 8, 12, { dir: 8, fade: 0 }); // vai para Auroria
    }),
  })] });

  register(100, 'INTRO', makeMap({
    width: w, height: h, tilesetId: 1, data,
    events: [director, ...soldiers, doorEv], displayName: '', autoplayBgm: false,
  }));
}

// =====================================================================
// WORLD MAP (mapa 1) — hub enxuto com 4 destinos
// =====================================================================
function buildWorldMap() {
  const w = 30, h = 22;
  const data = blankData(w, h, TILE.GRASS);
  fillRect(data, w, h, 2, 2, 7, 6, 0, TILE.WATER);
  fillRect(data, w, h, 22, 14, 27, 19, 0, TILE.WATER);
  // estrada de terra ligando os pontos
  fillRect(data, w, h, 4, 10, 26, 11, 0, TILE.DIRT);

  const dests = [
    { id: 2, name: 'Vilar de Auroria', x: 5, y: 10, ex: 12, ey: 17 },
    { id: 3, name: 'Cidade de Lumengarde', x: 14, y: 9, ex: 17, ey: 23 },
    { id: 4, name: 'Bosque dos Sussurros', x: 23, y: 10, ex: 12, ey: 17 },
    { id: 6, name: 'Estrada de Aethelgard', x: 10, y: 13, ex: 3, ey: 8 },
    { id: 5, name: 'Bastião Final', x: 26, y: 5, ex: 12, ey: 17, cond: SW.FINAL_OPEN },
  ];
  const events = dests.map((d, i) => ev({
    id: i + 1, name: d.name, x: d.x, y: d.y,
    pages: [pg({
      characterName: 'Flame', characterIndex: 0, trigger: 0, priorityType: 1, stepAnime: true,
      conditions: d.cond ? { switch1Valid: true, switch1Id: d.cond } : {},
      list: S((s) => s
        .text(['Viajar para \\C[6]' + d.name + '\\C[0]?'], { background: 1, position: 1 })
        .choice(['Viajar', 'Ficar'], [(b) => b.transfer(d.id, d.ex, d.ey, { fade: 0 }), null], { cancel: 1 })),
    })],
  }));
  // sinaliza o Bastião enquanto fechado (página vazia quando FINAL_OPEN está ON)
  events.push(ev({ id: events.length + 1, name: 'selo', x: 25, y: 5, pages: [
    pg({ characterName: '!Other2', characterIndex: 0, trigger: 0, priorityType: 1,
      list: S((s) => s.text(['Um selo de luz bloqueia o caminho ao Bastião.',
        'Reúna os \\C[6]3 Fragmentos\\C[0] para abri-lo. (Você tem \\V[1].)'], { background: 1, position: 1 })) }),
    pg({ characterName: '', trigger: 0, priorityType: 1,
      conditions: { switch1Valid: true, switch1Id: SW.FINAL_OPEN },
      list: S((s) => s) }),
  ] }));

  register(1, 'Mapa de Aethelgard', makeMap({
    width: w, height: h, tilesetId: 4, data, events,
    displayName: 'Aethelgard', autoplayBgm: true, bgm: 'Field2',
    encounterList: [{ troopId: 1, weight: 5 }, { troopId: 4, weight: 4 }], encounterStep: 45,
  }));
}

// =====================================================================
// AURORIA (mapa 2) — vila natal: curandeira (ervas), entrada da caverna
// =====================================================================
function buildAuroria() {
  const w = 25, h = 19;
  const data = villageGround(w, h);
  let id = 0;
  const events = [];
  events.push(sign(++id, 12, 14, ['\\}Vilar de Auroria\\{', 'Vila natal de Kael']));
  events.push(exitTo(++id, 12, 18, 5, 12));
  // mãe
  events.push(npc(++id, 6, 5, { name: 'Mãe', char: 'People1', idx: 0,
    lines: ['Mãe: Kael... sua marca brilha. Tenha cuidado lá fora.',
      'Dizem que há um Fragmento na \\C[6]Caverna Cristalina\\C[0], ao norte.'] }));
  // curandeira — sidequest das ervas + checagem
  events.push(npc(++id, 18, 6, { name: 'Curandeira', char: 'People2', idx: 2, build: (s) => {
    s.ifSwitch(SW.SQ_HERBS_DONE,
      (b) => b.text(['Curandeira: Suas ervas salvaram vidas. Obrigada, Kael.']),
      (b) => b.ifSwitch(SW.SQ_HERBS_ACTIVE,
        (c) => c.text(['Curandeira: Já tem as \\C[3]5 Ervas Cristalinas\\C[0]?'], { position: 2 })
          .callCommon(9),
        (c) => c.text(['Curandeira: Preciso de \\C[3]5 Ervas Cristalinas\\C[0]. Me ajuda?',
          'Elas crescem perto de água. Há uma ali atrás de casa.'], { position: 2 })
          .choice(['Aceitar', 'Agora não'], [
            (d) => d.setSwitch(SW.SQ_HERBS_ACTIVE, true).setVar(VAR.ACTIVE_SIDE, 1, 1).se('Decision2')
              .text(['Missão \\C[6]Ervas Cristalinas\\C[0] aceita!']),
            null], { cancel: 1 })));
  } }));
  // moita de erva coletável (self switch A após coletar)
  events.push(ev({ id: ++id, name: 'erva', x: 3, y: 4, pages: [
    pg({ characterName: '!Flame', characterIndex: 2, trigger: 0, priorityType: 1,
      conditions: { switch1Valid: true, switch1Id: SW.SQ_HERBS_ACTIVE },
      list: S((s) => s.ifVar(VAR.HERBS_COLLECTED, 5, 4, // < 5
        (b) => b.text(['Você colheu uma \\C[3]Erva Cristalina\\C[0]!']).item(4, 1, 0)
          .setVar(VAR.HERBS_COLLECTED, 1, 1).se('Item3'),
        (b) => b.text(['Já colheu ervas o bastante. Leve à curandeira.']))) }),
  ] }));
  // entrada da caverna (norte)
  events.push(door(++id, 12, 2, (s) => s
    .text(['Entrar na \\C[6]Caverna Cristalina\\C[0]?'], { background: 1, position: 1 })
    .choice(['Entrar', 'Voltar'], [(b) => b.transfer(18, 10, 15, { dir: 8, fade: 0 }), null], { cancel: 1 })));
  events.push(npc(++id, 9, 10, { name: 'Criança', char: 'People4', idx: 6,
    lines: ['Criança: As cores do céu sumiram esta noite... que medo.'] }));

  register(2, 'Vilar de Auroria', makeMap({
    width: w, height: h, tilesetId: 1, data, events,
    displayName: 'Vilar de Auroria', autoplayBgm: true, bgm: 'Town1',
  }), 1);
}

// =====================================================================
// LUMENGARDE (mapa 3) — capital HUB: loja, médico, pousada, quadro, rei, mercador, traição
// =====================================================================
function buildCapital() {
  const w = 27, h = 21;
  const data = villageGround(w, h, TILE.DIRT);
  let id = 0;
  const events = [];
  events.push(sign(++id, 13, 16, ['\\}Cidade de Lumengarde\\{', 'Capital do Reino']));
  events.push(exitTo(++id, 13, 20, 14, 11));

  // --- SERVIÇOS ---
  events.push(ev({ id: ++id, name: 'Loja', x: 4, y: 6, pages: [pg({
    characterName: 'People2', characterIndex: 5, trigger: 0, priorityType: 1,
    list: S((s) => s.text(['\\C[6]Mercadora\\C[0]: Bem-vindo à minha loja!'], { position: 2 })
      .shop([[0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [1, 1], [1, 3], [2, 4], [2, 5], [2, 3]])),
  })] }));
  events.push(service(++id, 8, 6, { name: 'Médico', char: 'People1', idx: 5, common: 5 }));
  events.push(service(++id, 12, 6, { name: 'Pousada', char: 'People4', idx: 3, common: 4 }));
  events.push(ev({ id: ++id, name: 'Quadro de Missões', x: 20, y: 6, pages: [pg({
    characterName: '!Other1', characterIndex: 0, trigger: 0, priorityType: 1,
    list: S((s) => s.callCommon(7)),
  })] }));
  // diário (placa) — também acessível pelo NPC
  events.push(ev({ id: ++id, name: 'Diário', x: 22, y: 6, pages: [pg({
    characterName: '!Other1', characterIndex: 4, trigger: 0, priorityType: 1,
    list: S((s) => s.callCommon(8)),
  })] }));

  // --- MERCADOR DA ENCOMENDA (sidequest delivery) ---
  events.push(npc(++id, 6, 12, { name: 'Mercador', char: 'People2', idx: 7, build: (s) => {
    s.ifSwitch(SW.SQ_DELIVERY_DONE,
      (b) => b.text(['Mercador: O ferreiro élfico recebeu tudo? Ótimo negócio!']),
      (b) => b.ifSwitch(SW.SQ_DELIVERY_ACTIVE,
        (c) => c.text(['Mercador: Leve o pacote ao \\C[3]ferreiro élfico\\C[0] no Bosque dos Sussurros.']),
        (c) => c.text(['Mercador: Preciso entregar uma encomenda ao ferreiro élfico.',
          'Você vai para o Bosque? Leva pra mim?'], { position: 2 })
          .choice(['Aceitar', 'Agora não'], [
            (d) => d.setSwitch(SW.SQ_DELIVERY_ACTIVE, true).setVar(VAR.ACTIVE_SIDE, 1, 1).se('Decision2')
              .text(['Missão \\C[6]A Encomenda\\C[0] aceita!']), null], { cancel: 1 })));
  } }));

  // --- REI (MQ2): só atende após o 1º Fragmento ---
  events.push(npc(++id, 13, 3, { name: 'Rei', char: 'People3', idx: 3, build: (s) => {
    s.ifSwitch(SW.MQ2_DONE,
      (b) => b.text(['Rei: Confio em você, portador da marca.']),
      (b) => b.ifSwitch(SW.MQ1_DONE,
        (c) => c.text(['\\C[6]Rei\\C[0]: Então conseguiu o primeiro Fragmento!',
          'Tome este, guardado pela coroa há gerações. Agora são dois.'])
          .callCommon(2) // concede um Fragmento
          .setSwitch(SW.MQ2_DONE, true).setSwitch(SW.MQ1_DONE, true)
          .setSwitch(SW.MQ3_ACTIVE, true).setSwitch(SW.KING_MET, true)
          .setVar(VAR.MAIN_STAGE, 5, 0).callCommon(3),
        (c) => c.text(['Rei: Volte quando tiver provas do seu poder, jovem.'])));
  } }));

  // --- TRAIÇÃO (autorun): dispara após falar com o rei ---
  // Ordem das páginas: a de maior índice cujas condições batem é a usada.
  // Página ativa (cond MQ3) primeiro; página vazia (cond MQ3 && BETRAYAL) por último.
  events.push(ev({ id: ++id, name: 'Traição', x: 13, y: 8, pages: [
    pg({ trigger: 3, priorityType: 0, through: true,
      conditions: { switch1Valid: true, switch1Id: SW.MQ3_ACTIVE },
      list: S((s) => s
        .wait(20).shake(7, 7, 90, true)
        .text(['\\C[4]Conselheiro\\C[0]: Tolo. Os Fragmentos pertencem a \\C[2]Ele\\C[0].',
          'Guardas! Prendam o portador da marca!'], { background: 1, position: 1 })
        .setSwitch(SW.BETRAYAL, true)
        .battle(6, { canEscape: false, canLose: false })
        .text(['Você abre caminho entre os guardas e foge da capital!'])
        .text(['\\C[6]Kael\\C[0]: O Conselheiro serve ao Devorador... preciso de respostas.',
          'O \\C[3]Bosque dos Sussurros\\C[0] guarda Fragmentos e verdades.'])
        .transfer(1, 14, 11, { fade: 0 })) }),
    pg({ trigger: 3, priorityType: 0, through: true,
      conditions: { switch1Valid: true, switch1Id: SW.MQ3_ACTIVE, switch2Valid: true, switch2Id: SW.BETRAYAL },
      list: S((s) => s) }), // depois que a traição ocorreu: página vazia (não repete)
  ] }));

  register(3, 'Cidade de Lumengarde', makeMap({
    width: w, height: h, tilesetId: 1, data, events,
    displayName: 'Cidade de Lumengarde', autoplayBgm: true, bgm: 'Town2',
  }), 1);
}

// =====================================================================
// BOSQUE DOS SUSSURROS (mapa 4) — elfos: anciã (favor + verdade + Fragmento), ferreiro
// =====================================================================
function buildElfWood() {
  const w = 25, h = 19;
  const data = villageGround(w, h);
  let id = 0;
  const events = [];
  events.push(sign(++id, 12, 14, ['\\}Bosque dos Sussurros\\{', 'Lar do povo élfico']));
  events.push(exitTo(++id, 12, 18, 23, 11));

  // Anciã Élfica — "O Favor dos Elfos" + revela a verdade (MQ3) + concede Fragmento
  events.push(npc(++id, 12, 4, { name: 'Anciã Élfica', char: 'People3', idx: 1, build: (s) => {
    s.ifSwitch(SW.SQ_ELF_DONE,
      (b) => b.text(['Anciã: A Aurora flui melhor graças a você, Kael.']),
      (b) => b.ifSwitch(SW.SQ_ELF_ACTIVE,
        (c) => c.text(['Anciã: Acenda os três totens do bosque (toque-os) e volte a mim.'], { position: 2 })
          .ifVar(VAR.REP_ELVES, 30, 1,
            (d) => d.text(['Anciã: Os totens cantam de novo! Aceite este \\C[6]Fragmento\\C[0]',
              'que guardamos por eras. E saiba a verdade:',
              'o Devorador foi um Selador traído — irmão do primeiro.'])
              .callCommon(2) // Fragmento via common 2
              .raw(127, [6, 0, 0, 1, false]) // Arco Élfico de recompensa
              .setSwitch(SW.SQ_ELF_DONE, true).setSwitch(SW.SQ_ELF_ACTIVE, false)
              .setVar(VAR.ACTIVE_SIDE, 1, 2)
              .setSwitch(SW.MQ3_DONE, true),
            (d) => d.text(['Anciã: Faltam totens. (Acesos: dependem da sua reputação.)'])),
        (c) => c.text(['\\C[6]Anciã Élfica\\C[0]: Vejo a marca em você, humano.',
          'Prove seu valor: acenda os \\C[3]três totens\\C[0] do bosque.',
          'Em troca, revelarei um segredo e um Fragmento.'], { position: 2 })
          .choice(['Aceitar', 'Recusar'], [
            (d) => d.setSwitch(SW.SQ_ELF_ACTIVE, true).setVar(VAR.ACTIVE_SIDE, 1, 1).se('Decision2')
              .text(['Missão \\C[6]O Favor dos Elfos\\C[0] aceita!']), null], { cancel: 1 })));
  } }));

  // três totens (cada um dá +10 de reputação élfica, uma vez)
  const totens = [[4, 6], [20, 6], [12, 11]];
  totens.forEach(([tx, ty]) => {
    events.push(ev({ id: ++id, name: 'totem', x: tx, y: ty, pages: [
      pg({ characterName: '!Flame', characterIndex: 0, trigger: 0, priorityType: 1,
        conditions: { switch1Valid: true, switch1Id: SW.SQ_ELF_ACTIVE },
        list: S((s) => s.text(['O totem se acende com luz de aurora.'])
          .se('Saint5').setVar(VAR.REP_ELVES, 10, 1)
          .raw(123, ['A', 0])) }),
      pg({ characterName: '!Flame', characterIndex: 1, trigger: 0, priorityType: 1,
        conditions: { selfSwitchValid: true, selfSwitchCh: 'A' },
        list: S((s) => s.text(['O totem já está aceso.'])) }),
    ] }));
  });

  // Ferreiro élfico — recebe a encomenda
  events.push(npc(++id, 19, 9, { name: 'Ferreiro Élfico', char: 'People4', idx: 0, build: (s) => {
    s.callCommon(11);
  } }));

  register(4, 'Bosque dos Sussurros', makeMap({
    width: w, height: h, tilesetId: 1, data, events,
    displayName: 'Bosque dos Sussurros', autoplayBgm: true, bgm: 'Town3',
  }), 1);
}

// =====================================================================
// ESTRADA (mapa 6) — caça aos lobos (3 lobos determinísticos) + encontros
// =====================================================================
function buildRoad() {
  const w = 25, h = 17;
  const data = blankData(w, h, TILE.GRASS);
  fillRect(data, w, h, 0, 7, w - 1, 9, 0, TILE.DIRT);
  let id = 0;
  const events = [];
  events.push(exitTo(++id, 2, 8, 10, 12));
  events.push(sign(++id, 5, 6, ['Estrada de Aethelgard', 'Cuidado com os lobos.']));
  // placa explicando a caça (se a quest estiver ativa)
  events.push(npc(++id, 7, 8, { name: 'Viajante', char: 'People1', idx: 3, build: (s) => {
    s.ifSwitch(SW.SQ_WOLVES_ACTIVE,
      (b) => b.text(['Viajante: Os lobos estão por aqui. Abatidos: \\C[6]\\V[7]\\C[0]/3.'], { position: 2 })
        .callCommon(10),
      (b) => b.text(['Viajante: Aceite a \\C[3]Caça aos Lobos\\C[0] no quadro da Capital.'], { position: 2 }));
  } }));
  // 3 lobos
  const wolfPos = [[12, 5], [16, 9], [20, 6]];
  wolfPos.forEach(([wx, wy]) => {
    events.push(ev({ id: ++id, name: 'lobo', x: wx, y: wy, pages: [
      pg({ characterName: 'Nature', characterIndex: 5, trigger: 0, priorityType: 1, stepAnime: true,
        conditions: { switch1Valid: true, switch1Id: SW.SQ_WOLVES_ACTIVE },
        list: S((s) => s.text(['Um \\C[2]Lobo Sombrio\\C[0] avança!'], { position: 1 })
          .battle(7, { canEscape: true, canLose: false })
          .setVar(VAR.WOLVES_KILLED, 1, 1).raw(123, ['A', 0])) }),
      pg({ conditions: { selfSwitchValid: true, selfSwitchCh: 'A' }, characterName: '', trigger: 0,
        priorityType: 0, list: S((s) => s) }),
    ] }));
  });

  register(6, 'Estrada de Aethelgard', makeMap({
    width: w, height: h, tilesetId: 4, data, events,
    displayName: 'Estrada de Aethelgard', autoplayBgm: true, bgm: 'Field1',
    encounterList: [{ troopId: 1, weight: 4 }, { troopId: 2, weight: 3 }], encounterStep: 50,
  }), 1);
}

// =====================================================================
// CAVERNA CRISTALINA (mapa 18) — chefe Golem + 1º Fragmento (MQ1)
// =====================================================================
function buildCave() {
  const w = 21, h = 17;
  const data = blankData(w, h, TILE.DIRT);
  border(data, w, h, 1, TILE.WALL);
  let id = 0;
  const events = [];
  events.push(door(++id, 10, 16, (s) => s.transfer(2, 12, 3, { dir: 2, fade: 0 })));
  // chefe + fragmento
  events.push(ev({ id: ++id, name: 'Cristal', x: 10, y: 4, pages: [
    pg({ characterName: 'Monster', characterIndex: 4, trigger: 0, priorityType: 1, stepAnime: true,
      list: S((s) => s
        .text(['Diante do cristal, um \\C[2]Golem Guardião\\C[0] desperta!'], { position: 1 })
        .battle(10, { canEscape: false, canLose: false })
        .text(['O guardião se desfaz. O cristal pulsa com luz pura.'])
        .callCommon(2) // coleta o Fragmento
        .setSwitch(SW.BOSS1_DEAD, true).setSwitch(SW.MQ1_DONE, true).setSwitch(SW.MQ2_ACTIVE, true)
        .setVar(VAR.MAIN_STAGE, 3, 0)
        .text(['\\C[6]Kael\\C[0]: O Rei de Lumengarde precisa saber disso.'])
        .raw(123, ['A', 0])),
      conditions: {} }),
    pg({ conditions: { selfSwitchValid: true, selfSwitchCh: 'A' }, characterName: '',
      trigger: 0, priorityType: 0, list: S((s) => s.text(['O cristal está calmo agora.'])) }),
  ] }));

  register(18, 'Caverna Cristalina', makeMap({
    width: w, height: h, tilesetId: 3, data, events,
    displayName: 'Caverna Cristalina', autoplayBgm: true, bgm: 'Dungeon1',
    encounterList: [{ troopId: 2, weight: 5 }, { troopId: 5, weight: 4 }], encounterStep: 30,
  }), 2);
}

// =====================================================================
// BASTIÃO FINAL (mapa 5) — portão final + chefe final + finais
// =====================================================================
function buildBastion() {
  const w = 21, h = 17;
  const data = blankData(w, h, TILE.DIRT);
  border(data, w, h, 1, TILE.WALL);
  fillRect(data, w, h, 8, 0, 12, 1, 2, TILE.ROOF);
  let id = 0;
  const events = [];
  events.push(exitTo(++id, 10, 16, 26, 6));
  events.push(npc(++id, 6, 8, { name: 'Guardiã', char: 'People3', idx: 5,
    lines: ['Guardiã: Além do portão dorme o Devorador. Que a Aurora o guie.'] }));
  // portão final
  events.push(ev({ id: ++id, name: 'Portão', x: 10, y: 3, pages: [pg({
    characterName: '!Other2', characterIndex: 0, trigger: 0, priorityType: 1,
    list: S((s) => s.ifVar(VAR.FRAGMENTS, 3, 1,
      (b) => b.text(['Os Fragmentos brilham. O portão range e se abre.',
        'Como deseja enfrentar o \\C[2]Devorador\\C[0]?'], { position: 1 })
        .choice(['Refazer a Selagem', 'Destruí-lo', 'Tornar-me a Âncora'], [
          (c) => c.setVar(VAR.ENDING, 1, 0),
          (c) => c.setVar(VAR.ENDING, 2, 0),
          (c) => c.setVar(VAR.ENDING, 3, 0),
        ], { cancel: -1 })
        .bgm('Theme5', { volume: 80 })
        .text(['\\C[2]O Devorador de Auroras\\C[0] ergue-se das sombras!'], { position: 1 })
        .battle(11, { canEscape: false, canLose: false })
        .callCommon(6), // resolve o final
      (b) => b.text(['Guardiã: O portão não cede. Reúna os \\C[6]3 Fragmentos\\C[0].',
        'Você tem \\C[6]\\V[1]\\C[0].'], { position: 1 }))),
  })] }));

  register(5, 'Bastião Final', makeMap({
    width: w, height: h, tilesetId: 3, data, events,
    displayName: 'Bastião Final', autoplayBgm: true, bgm: 'Dungeon3',
  }), 1);
}

// ---------------- util de terreno de vila ----------------
function villageGround(w, h, ground = TILE.GRASS) {
  const data = blankData(w, h, ground);
  fillRect(data, w, h, 9, 7, 15, 11, 0, TILE.DIRT); // praça
  // casinhas decorativas
  for (const [hx, hy] of [[3, 3], [18, 3], [3, 13], [18, 13]]) {
    fillRect(data, w, h, hx, hy, hx + 3, hy + 1, 2, TILE.ROOF);
    fillRect(data, w, h, hx, hy + 2, hx + 3, hy + 2, 1, TILE.WALL);
  }
  return data;
}

function buildAll() {
  buildIntro();
  buildWorldMap();
  buildAuroria();
  buildCapital();
  buildElfWood();
  buildRoad();
  buildCave();
  buildBastion();
}

module.exports = { MAPS, INFO, buildAll };
