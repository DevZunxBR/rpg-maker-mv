'use strict';
// IDs centrais de switches e variáveis usados pela história e sistemas.

const SW = {
  INTRO_DONE: 1,        // intro assistida
  HAS_LYRA: 2,          // Lyra no grupo
  NIGHT: 3,             // ciclo dia/noite (ON = noite)
  QUEST_HERBS: 4,       // sidequest ervas ativa
  QUEST_HERBS_DONE: 5,  // sidequest ervas concluída
  BETRAYAL: 6,          // traição em Lumengarde aconteceu
  BOSS1_DEAD: 7,        // primeiro chefe derrotado
};

const VAR = {
  FRAGMENTS: 1,         // fragmentos de aurora coletados (0..6)
  REP_REALM: 2,         // reputação com o reino
  REP_ELVES: 3,         // reputação com os elfos
  HERBS_COLLECTED: 4,   // contador de ervas
  MAIN_STAGE: 5,        // estágio do arco principal (0..10)
  ENDING: 6,            // final escolhido (1..3)
};

// Quantidade total a alocar (deixamos folga para expansão)
const SWITCH_COUNT = 100;
const VARIABLE_COUNT = 100;

function buildSwitchNames() {
  const arr = new Array(SWITCH_COUNT + 1).fill('');
  const names = {
    [SW.INTRO_DONE]: 'Intro Vista', [SW.HAS_LYRA]: 'Lyra no Grupo', [SW.NIGHT]: 'Noite',
    [SW.QUEST_HERBS]: 'Quest Ervas Ativa', [SW.QUEST_HERBS_DONE]: 'Quest Ervas Concluída',
    [SW.BETRAYAL]: 'Traição Lumengarde', [SW.BOSS1_DEAD]: 'Chefe 1 Morto',
  };
  for (const [id, name] of Object.entries(names)) arr[id] = name;
  return arr;
}

function buildVariableNames() {
  const arr = new Array(VARIABLE_COUNT + 1).fill('');
  const names = {
    [VAR.FRAGMENTS]: 'Fragmentos de Aurora', [VAR.REP_REALM]: 'Reputação Reino',
    [VAR.REP_ELVES]: 'Reputação Elfos', [VAR.HERBS_COLLECTED]: 'Ervas Coletadas',
    [VAR.MAIN_STAGE]: 'Estágio Principal', [VAR.ENDING]: 'Final Escolhido',
  };
  for (const [id, name] of Object.entries(names)) arr[id] = name;
  return arr;
}

module.exports = { SW, VAR, buildSwitchNames, buildVariableNames };
