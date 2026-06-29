'use strict';
const MB = require('./mapbuilder');
const { TILE, blankData, setTile, fillRect, border, makeEvent, page, makeMap } = MB;
const H = require('./helpers');
const { SW, VAR } = require('./constants');

// Registro de todos os mapas: id -> objeto de mapa. MapInfos é derivado disso.
const MAPS = {};
const INFO = {}; // id -> {name, parentId, order}

function register(id, name, mapObj, parentId = 0) {
  MAPS[id] = mapObj;
  INFO[id] = { name, parentId };
}

// ---------- página de NPC simples que fala ----------
function npc(id, x, y, name, lines, charName = 'People1', charIndex = 0, dir = 2) {
  return makeEvent({
    id, name, x, y,
    pages: [page({
      characterName: charName, characterIndex: charIndex, direction: dir,
      trigger: 0, priorityType: 1,
      list: H.cmdList([H.showText(lines, { position: 2 })]),
    })],
  });
}

// ---------- porta/transferência ----------
function door(id, x, y, toMap, toX, toY, charName = '', charIndex = 0) {
  return makeEvent({
    id, name: 'porta', x, y,
    pages: [page({
      characterName: charName, characterIndex: charIndex,
      trigger: 1, priorityType: 1,
      list: H.cmdList([H.transfer(toMap, toX, toY, { fade: 0 })]),
    })],
  });
}

// ---------- placa do vilarejo ----------
function sign(id, x, y, lines) {
  return makeEvent({
    id, name: 'placa', x, y,
    pages: [page({
      tileId: 0, characterName: '', trigger: 0, priorityType: 1,
      list: H.cmdList([H.showText(lines, { background: 1 })]),
    })],
  });
}

// =====================================================================
// INTRO (mapa 100, autorun) — abertura roteirizada da história
// =====================================================================
function buildIntro() {
  const w = 17, h = 13;
  const data = blankData(w, h, TILE.GRASS);
  fillRect(data, w, h, 6, 5, 10, 8, 0, TILE.DIRT);

  const introEvent = makeEvent({
    id: 1, name: 'INTRO', x: 8, y: 7,
    pages: [page({
      trigger: 3, // automático
      priorityType: 0, through: true,
      list: H.cmdList([
        H.tint([-255, -255, -255, 255], 1, false),
        H.playBgm('Theme6'),
        H.wait(40),
        H.showText([
          'Há trezentos anos, os Seladores aprisionaram o',
          '\\C[6]Devorador de Auroras\\C[0] — aquele que consome a luz do mundo.',
        ], { background: 1, position: 1 }),
        H.tint([-150, -150, -120, 120], 120, true),
        H.showText([
          'Mas a selagem se desfaz. As auroras minguam.',
          'Vilarejos perdem a cor... e a memória.',
        ], { background: 1, position: 1 }),
        H.shake(6, 6, 90, true),
        H.flash([255, 255, 200, 170], 30, true),
        H.showText([
          'E numa noite sem estrelas, em \\C[4]Vilar de Auroria\\C[0],',
          'a marca de um antigo Selador desperta na pele de um jovem.',
        ], { background: 1, position: 1 }),
        H.wait(30),
        H.tint([0, 0, 0, 0], 120, true),
        H.fadeoutBgm(2),
        H.setSwitch(SW.INTRO_DONE, true),
        H.setVar(VAR.MAIN_STAGE, 1, 0),
        // Itens-chave iniciais
        H.changeItem(21, 1, 0), // Mapa
        H.changeItem(22, 1, 0), // Diário
        // Vai para a vila natal (mapa 2)
        H.transfer(2, 8, 10, { fade: 0 }),
      ]),
    })],
  });

  register(100, 'INTRO', makeMap({
    width: w, height: h, tilesetId: 1, data, events: [introEvent],
    displayName: '', autoplayBgm: false,
  }));
}

