'use strict';
// Sistema de missões: metadados + Diário (resumo) + Quadro (aceitar secundárias).
// As funções recebem um Script `s` e anexam comandos com indentação correta.
const { SW, VAR } = require('./constants');

const MAIN = [
  { key: 'MQ1', name: 'O Despertar', active: SW.MQ1_ACTIVE, done: SW.MQ1_DONE,
    desc: 'Recupere o primeiro Fragmento na Caverna Cristalina.' },
  { key: 'MQ2', name: 'Audiência na Capital', active: SW.MQ2_ACTIVE, done: SW.MQ2_DONE,
    desc: 'Leve a notícia do Fragmento ao Rei em Lumengarde.' },
  { key: 'MQ3', name: 'A Traição', active: SW.MQ3_ACTIVE, done: SW.MQ3_DONE,
    desc: 'Escape da capital e descubra a verdade sobre o Conselheiro.' },
  { key: 'MQ4', name: 'O Bastião Final', active: SW.MQ4_ACTIVE, done: SW.MQ4_DONE,
    desc: 'Reúna os seis Fragmentos e enfrente o Devorador.' },
];

const SIDE = [
  { key: 'SQ_HERBS', name: 'Ervas Cristalinas', active: SW.SQ_HERBS_ACTIVE, done: SW.SQ_HERBS_DONE,
    desc: 'Colete 5 Ervas Cristalinas para a curandeira.', board: false, reward: 'Poção Maior x3' },
  { key: 'SQ_WOLVES', name: 'Caça aos Lobos', active: SW.SQ_WOLVES_ACTIVE, done: SW.SQ_WOLVES_DONE,
    desc: 'Abata 3 Lobos Sombrios nas estradas.', board: true, reward: '300 Auros + Poção Maior x2' },
  { key: 'SQ_DELIVERY', name: 'A Encomenda', active: SW.SQ_DELIVERY_ACTIVE, done: SW.SQ_DELIVERY_DONE,
    desc: 'Leve o pacote do mercador ao ferreiro élfico.', board: true, reward: 'Anel da Aurora' },
  { key: 'SQ_ELF', name: 'O Favor dos Elfos', active: SW.SQ_ELF_ACTIVE, done: SW.SQ_ELF_DONE,
    desc: 'Ajude a Anciã Élfica do Bosque dos Sussurros.', board: false, reward: 'Arco Élfico' },
];

// Mostra o status de uma quest no diário (só aparece se ativa ou concluída).
function questStatus(s, q) {
  s.ifSwitch(q.done,
    (b) => b.text(['\\C[3]\\I[87] ' + q.name + ' — CONCLUÍDA\\C[0]'], { background: 1, position: 1 }),
    (b) => b.ifSwitch(q.active,
      (c) => c.text(['\\C[6]\\I[4] ' + q.name + '\\C[0]', '   ' + q.desc], { background: 1, position: 1 })
    )
  );
}

// DIÁRIO DE MISSÕES — resumo elegante.
function journal(s) {
  s.se('Book1');
  s.text(['\\}\\C[6]✦ DIÁRIO DE MISSÕES ✦\\C[0]\\{',
    'Fragmentos de Aurora: \\C[6]\\V[1]\\C[0] / 3'], { background: 1, position: 0 });
  s.text(['\\C[14]— Missões da História —\\C[0]'], { background: 1, position: 1 });
  for (const q of MAIN) questStatus(s, q);
  s.text(['\\C[14]— Missões Secundárias —\\C[0]'], { background: 1, position: 1 });
  for (const q of SIDE) questStatus(s, q);
}

// QUADRO DE MISSÕES — aceitar secundárias do mural.
function board(s) {
  const quests = SIDE.filter((q) => q.board);
  s.se('Book2');
  s.text(['\\}\\C[6]✦ QUADRO DE MISSÕES ✦\\C[0]\\{', 'Pedidos de ajuda fixados pelos aldeões.'],
    { background: 1, position: 1 });

  const labels = quests.map((q) => q.name).concat(['Sair']);
  const handlers = quests.map((q) => (b) => {
    b.ifSwitch(q.done,
      (c) => c.text([q.name + ': \\C[3]já concluída.\\C[0] Obrigado!'], { position: 1 }),
      (c) => c.ifSwitch(q.active,
        (d) => d.text([q.name + ': \\C[6]já aceita.\\C[0]', q.desc], { position: 1 }),
        (d) => d.text(['\\C[6]' + q.name + '\\C[0]', q.desc, 'Recompensa: \\C[3]' + q.reward + '\\C[0]'],
          { position: 1 })
          .choice(['Aceitar', 'Agora não'], [
            (e) => e.setSwitch(q.active, true).setVar(VAR.ACTIVE_SIDE, 1, 1).se('Decision2')
              .text(['Missão \\C[6]' + q.name + '\\C[0] aceita! (Veja o Diário.)'], { position: 1 }),
            null,
          ], { cancel: 1 })
      )
    );
  });
  handlers.push((b) => b); // "Sair" não faz nada
  s.choice(labels, handlers, { cancel: quests.length });
}

module.exports = { MAIN, SIDE, journal, board };
