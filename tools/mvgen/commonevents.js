'use strict';
// Common Events = sistemas customizados (reputação, dia/noite, sidequest, fragmentos, finais).
const { cmdList, showText, setVar, setSwitch, ifVar, ifSwitch, elseBranch, tint, playSe,
  changeItem, recoverAll, callCommon } = require('./helpers');
const { SW, VAR } = require('./constants');

function commonEvents() {
  const mk = (id, name, trigger, switchId, builders) => ({
    id, name, trigger, switchId, list: cmdList(builders),
  });

  return [null,
    // 1: Alternar Dia/Noite (chamado por evento). Tonaliza a tela conforme switch NIGHT.
    mk(1, 'Ciclo Dia/Noite', 0, 1, [
      ifSwitch(SW.NIGHT, true),
      tint([-68, -68, 0, 68], 60, true),
      elseBranch(),
      tint([0, 0, 0, 0], 60, true),
      ({ push }) => push(0, [], 1),
    ]),

    // 2: Coletar Fragmento de Aurora (incrementa contador, dá item-chave, avisa).
    mk(2, 'Coletar Fragmento', 0, 1, [
      setVar(VAR.FRAGMENTS, 1, 1), // +1
      changeItem(20, 1, 0),
      playSe('Item3'),
      tint([68, 68, 34, 0], 30, true),
      tint([0, 0, 0, 0], 30, true),
      showText(['\\C[6]Um Fragmento de Aurora\\C[0] pulsa em suas mãos.',
        'Fragmentos coletados: \\C[6]\\V[1]\\C[0] de 6.']),
      ifVar(VAR.FRAGMENTS, 6, 1), // >= 6
      showText(['Os seis Fragmentos ressoam. O caminho para o Bastião Final se abre...']),
      setVar(VAR.MAIN_STAGE, 9, 0),
      elseBranch(),
      ({ push }) => push(0, [], 1),
    ]),

    // 3: Ganhar reputação com o Reino (+10).
    mk(3, 'Reputação +Reino', 0, 1, [
      setVar(VAR.REP_REALM, 10, 1),
      showText(['Sua reputação com o \\C[4]Reino\\C[0] aumentou.']),
    ]),

    // 4: Descanso em pousada (cura grupo + fala).
    mk(4, 'Descansar na Pousada', 0, 1, [
      ({ push }) => push(223, [[-255, -255, -255, 0], 30, true], 0), // escurece
      recoverAll(0),
      playSe('Recovery'),
      ({ push }) => push(223, [[0, 0, 0, 0], 30, true], 0),
      showText(['Você descansou. HP e MP totalmente recuperados!']),
    ]),

    // 5: Verificar conclusão da sidequest das Ervas (precisa de 5 Ervas Cristalinas).
    mk(5, 'Checar Quest Ervas', 0, 1, [
      ifVar(VAR.HERBS_COLLECTED, 5, 1), // >= 5
      showText(['Você reuniu as \\C[3]5 Ervas Cristalinas\\C[0]!',
        'A curandeira agradece e oferece uma recompensa.']),
      changeItem(2, 3, 0),
      setSwitch(SW.QUEST_HERBS_DONE, true),
      setSwitch(SW.QUEST_HERBS, false),
      callCommon(3),
      elseBranch(),
      showText(['Ainda faltam ervas. Coletadas: \\C[3]\\V[4]\\C[0] de 5.']),
      ({ push }) => push(0, [], 1),
    ]),

    // 6: Resolver o final conforme a escolha (VAR.ENDING).
    mk(6, 'Resolução do Final', 0, 1, [
      ifVar(VAR.ENDING, 1, 0),
      showText(['\\C[6]FINAL DA SELAGEM\\C[0]', 'Kael refaz a selagem ao custo de sua marca. A paz retorna — por ora.']),
      elseBranch(),
      ({ push }) => push(0, [], 1),
      ifVar(VAR.ENDING, 2, 0),
      showText(['\\C[2]FINAL DA DESTRUIÇÃO\\C[0]', 'O Devorador é destruído, mas a magia do mundo se apaga lentamente.']),
      elseBranch(),
      ({ push }) => push(0, [], 1),
      ifVar(VAR.ENDING, 3, 0),
      showText(['\\C[3]FINAL DO EQUILÍBRIO\\C[0]', 'Kael funde os Fragmentos a si mesmo, tornando-se a nova âncora viva da Aurora.']),
      elseBranch(),
      ({ push }) => push(0, [], 1),
    ]),
  ];
}

module.exports = { commonEvents };
