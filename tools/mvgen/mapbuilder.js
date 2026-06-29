'use strict';
// Construtor de mapas válidos para RPG Maker MV.
// O array `data` tem comprimento width*height*6 (6 camadas z: 0,1,2,3 tiles + 4 sombra + 5 região).
// Autotiles A começam em 2048. Usamos ids de autotile padrão do RTP para piso/parede.

// IDs de autotile (canto superior-esquerdo de cada bloco A2/A4). Funcionam com qualquer
// tileset que tenha as imagens A1..A5 do RTP carregadas.
const TILE = {
  GRASS: 2816,   // A2 piso 1 (grama)
  DIRT: 2864,    // A2 piso (terra) aprox
  WATER: 2048,   // A1 água animada
  FLOOR_WOOD: 2912, // A2 piso de madeira aprox
  WALL: 4352,    // A4 parede
  ROOF: 4736,    // A3 telhado aprox
};

function blankData(w, h, ground = TILE.GRASS) {
  const size = w * h;
  const data = new Array(size * 6).fill(0);
  // camada z=0 recebe o piso base
  for (let i = 0; i < size; i++) data[i] = ground;
  return data;
}

/** Define um tile numa camada específica (z 0..5) */
function setTile(data, w, h, x, y, z, tileId) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  data[(z * h + y) * w + x] = tileId;
}

/** Desenha um retângulo de piso numa camada */
function fillRect(data, w, h, x0, y0, x1, y1, z, tileId) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) setTile(data, w, h, x, y, z, tileId);
}

/** Desenha bordas (moldura) — útil para paredes de interiores */
function border(data, w, h, z, tileId) {
  for (let x = 0; x < w; x++) { setTile(data, w, h, x, 0, z, tileId); setTile(data, w, h, x, h - 1, z, tileId); }
  for (let y = 0; y < h; y++) { setTile(data, w, h, 0, y, z, tileId); setTile(data, w, h, w - 1, y, z, tileId); }
}

let _eventSeq = 0;
/** Cria um objeto de evento de mapa com uma única página. */
function makeEvent({ id, name = '', x, y, pages }) {
  return {
    id: id != null ? id : ++_eventSeq,
    name,
    note: '',
    pages: pages && pages.length ? pages : [emptyPage()],
    x, y,
  };
}

function emptyPage() {
  return page({ list: [{ code: 0, indent: 0, parameters: [] }] });
}

/**
 * Página de evento.
 * trigger: 0 Botão de Ação, 1 Toque do jogador, 2 Toque do evento, 3 Automático, 4 Paralelo
 * priorityType: 0 abaixo, 1 mesmo nível (sólido), 2 acima
 */
function page({
  list,
  trigger = 0,
  priorityType = 1,
  characterName = '',
  characterIndex = 0,
  direction = 2,
  pattern = 1,
  conditions = {},
  walkAnime = true,
  stepAnime = false,
  directionFix = false,
  through = false,
  moveType = 0,
  moveSpeed = 3,
  moveFrequency = 3,
  tileId = 0,
}) {
  return {
    conditions: Object.assign({
      actorId: 1, actorValid: false,
      itemId: 1, itemValid: false,
      selfSwitchCh: 'A', selfSwitchValid: false,
      switch1Id: 1, switch1Valid: false,
      switch2Id: 1, switch2Valid: false,
      variableId: 1, variableValid: false, variableValue: 0,
    }, conditions),
    directionFix,
    image: { tileId, characterName, direction, pattern, characterIndex },
    list,
    moveFrequency, moveRoute: {
      list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false,
    },
    moveSpeed, moveType, priorityType, stepAnime, through, trigger, walkAnime,
  };
}

/** Monta o objeto de mapa completo. events deve ter null na posição 0. */
function makeMap({
  width, height, tilesetId = 1, data, events,
  displayName = '', bgm = '', autoplayBgm = false,
  encounterList = [], encounterStep = 30, note = '', parallaxName = '',
}) {
  return {
    autoplayBgm,
    autoplayBgs: false,
    battleback1Name: '',
    battleback2Name: '',
    bgm: { name: bgm, pan: 0, pitch: 100, volume: 90 },
    bgs: { name: '', pan: 0, pitch: 100, volume: 90 },
    disableDashing: false,
    displayName,
    encounterList,
    encounterStep,
    height,
    note,
    parallaxLoopX: false,
    parallaxLoopY: false,
    parallaxName,
    parallaxShow: true,
    parallaxSx: 0,
    parallaxSy: 0,
    scrollType: 0,
    specifyBattleback: false,
    tilesetId,
    width,
    data,
    events: [null, ...events],
  };
}

module.exports = {
  TILE, blankData, setTile, fillRect, border, makeEvent, page, emptyPage, makeMap,
};
