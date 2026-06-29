'use strict';
// IDs centrais de switches e variáveis usados pela história, quests e sistemas.

const SW = {
  // história / mundo
  INTRO_DONE: 1,        // intro assistida
  HAS_LYRA: 2,          // Lyra no grupo
  NIGHT: 3,             // ciclo dia/noite (ON = noite)
  BETRAYAL: 6,          // traição na capital aconteceu
  BOSS1_DEAD: 7,        // chefe da caverna derrotado
  KING_MET: 8,          // falou com o rei
  FINAL_OPEN: 9,        // portão final liberado

  // Missões da HISTÓRIA (status ativo/concluído)
  MQ1_ACTIVE: 10, MQ1_DONE: 11,   // O Despertar (caverna + fragmento)
  MQ2_ACTIVE: 12, MQ2_DONE: 13,   // Audiência na Capital
  MQ3_ACTIVE: 14, MQ3_DONE: 15,   // A Traição
  MQ4_ACTIVE: 16, MQ4_DONE: 17,   // O Bastião Final

  // Missões SECUNDÁRIAS
  SQ_HERBS_ACTIVE: 20, SQ_HERBS_DONE: 21,       // Ervas Cristalinas
  SQ_WOLVES_ACTIVE: 22, SQ_WOLVES_DONE: 23,     // Caça aos Lobos
  SQ_DELIVERY_ACTIVE: 24, SQ_DELIVERY_DONE: 25, // A Encomenda
  SQ_ELF_ACTIVE: 26, SQ_ELF_DONE: 27,           // O Favor dos Elfos
};

const VAR = {
  FRAGMENTS: 1,         // fragmentos de aurora coletados (0..6)
  REP_REALM: 2,         // reputação com o reino
  REP_ELVES: 3,         // reputação com os elfos
  HERBS_COLLECTED: 4,   // contador de ervas
  MAIN_STAGE: 5,        // estágio do arco principal (0..10)
  ENDING: 6,            // final escolhido (1..3)
  WOLVES_KILLED: 7,     // lobos abatidos (sidequest)
  ACTIVE_SIDE: 8,       // contador de secundárias ativas (para o diário)
};

const SWITCH_COUNT = 100;
const VARIABLE_COUNT = 100;

const SW_NAMES = {
  [SW.INTRO_DONE]: 'Intro Vista', [SW.HAS_LYRA]: 'Lyra no Grupo', [SW.NIGHT]: 'Noite',
  [SW.BETRAYAL]: 'Traição', [SW.BOSS1_DEAD]: 'Chefe 1 Morto', [SW.KING_MET]: 'Falou com Rei',
  [SW.FINAL_OPEN]: 'Portão Final Aberto',
  [SW.MQ1_ACTIVE]: 'MQ1 Ativa', [SW.MQ1_DONE]: 'MQ1 Concluída',
  [SW.MQ2_ACTIVE]: 'MQ2 Ativa', [SW.MQ2_DONE]: 'MQ2 Concluída',
  [SW.MQ3_ACTIVE]: 'MQ3 Ativa', [SW.MQ3_DONE]: 'MQ3 Concluída',
  [SW.MQ4_ACTIVE]: 'MQ4 Ativa', [SW.MQ4_DONE]: 'MQ4 Concluída',
  [SW.SQ_HERBS_ACTIVE]: 'SQ Ervas Ativa', [SW.SQ_HERBS_DONE]: 'SQ Ervas Concluída',
  [SW.SQ_WOLVES_ACTIVE]: 'SQ Lobos Ativa', [SW.SQ_WOLVES_DONE]: 'SQ Lobos Concluída',
  [SW.SQ_DELIVERY_ACTIVE]: 'SQ Encomenda Ativa', [SW.SQ_DELIVERY_DONE]: 'SQ Encomenda Concluída',
  [SW.SQ_ELF_ACTIVE]: 'SQ Elfos Ativa', [SW.SQ_ELF_DONE]: 'SQ Elfos Concluída',
};

const VAR_NAMES = {
  [VAR.FRAGMENTS]: 'Fragmentos de Aurora', [VAR.REP_REALM]: 'Reputação Reino',
  [VAR.REP_ELVES]: 'Reputação Elfos', [VAR.HERBS_COLLECTED]: 'Ervas Coletadas',
  [VAR.MAIN_STAGE]: 'Estágio Principal', [VAR.ENDING]: 'Final Escolhido',
  [VAR.WOLVES_KILLED]: 'Lobos Abatidos', [VAR.ACTIVE_SIDE]: 'Secundárias Ativas',
};

function buildSwitchNames() {
  const arr = new Array(SWITCH_COUNT + 1).fill('');
  for (const [id, name] of Object.entries(SW_NAMES)) arr[id] = name;
  return arr;
}
function buildVariableNames() {
  const arr = new Array(VARIABLE_COUNT + 1).fill('');
  for (const [id, name] of Object.entries(VAR_NAMES)) arr[id] = name;
  return arr;
}

module.exports = { SW, VAR, buildSwitchNames, buildVariableNames };