// =====================================================================
// WORLD MAP (mapa 1) — pontos de entrada para os vilarejos
// =====================================================================
function buildWorldMap(villageList) {
  const w = 35, h = 25;
  const data = blankData(w, h, TILE.GRASS);
  // alguns "lagos"
  fillRect(data, w, h, 2, 2, 6, 5, 0, TILE.WATER);
  fillRect(data, w, h, 26, 17, 31, 21, 0, TILE.WATER);

  const events = [];
  let eid = 1;
  // distribui entradas dos vilarejos em grade
  villageList.forEach((v, i) => {
    const x = 3 + (i % 6) * 5;
    const y = 4 + Math.floor(i / 6) * 6;
    events.push(makeEvent({
      id: eid++, name: v.name, x, y,
      pages: [page({
        characterName: 'Flame', characterIndex: 0, trigger: 0, priorityType: 1, stepAnime: true,
        list: H.cmdList([
          H.showText(['Viajar para \\C[6]' + v.name + '\\C[0]?'], { background: 1, position: 1 }),
          H.choices(['Sim', 'Não'], { cancelType: 1 }),
          H.whenChoice(0, 'Sim'),
          ({ push }) => push(201, [0, v.id, v.entryX, v.entryY, 2, 0], 1),
          ({ push }) => push(0, [], 1),
          H.whenChoice(1, 'Não'),
          ({ push }) => push(0, [], 1),
        ]),
      })],
    }));
  });

  register(1, 'Mapa de Aethelgard', makeMap({
    width: w, height: h, tilesetId: 4, data, events,
    displayName: 'Aethelgard', autoplayBgm: true, bgm: 'Field2',
    encounterList: [{ troopId: 1, weight: 5 }, { troopId: 4, weight: 4 }],
    encounterStep: 40,
  }));
}

// =====================================================================
// GERADOR DE VILAREJO
// =====================================================================
function buildVillage(v) {
  const w = 25, h = 19;
  const data = blankData(w, h, v.ground || TILE.GRASS);
  // praça central de terra
  fillRect(data, w, h, 9, 7, 15, 11, 0, TILE.DIRT);
  // alguns "blocos" de casas (telhado na camada superior)
  const houseSpots = [[3, 3], [18, 3], [3, 13], [18, 13]];
  for (const [hx, hy] of houseSpots) {
    fillRect(data, w, h, hx, hy, hx + 3, hy + 2, 2, TILE.ROOF); // telhado (z=2 acima)
    fillRect(data, w, h, hx, hy + 2, hx + 3, hy + 2, 1, TILE.WALL); // parede (z=1)
  }

  const events = [];
  let eid = 1;

  // placa de entrada
  events.push(sign(eid++, 12, 13, ['\\}' + v.name + '\\{', v.tagline]));

  // saída para o world map (sul)
  events.push(makeEvent({
    id: eid++, name: 'saída', x: 12, y: 18,
    pages: [page({
      trigger: 1, priorityType: 0, through: true,
      list: H.cmdList([
        H.showText(['Voltar ao mapa-múndi?'], { background: 1, position: 1 }),
        H.choices(['Sim', 'Não'], { cancelType: 1 }),
        H.whenChoice(0, 'Sim'),
        ({ push }) => push(201, [0, 1, 3 + (v.index % 6) * 5, 5 + Math.floor(v.index / 6) * 6, 2, 0], 1),
        ({ push }) => push(0, [], 1),
        H.whenChoice(1, 'Não'),
        ({ push }) => push(0, [], 1),
      ]),
    })],
  }));

  // NPCs (gerados a partir da config)
  (v.npcs || []).forEach((n, i) => {
    events.push(npc(eid++, n.x, n.y, n.name, n.lines, n.char || 'People1', n.idx || (i % 8), n.dir || 2));
  });

  // pousada
  events.push(makeEvent({
    id: eid++, name: 'pousada', x: 6, y: 9,
    pages: [page({
      characterName: 'People4', characterIndex: 3, trigger: 0, priorityType: 1,
      list: H.cmdList([
        H.showText(['Estalajadeiro: Descansar custa 30 ' + 'Auros. Aceita?'], { position: 2 }),
        H.choices(['Sim', 'Não'], { cancelType: 1 }),
        H.whenChoice(0, 'Sim'),
        ({ push }) => push(125, [1, 0, 30], 1), // perder 30 ouro
        ({ push }) => push(117, [4], 1), // common event descansar
        ({ push }) => push(0, [], 1),
        H.whenChoice(1, 'Não'),
        ({ push }) => push(0, [], 1),
      ]),
    })],
  }));

  // loja
  events.push(makeEvent({
    id: eid++, name: 'loja', x: 19, y: 9,
    pages: [page({
      characterName: 'People2', characterIndex: 5, trigger: 0, priorityType: 1,
      list: H.cmdList([
        H.showText(['Mercador: Bem-vindo! Dê uma olhada.'], { position: 2 }),
        ({ push }) => {
          push(302, [0, 1, 0, 0, 0], 1); // Poção
          push(605, [0, 3, 0, 0, 0], 1); // Éter
          push(605, [0, 5, 0, 0, 0], 1); // Antídoto
          push(605, [1, 1, 0, 0, 0], 1); // Espada de Ferro
          push(605, [2, 4, 0, 0, 0], 1); // Túnica
        },
        ({ push }) => push(0, [], 1),
      ]),
    })],
  }));

  // evento especial do vilarejo (ex: fragmento, quest, chefe)
  if (v.special) v.special({ events, addId: () => eid++, page, makeEvent, H, SW, VAR });

  register(v.id, v.name, makeMap({
    width: w, height: h, tilesetId: 1, data, events,
    displayName: v.name, autoplayBgm: true, bgm: v.bgm || 'Town1',
  }), 1);
}

