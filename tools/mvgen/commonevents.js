'use strict';
// Common Events = sistemas: dia/noite, fragmento, reputação, pousada, médico,
// finais, quadro de missões, diário, e checagens das secundárias.
const { Script } = require('./helpers');
const { SW, VAR } = require('./constants');
const Q = require('./quests');

function ce(id, name, build, { trigger = 0, switchId = 1 } = {}) {
  const s = new Script();
  build(s);
  return { id, name, trigger, switchId, list: s.build() };
}

function commonEvents() {
  return [null,
    // 1: Ciclo Dia/Noite — tonaliza a tela conforme o switch NIGHT.
    ce(1, 'Ciclo Dia/Noite', (s) => {
      s.ifSwitch(SW.NIGHT,
        (b) => b.tint([-68, -68, 0, 68], 60, true),
        (b) => b.tint([0, 0, 0, 0], 60, true));
    }),

    // 2: Coletar Fragmento de Aurora.
    ce(2, 'Coletar Fragmento', (s) => {
      s.setVar(VAR.FRAGMENTS, 1, 1);
      s.item(20, 1, 0);
      s.se('Item3');
      s.flash([255, 255, 200, 170], 30, true);
      s.tint([68, 68, 34, 0], 30, true);
      s.tint([0, 0, 0, 0], 30, true);
      s.text(['\\C[6]Um Fragmento de Aurora\\C[0] pulsa em suas mãos.',
        'Fragmentos coletados: \\C[6]\\V[1]\\C[0] de 3.']);
      s.ifVar(VAR.FRAGMENTS, 3, 1,
        (b) => b.text(['Os três Fragmentos maiores ressoam!', 'O caminho para o \\C[2]Bastião Final\\C[0] se abre...'])
          .setSwitch(SW.FINAL_OPEN, true).setSwitch(SW.MQ4_ACTIVE, true).setVar(VAR.MAIN_STAGE, 9, 0));
    }),

    // 3: Reputação +Reino.
    ce(3, 'Reputação +Reino', (s) => {
      s.setVar(VAR.REP_REALM, 10, 1);
      s.text(['Sua reputação com o \\C[4]Reino\\C[0] aumentou.']);
    }),

    // 4: Pousada — descansar por 30 Auros.
    ce(4, 'Pousada', (s) => {
      s.text(['\\C[6]Estalajadeiro\\C[0]: Uma boa noite de sono custa 30 Auros. Aceita?'], { position: 2 });
      s.choice(['Descansar', 'Agora não'], [
        (b) => b.gold(30, 1).tint([-255, -255, -255, 0], 30, true).se('Recovery').recoverAll()
          .wait(40).tint([0, 0, 0, 0], 30, true).text(['HP e MP totalmente recuperados!']),
        null,
      ], { cancel: 1 });
    }),

    // 5: Médico / Clínica — cura status e revive por 50 Auros.
    ce(5, 'Médico', (s) => {
      s.text(['\\C[6]Médica\\C[0]: Posso tratar ferimentos, venenos e reviver aliados.',
        'O tratamento custa 50 Auros. Deseja ser atendido?'], { position: 2 });
      s.choice(['Tratar grupo', 'Não, obrigado'], [
        (b) => b.gold(50, 1).se('Heal5').flash([170, 255, 170, 100], 30, true).recoverAll()
          .text(['Todo o grupo foi curado e revivido. Cuide-se por aí!']),
        null,
      ], { cancel: 1 });
    }),

    // 6: Resolução dos finais.
    ce(6, 'Resolução do Final', (s) => {
      s.ifVar(VAR.ENDING, 1, 0,
        (b) => b.text(['\\C[6]FINAL DA SELAGEM\\C[0]',
          'Kael refaz a selagem ao custo de sua marca. A paz retorna — por ora.']));
      s.ifVar(VAR.ENDING, 2, 0,
        (b) => b.text(['\\C[2]FINAL DA DESTRUIÇÃO\\C[0]',
          'O Devorador é destruído, mas a magia do mundo se apaga lentamente.']));
      s.ifVar(VAR.ENDING, 3, 0,
        (b) => b.text(['\\C[3]FINAL DO EQUILÍBRIO\\C[0]',
          'Kael torna-se a nova âncora viva da Aurora. Um novo ciclo começa.']));
      s.setSwitch(SW.MQ4_DONE, true);
      s.wait(60);
      s.fadeoutBgm(3);
      s.scroll(['', 'As Crônicas de Aethelgard', '', 'Obrigado por jogar!', '',
        'Um RPG criado com RPG Maker MV.', ''], { speed: 3 });
      s.raw(353, []); // Game Over / volta ao título
    }),

    // 7: Quadro de Missões.
    ce(7, 'Quadro de Missões', (s) => Q.board(s)),

    // 8: Diário de Missões.
    ce(8, 'Diário de Missões', (s) => Q.journal(s)),

    // 9: Checar quest das Ervas (precisa de 5 ervas).
    ce(9, 'Checar Ervas', (s) => {
      s.ifVar(VAR.HERBS_COLLECTED, 5, 1,
        (b) => b.text(['Você reuniu as \\C[3]5 Ervas Cristalinas\\C[0]!', 'A curandeira agradece.'])
          .item(2, 3, 0).setSwitch(SW.SQ_HERBS_DONE, true).setSwitch(SW.SQ_HERBS_ACTIVE, false)
          .setVar(VAR.ACTIVE_SIDE, 1, 2).callCommon(3),
        (b) => b.text(['Ainda faltam ervas. Coletadas: \\C[3]\\V[4]\\C[0] de 5.']));
    }),

    // 10: Checar Caça aos Lobos (3 lobos).
    ce(10, 'Checar Lobos', (s) => {
      s.ifVar(VAR.WOLVES_KILLED, 3, 1,
        (b) => b.text(['\\C[6]Caça aos Lobos\\C[0] concluída! As estradas estão mais seguras.'])
          .gold(300, 0).item(2, 2, 0).setSwitch(SW.SQ_WOLVES_DONE, true)
          .setSwitch(SW.SQ_WOLVES_ACTIVE, false).setVar(VAR.ACTIVE_SIDE, 1, 2),
        (b) => b.text(['Lobos abatidos: \\C[6]\\V[7]\\C[0] de 3. Continue a caçada.']));
    }),

    // 11: Entregar a Encomenda (precisa estar ativa).
    ce(11, 'Entregar Encomenda', (s) => {
      s.ifSwitch(SW.SQ_DELIVERY_ACTIVE,
        (b) => b.ifSwitch(SW.SQ_DELIVERY_DONE,
          (c) => c.text(['Ferreiro: Já recebi a encomenda. Obrigado!']),
          (c) => c.text(['Ferreiro: Ah, a encomenda do mercador! Tome sua recompensa.'])
            .armor(7, 1, 0).setSwitch(SW.SQ_DELIVERY_DONE, true)
            .setSwitch(SW.SQ_DELIVERY_ACTIVE, false).setVar(VAR.ACTIVE_SIDE, 1, 2)),
        (b) => b.text(['Ferreiro: Você não está entregando nada para mim... ainda.']));
    }),
  ];
}

module.exports = { commonEvents };
