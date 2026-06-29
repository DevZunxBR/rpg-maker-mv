'use strict';
// Helpers para gerar comandos de evento e estruturas do RPG Maker MV.
// Todo comando é { code, indent, parameters }. A lista SEMPRE termina com { code:0 }.

/** Cria uma lista de comandos a partir de fábricas, normalizando indent e terminador. */
function cmdList(builders, baseIndent = 0) {
  const list = [];
  const push = (code, parameters = [], indent = baseIndent) =>
    list.push({ code, indent, parameters });

  for (const b of builders) {
    if (typeof b === 'function') b({ push, list, baseIndent });
    else if (Array.isArray(b)) list.push(...b);
    else if (b && typeof b === 'object') list.push(b);
  }
  // terminador obrigatório
  list.push({ code: 0, indent: baseIndent, parameters: [] });
  return list;
}

/** Show Text: faceName, faceIndex, background(0 janela,1 escuro,2 transp), position(0 cima,1 meio,2 baixo) + linhas */
function showText(lines, { face = '', faceIndex = 0, background = 0, position = 2 } = {}) {
  return ({ push, baseIndent }) => {
    push(101, [face, faceIndex, background, position], baseIndent);
    for (const ln of [].concat(lines)) push(401, [ln], baseIndent);
  };
}

/** Show Choices simples: choices[], default index, cancelType(-2 ramo,-1 desabilitado) */
function choices(choiceList, { cancelType = 0, defaultType = 0 } = {}) {
  return ({ push, baseIndent }) =>
    push(102, [choiceList, cancelType, defaultType, 2, 0], baseIndent);
}
function whenChoice(index, name) {
  return ({ push, baseIndent }) => push(402, [index, name], baseIndent);
}
function endBranch() {
  return ({ push, baseIndent }) => push(0, [], baseIndent + 1);
}

/** Controle de variável: id, operação(0=,1+,2-,3*,4/,5%), operand 0=const,1=var,... value */
function setVar(id, value, op = 0) {
  return ({ push, baseIndent }) => push(122, [id, id, op, 0, value], baseIndent);
}
/** Controle de switch: id, value (0 ON, 1 OFF) */
function setSwitch(id, on = true) {
  return ({ push, baseIndent }) => push(121, [id, id, on ? 0 : 1], baseIndent);
}

/** Transferir jogador: mapId, x, y, direction(0 manter,2 baixo,4 esq,6 dir,8 cima), fade(0 preto,1 branco,2 nenhum) */
function transfer(mapId, x, y, { direction = 0, fade = 0 } = {}) {
  return ({ push, baseIndent }) => push(201, [0, mapId, x, y, direction, fade], baseIndent);
}

/** Tonalidade de tela: [r,g,b,gray] (-255..255), duração frames, wait */
function tint(tone, duration = 60, wait = true) {
  return ({ push, baseIndent }) => push(223, [tone, duration, wait], baseIndent);
}
function flash(color, duration = 60, wait = true) {
  return ({ push, baseIndent }) => push(224, [color, duration, wait], baseIndent);
}
function shake(power = 5, speed = 5, duration = 60, wait = true) {
  return ({ push, baseIndent }) => push(225, [power, speed, duration, wait], baseIndent);
}
function wait(frames = 60) {
  return ({ push, baseIndent }) => push(230, [frames], baseIndent);
}
function fadeOut() { return ({ push, baseIndent }) => push(221, [], baseIndent); }
function fadeIn() { return ({ push, baseIndent }) => push(222, [], baseIndent); }

function playBgm(name, { volume = 90, pitch = 100, pan = 0 } = {}) {
  return ({ push, baseIndent }) => push(241, [{ name, volume, pitch, pan }], baseIndent);
}
function playSe(name, { volume = 90, pitch = 100, pan = 0 } = {}) {
  return ({ push, baseIndent }) => push(250, [{ name, volume, pitch, pan }], baseIndent);
}
function fadeoutBgm(seconds = 3) { return ({ push, baseIndent }) => push(242, [seconds], baseIndent); }

/** Chamar evento comum por id */
function callCommon(id) { return ({ push, baseIndent }) => push(117, [id], baseIndent); }

/** Itens / ouro / membros */
function changeGold(value, op = 0) { // op 0 ganhar, 1 perder
  return ({ push, baseIndent }) => push(125, [op, 0, value], baseIndent);
}
function changeItem(itemId, value, op = 0) {
  return ({ push, baseIndent }) => push(126, [itemId, op, 0, value], baseIndent);
}
function changeParty(actorId, add = true) { // add true=adicionar
  return ({ push, baseIndent }) => push(129, [actorId, add ? 0 : 1, 1], baseIndent);
}
function recoverAll(actorMode = 0) { // 0 = grupo inteiro
  return ({ push, baseIndent }) => push(314, [actorMode, 0], baseIndent);
}

/** Conditional branch por switch ON */
function ifSwitch(id, on = true) {
  return ({ push, baseIndent }) => push(111, [0, id, on ? 0 : 1], baseIndent);
}
/** Conditional branch por variável: id op(0=,1>=,2<=,3>,4<,5!=) value */
function ifVar(id, value, op = 0) {
  return ({ push, baseIndent }) => push(111, [1, id, 0, value, op], baseIndent);
}
function elseBranch() { return ({ push, baseIndent }) => push(411, [], baseIndent); }

/** Iniciar batalha: troopId, canEscape, canLose */
function battle(troopId, { canEscape = true, canLose = false } = {}) {
  return ({ push, baseIndent }) => push(301, [0, troopId, canEscape, canLose], baseIndent);
}

/** Abre loja: goods = [[0,itemId,priceType,price,?],...] */
function shop(goods, purchaseOnly = false) {
  return ({ push, baseIndent }) => push(302, [...goods[0], purchaseOnly], baseIndent)
    || goods.slice(1).forEach(g => push(605, [...g], baseIndent));
}

module.exports = {
  cmdList, showText, choices, whenChoice, endBranch, setVar, setSwitch, transfer,
  tint, flash, shake, wait, fadeOut, fadeIn, playBgm, playSe, fadeoutBgm, callCommon,
  changeGold, changeItem, changeParty, recoverAll, ifSwitch, ifVar, elseBranch, battle, shop,
};
