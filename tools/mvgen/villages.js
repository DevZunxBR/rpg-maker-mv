'use strict';
const { TILE } = require('./mapbuilder');
const { SW, VAR } = require('./constants');

// Configuração dos 16 vilarejos. id de mapa começa em 2.
// entryX/entryY = posição do jogador ao chegar (canto sul do mapa-múndi).
const villages = [
  {
    name: 'Vilar de Auroria', tagline: 'Vila natal de Kael', bgm: 'Town1',
    npcs: [
      { x: 6, y: 5, name: 'Mãe de Kael', lines: ['Mãe: Kael! Sua marca... ela brilha de novo.', 'Tome cuidado, filho. O mundo mudou esta noite.'] },
      { x: 17, y: 6, name: 'Ancião', lines: ['Ancião: A \\C[6]Caverna Cristalina\\C[0] ao norte guarda um Fragmento.', 'Mas um guardião o protege há séculos.'] },
      { x: 12, y: 14, name: 'Criança', lines: ['Criança: As cores do céu sumiram... que medo.'] },
    ],
    // entrada da caverna (norte)
    special: ({ events, addId, page, makeEvent, H }) => {
      events.push(makeEvent({
        id: addId(), name: 'entrada caverna', x: 12, y: 2,
        pages: [page({
          characterName: '', trigger: 1, priorityType: 0, through: true,
          list: H.cmdList([
            H.showText(['Entrar na \\C[6]Caverna Cristalina\\C[0]?'], { background: 1, position: 1 }),
            H.choices(['Entrar', 'Voltar'], { cancelType: 1 }),
            H.whenChoice(0, 'Entrar'),
            ({ push }) => push(201, [0, 18, 10, 15, 8, 0], 1),
            ({ push }) => push(0, [], 1),
            H.whenChoice(1, 'Voltar'),
            ({ push }) => push(0, [], 1),
          ]),
        })],
      }));
    },
  },
  { name: 'Porto Maré-Cinza', tagline: 'Porto comercial movimentado', bgm: 'Town2', ground: TILE.GRASS,
    npcs: [
      { x: 7, y: 5, name: 'Capitã', lines: ['Capitã: Navios não zarpam sem aurora nos mares. Estamos presos.'] },
      { x: 16, y: 10, name: 'Pescador', lines: ['Pescador: O peixe sumiu junto com a luz. Coincidência? Duvido.'] },
    ],
  },
  { name: 'Aldeia Trigais', tagline: 'Campos dourados de trigo', bgm: 'Town1',
    npcs: [
      { x: 8, y: 6, name: 'Curandeira', lines: ['Curandeira: Preciso de \\C[3]5 Ervas Cristalinas\\C[0]. Me ajuda?', 'Elas crescem perto de água por toda Aethelgard.'],
        // inicia sidequest das ervas
      },
      { x: 17, y: 12, name: 'Fazendeiro', lines: ['Fazendeiro: Sem sol de verdade, a colheita vai morrer.'] },
    ],
    special: ({ events, addId, page, makeEvent, H, SW, VAR }) => {
      // ativar quest e ponto de checagem
      events.push(makeEvent({
        id: addId(), name: 'erva', x: 4, y: 4,
        pages: [page({
          characterName: '!Flame', characterIndex: 2, trigger: 0, priorityType: 1,
          list: H.cmdList([
            H.showText(['Você coletou uma \\C[3]Erva Cristalina\\C[0]!']),
            H.changeItem(4, 1, 0),
            H.setVar(VAR.HERBS_COLLECTED, 1, 1),
            H.setSwitch(SW.QUEST_HERBS, true),
          ]),
          conditions: { selfSwitchValid: true, selfSwitchCh: 'A' },
        }), page({
          conditions: { selfSwitchValid: true, selfSwitchCh: 'A' },
          characterName: '', trigger: 0, priorityType: 0,
          list: H.cmdList([H.showText(['(Nada mais aqui.)'])]),
        })],
      }));
    },
  },
  { name: 'Forte Pedrarrubra', tagline: 'Guarnição militar do reino', bgm: 'Castle1',
    npcs: [
      { x: 8, y: 6, name: 'Comandante', lines: ['Comandante: Patrulhas relatam monstros saindo das sombras. Reforce-se.'] },
    ],
  },
  { name: 'Bosque dos Sussurros', tagline: 'Lar do povo élfico', bgm: 'Town3',
    npcs: [
      { x: 8, y: 5, name: 'Anciã Élfica', lines: ['Anciã: Os elfos sentem a Aurora morrer. Se nos ajudar, teremos respeito por você.'] },
    ],
    special: ({ events, addId, page, makeEvent, H }) => {
      events.push(makeEvent({
        id: addId(), name: 'reputação elfos', x: 16, y: 6,
        pages: [page({
          characterName: 'People3', characterIndex: 1, trigger: 0, priorityType: 1,
          list: H.cmdList([
            H.showText(['Guarda Élfico: Provou seu valor.', 'Reputação com os \\C[3]Elfos\\C[0] aumentou.']),
            H.setVar(VAR.REP_ELVES, 10, 1),
          ]),
        })],
      }));
    },
  },
  { name: 'Mineração Fundo-Ferro', tagline: 'Vila dos anões mineradores', bgm: 'Dungeon2',
    npcs: [{ x: 8, y: 6, name: 'Mestre Anão', lines: ['Mestre Anão: Forjo armas de aurora... se você trouxer o minério certo.'] }] },
  { name: 'Oásis Solareu', tagline: 'Refúgio no deserto', bgm: 'Town2', ground: TILE.DIRT,
    npcs: [{ x: 8, y: 6, name: 'Mercador Nômade', lines: ['Mercador: Águas raras, preços altos. Tal é o deserto.'] }] },
  { name: 'Cume Geleira', tagline: 'Vila da montanha gelada', bgm: 'Town3', ground: TILE.DIRT,
    npcs: [{ x: 8, y: 6, name: 'Caçadora', lines: ['Caçadora: O frio piorou desde que as auroras sumiram. Agasalhe-se.'] }] },
  { name: 'Pântano Lamacento', tagline: 'Aldeia de pescadores do brejo', bgm: 'Town1', ground: TILE.WATER,
    npcs: [{ x: 8, y: 6, name: 'Velho do Brejo', lines: ['Velho: Espectros andam pela água à noite. Não confie na névoa.'] }] },
  { name: 'Cidade de Lumengarde', tagline: 'Capital do Reino', bgm: 'Castle2',
    npcs: [
      { x: 8, y: 5, name: 'Rei', lines: ['Rei: Traga-me os Fragmentos, herói. O reino recompensará você.'] },
      { x: 16, y: 6, name: 'Conselheiro', lines: ['Conselheiro: ...(ele observa você com olhos frios.)'] },
    ],
    special: ({ events, addId, page, makeEvent, H, SW, VAR }) => {
      // gatilho da traição quando o jogador tem >=3 fragmentos
      events.push(makeEvent({
        id: addId(), name: 'traição', x: 12, y: 4,
        pages: [page({
          trigger: 3, priorityType: 0, through: true,
          conditions: { variableValid: true, variableId: VAR.FRAGMENTS, variableValue: 3 },
          list: H.cmdList([
            H.shake(7, 7, 90, true),
            H.showText(['Conselheiro: Tolo. Os Fragmentos pertencem a Ele.', 'Guardas! Prendam o portador da marca!'], { background: 1, position: 1 }),
            H.setSwitch(SW.BETRAYAL, true),
            H.setVar(VAR.MAIN_STAGE, 6, 0),
            H.battle(6, { canEscape: false, canLose: false }),
            H.showText(['Você escapa por pouco da capital...']),
            ({ push }) => push(201, [0, 1, 13, 11, 2, 0], 0), // foge para o mapa-múndi
          ]),
        })],
      }));
    },
  },
  { name: 'Vilarejo Cinza', tagline: 'Uma vila sem cor', bgm: 'Dungeon3', ground: TILE.DIRT,
    npcs: [{ x: 8, y: 6, name: 'Aldeão Cinzento', lines: ['Aldeão: ...quem... quem é você? Eu... não lembro do meu nome.'] }] },
  { name: 'Eremo dos Monges', tagline: 'Mosteiro nas alturas', bgm: 'Town3',
    npcs: [{ x: 8, y: 6, name: 'Abade', lines: ['Abade: A meditação revela: o Devorador já foi um Selador. Um irmão traído.'] }] },
  { name: 'Acampamento Nômade', tagline: 'Tribos errantes', bgm: 'Town2', ground: TILE.DIRT,
    npcs: [{ x: 8, y: 6, name: 'Chefe Tribal', lines: ['Chefe: Andamos com o vento. O vento agora cheira a cinzas.'] }] },
  { name: 'Ruínas de Vael', tagline: 'Vila fantasma sobre ruínas antigas', bgm: 'Dungeon1', ground: TILE.DIRT,
    npcs: [{ x: 8, y: 6, name: 'Arqueóloga', lines: ['Arqueóloga: Estas ruínas são da Primeira Selagem. As respostas estão aqui.'] }] },
  { name: 'Refúgio Submerso', tagline: 'Vila à beira do grande lago', bgm: 'Town1', ground: TILE.WATER,
    npcs: [{ x: 8, y: 6, name: 'Barqueira', lines: ['Barqueira: Posso te levar pelo lago... por um preço justo.'] }] },
  { name: 'Bastião Final', tagline: 'A última fortaleza', bgm: 'Castle1',
    npcs: [{ x: 8, y: 6, name: 'Guardiã do Portão', lines: ['Guardiã: Além deste portão dorme o Devorador. Tem os seis Fragmentos?'] }],
    special: ({ events, addId, page, makeEvent, H, SW, VAR }) => {
      events.push(makeEvent({
        id: addId(), name: 'portão final', x: 12, y: 3,
        pages: [page({
          characterName: '', trigger: 0, priorityType: 1,
          list: H.cmdList([
            H.ifVar(VAR.FRAGMENTS, 6, 1),
            H.showText(['Os seis Fragmentos brilham. O portão se abre.', 'Como deseja enfrentar o Devorador?'], { position: 1 }),
            H.choices(['Refazer a Selagem', 'Destruí-lo', 'Tornar-me a Âncora'], { cancelType: -1 }),
            H.whenChoice(0, 'Refazer a Selagem'),
            ({ push }) => push(122, [VAR.ENDING, VAR.ENDING, 0, 0, 1], 2),
            ({ push }) => push(0, [], 2),
            H.whenChoice(1, 'Destruí-lo'),
            ({ push }) => push(122, [VAR.ENDING, VAR.ENDING, 0, 0, 2], 2),
            ({ push }) => push(0, [], 2),
            H.whenChoice(2, 'Tornar-me a Âncora'),
            ({ push }) => push(122, [VAR.ENDING, VAR.ENDING, 0, 0, 3], 2),
            ({ push }) => push(0, [], 2),
            ({ push }) => push(301, [0, 11, false, false], 1), // batalha final
            ({ push }) => push(117, [6], 1), // resolução do final
            ({ push }) => push(0, [], 1),
            H.elseBranch(),
            H.showText(['Guardiã: Ainda não. Reúna os seis Fragmentos.', 'Você tem \\C[6]\\V[1]\\C[0] de 6.'], { position: 1 }),
            ({ push }) => push(0, [], 1),
          ]),
        })],
      }));
    },
  },
];

// anexa índices e ids/coords de entrada
villages.forEach((v, i) => {
  v.index = i;
  v.id = 2 + i; // mapas 2..17
  v.entryX = 12;
  v.entryY = 17; // chega no sul do vilarejo
});

module.exports = { villages };