// =====================================================================
// DUNGEON GENÉRICA (caverna do cristal com chefe + fragmento)
// =====================================================================
function buildCrystalCave() {
  const w = 21, h = 17;
  const data = blankData(w, h, TILE.FLOOR_WOOD);
  border(data, w, h, 1, TILE.WALL);
  fillRect(data, w, h, 1, 1, w - 2, h - 2, 0, TILE.DIRT);

  const events = [];
  let eid = 1;
  // saída
  events.push(door(eid++, 10, 16, 2, 12, 4)); // volta para Auroria (mapa 2)
  // chefe guardião
  events.push(makeEvent({
    id: eid++, name: 'Golem', x: 10, y: 4,
    pages: [
      page({
        characterName: 'Monster', characterIndex: 4, trigger: 0, priorityType: 1, stepAnime: true,
        list: H.cmdList([
          H.showText(['Um \\C[2]Golem Guardião\\C[0] desperta diante do cristal!'], { position: 1 }),
          H.battle(10, { canEscape: false, canLose: false }),
          H.setSwitch(SW.BOSS1_DEAD, true),
          H.showText(['O guardião se desfaz. O cristal pulsa com luz.']),
          H.callCommon(2), // coletar fragmento
        ]),
        conditions: { selfSwitchValid: true, selfSwitchCh: 'A' },
      }),
    ],
  }));
  // ao derrotar, selfswitch via switch global BOSS1_DEAD: segunda página vazia
  events[events.length - 1].pages.push(page({
    conditions: { switch1Valid: true, switch1Id: SW.BOSS1_DEAD },
    trigger: 0, priorityType: 0, characterName: '',
    list: H.cmdList([H.showText(['O cristal está calmo agora.'])]),
  }));

  register(18, 'Caverna Cristalina', makeMap({
    width: w, height: h, tilesetId: 3, data, events,
    displayName: 'Caverna Cristalina', autoplayBgm: true, bgm: 'Dungeon1',
    encounterList: [{ troopId: 2, weight: 5 }, { troopId: 5, weight: 4 }],
    encounterStep: 30,
  }), 2);
}

module.exports = {
  MAPS, INFO, register, buildIntro, buildWorldMap, buildVillage, buildCrystalCave,
};
