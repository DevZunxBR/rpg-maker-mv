'use strict';
// =====================================================================
// CUTSCENE DE ABERTURA — "A Noite da Marca"
// Cinemática dirigida em 8 beats (como um storyboard de cinema):
//   1) Cartão de título
//   2) Prólogo (texto rolando)
//   3) Revelação da vila à noite (letterbox desce, tempestade, câmera)
//   4) O presságio (relâmpago, auroras se apagam)
//   5) A marca desperta (a casa brilha)
//   6) Os soldados marcham até a porta (coreografia em paralelo)
//   7) A batida na porta (SE/ME, porta abre, Kael aparece)
//   8) Desfecho + entrega de controle ao jogador
//
// Recursos cinematográficos: letterbox (barras), vinheta, fades por imagem,
// tonalização (noite/azul da marca), clima (tempestade), relâmpagos (flash),
// tremor de câmera, scroll de câmera, rotas de movimento e RITMO de texto (\. \|).
// =====================================================================
const MB = require('./mapbuilder');
const { TILE, blankData, fillRect, makeEvent, page, makeMap } = MB;
const { Script, R } = require('./helpers');
const { SCREEN_H, BAR_H } = require('./assets');
const { SW, VAR } = require('./constants');

// Posição-âncora do jogador (centro de enquadramento da câmera).
const START = { mapId: 100, x: 20, y: 9 };

// IDs de imagem
const PIC = { BLACK: 1, BAR_TOP: 2, BAR_BOT: 3, VIGNETTE: 4, WHITE: 5 };

// ---- a coreografia (lista de comandos do evento diretor) ----
function direct() {
  const s = new Script();
  const march = (n) => [R.throughOn(), R.speed(4), R.walkOn(),
    ...Array(n).fill(0).map(() => R.right())];

  s.comment('CUTSCENE — A Noite da Marca');

  // ----- preparação: tudo preto, atores escondidos -----
  s.followers(false);
  s.move(-1, [R.throughOn(), R.transpOn()], { wait: false }); // esconde o herói (âncora)
  s.move(2, [R.transpOn()], { wait: true });                  // esconde Kael
  s.tint([-255, -255, -255, 0], 1, false);                    // tela preta imediata
  s.showPic(PIC.BLACK, 'CineBlack', { opacity: 255 });        // garante preto total
  s.bgm('Theme6', { volume: 55 });
  s.wait(40);

  // ----- BEAT 1 — CARTÃO DE TÍTULO -----
  s.comment('BEAT 1 — Cartao de titulo');
  s.text(['\\C[6]\\{AS CRÔNICAS DE AETHELGARD\\}\\C[0]', '',
    '\\C[8]Prólogo · A Noite da Marca\\C[0]'], { background: 2, position: 1 });
  s.wait(20);

  // ----- BEAT 2 — PRÓLOGO (texto rolando) -----
  s.comment('BEAT 2 — Prologo (texto rolando)');
  s.scroll([
    '\\C[6]Há trezentos anos\\C[0],',
    'os Seladores aprisionaram',
    'o Devorador de Auroras —',
    'aquele que devora a luz do mundo.',
    '',
    'Mas a selagem se desfaz.',
    'As auroras minguam no céu,',
    'e os vilarejos perdem',
    'a cor... e a própria memória.',
    '',
    'Esta é a noite',
    'em que tudo recomeça.',
    '',
  ], { speed: 3 });
  s.wait(20);

  // ----- BEAT 3 — REVELAÇÃO (vila à noite, sob tempestade) -----
  s.comment('BEAT 3 — Revelacao da vila');
  // letterbox desliza para dentro
  s.showPic(PIC.BAR_TOP, 'CineBar', { x: 0, y: -BAR_H });
  s.showPic(PIC.BAR_BOT, 'CineBar', { x: 0, y: SCREEN_H });
  s.showPic(PIC.VIGNETTE, 'CineVignette', { opacity: 0 });
  s.movePic(PIC.BAR_TOP, { x: 0, y: 0, dur: 36, wait: false });
  s.movePic(PIC.BAR_BOT, { x: 0, y: SCREEN_H - BAR_H, dur: 36, wait: false });
  s.movePic(PIC.VIGNETTE, { opacity: 255, dur: 36, wait: true });
  // prepara a cena por trás do preto e então revela
  s.tint([-105, -95, -20, 90], 1, false); // noite azulada
  s.weather('storm', 6, 1, false);
  s.se('Wind1', { volume: 75 });
  s.movePic(PIC.BLACK, { opacity: 0, dur: 90, wait: true }); // preto some → revela
  s.erasePic(PIC.BLACK);
  s.wait(30);
  // varredura de câmera pela vila
  s.scrollMap(4, 6, 3); s.wait(70);
  s.scrollMap(6, 6, 3); s.wait(40);

  // ----- BEAT 4 — O PRESSÁGIO (relâmpago) -----
  s.comment('BEAT 4 — O pressagio');
  s.flash([255, 255, 255, 200], 8, true);
  s.se('Thunder1', { volume: 90 });
  s.shake(6, 7, 60, true);
  s.tint([-135, -125, -35, 115], 90, true); // escurece (auroras minguam)
  s.text(['As auroras se apagam,\\. uma a uma.', 'O céu esquece a própria luz...'],
    { background: 1, position: 1 });

  // ----- BEAT 5 — A MARCA DESPERTA (a casa brilha) -----
  s.comment('BEAT 5 — A marca desperta');
  s.se('Saint5', { volume: 80 });
  s.flash([120, 160, 255, 170], 50, true);
  s.tintPic(PIC.VIGNETTE, [20, 30, 80, 0], 30, true); // vinheta puxa azul
  s.text(['Numa casa adormecida,\\.\\.', 'uma marca antiga arde na pele',
    'de um jovem chamado \\C[6]Kael\\C[0].'], { background: 1, position: 1 });
  s.tintPic(PIC.VIGNETTE, [0, 0, 0, 0], 30, false);

  // ----- BEAT 6 — OS SOLDADOS MARCHAM -----
  s.comment('BEAT 6 — Os soldados marcham ate a porta');
  s.fadeoutBgm(2); s.wait(24);
  s.bgm('Theme5', { volume: 70 });
  s.move(3, march(11), { wait: false });
  s.move(4, march(11), { wait: false });
  s.move(5, march(11), { wait: false });
  s.move(6, march(11), { wait: true });
  s.wait(40);
  // viram-se para a porta (encaram o norte)
  s.move(3, [R.turnUp()], { wait: false });
  s.move(4, [R.turnUp()], { wait: false });
  s.move(5, [R.turnUp()], { wait: false });
  s.move(6, [R.turnUp()], { wait: true });
  s.wait(20);

  // ----- BEAT 7 — A BATIDA NA PORTA -----
  s.comment('BEAT 7 — A batida na porta');
  s.se('Knock', { volume: 100 }); s.wait(45);
  s.se('Knock', { volume: 100 }); s.shake(3, 5, 18, true); s.wait(28);
  s.text(['\\C[4]Soldado\\C[0]: É esta.\\. A casa do jovem da marca.'], { position: 2 });
  s.text(['\\C[4]Capitão\\C[0]: O Rei o quer.\\| Vivo.'], { position: 2 });
  // a porta abre
  s.me('Mystery', { volume: 65 });
  s.se('Door1', { volume: 100 });
  s.flash([255, 255, 235, 175], 30, true);
  s.move(7, [R.transpOn()], { wait: true });   // a porta "abre" (some)
  s.move(2, [R.transpOff()], { wait: true });  // Kael aparece no umbral
  s.move(2, [R.speed(3), R.down()], { wait: true });
  s.wait(16);
  s.text(['\\C[6]Kael\\C[0]: ...o que querem comigo\\.\\.', 'a esta hora da noite?'],
    { position: 2 });
  s.text(['\\C[4]Capitão\\C[0]: Venha sem resistir.\\.', 'O destino não costuma esperar.'],
    { position: 2 });

  // ----- BEAT 8 — DESFECHO + ENTREGA DE CONTROLE -----
  s.comment('BEAT 8 — Desfecho');
  s.shake(5, 6, 36, true);
  s.text(['\\C[8]E assim, sob um céu sem auroras,\\.', 'a jornada de Kael começa.\\C[0]'],
    { background: 2, position: 1 });
  s.wait(16);
  // o fade de tela cobre TUDO (inclusive as imagens) — limpamos por trás dele
  s.fadeOut();
  s.erasePic(PIC.BAR_TOP); s.erasePic(PIC.BAR_BOT); s.erasePic(PIC.VIGNETTE);
  s.weather('none', 0, 1, false);
  s.tint([0, 0, 0, 0], 1, false);
  s.fadeoutBgm(2);
  // estado inicial do jogo
  s.setSwitch(SW.INTRO_DONE, true);
  s.setSwitch(SW.MQ1_ACTIVE, true);
  s.setVar(VAR.MAIN_STAGE, 1, 0);
  s.item(21, 1, 0); // Mapa de Aethelgard
  s.item(22, 1, 0); // Diário de Missões
  s.followers(true);
  s.move(-1, [R.transpOff(), R.throughOff()], { wait: true });
  // transfere com fade preto: o Scene_Map completa o fadeIn sozinho
  s.transfer(2, 8, 12, { dir: 8, fade: 0 });

  return s.build();
}

// ---- palco da cutscene (mapa 100) ----
function buildIntro() {
  const w = 30, h = 20;
  const data = blankData(w, h, TILE.GRASS);
  // caminho de terra horizontal
  fillRect(data, w, h, 0, 8, w - 1, 11, 0, TILE.DIRT);
  // casa de Kael (telhado na camada superior + parede)
  fillRect(data, w, h, 18, 3, 24, 5, 2, TILE.ROOF);
  fillRect(data, w, h, 18, 6, 24, 6, 1, TILE.WALL);

  // soldado helper
  const soldier = (id, x, y, idx) => makeEvent({ id, name: 'soldado', x, y, pages: [page({
    characterName: 'People3', characterIndex: idx, direction: 6, trigger: 0, priorityType: 1,
    walkAnime: true,
  })] });

  const events = [
    // 1: DIRETOR (autorun) — duas páginas: cutscene + vazia depois de vista
    makeEvent({ id: 1, name: 'DIRETOR', x: 0, y: 0, pages: [
      page({ trigger: 3, priorityType: 0, through: true, list: direct() }),
      page({ trigger: 3, priorityType: 0, through: true,
        conditions: { switch1Valid: true, switch1Id: SW.INTRO_DONE },
        list: [{ code: 0, indent: 0, parameters: [] }] }),
    ] }),
    // 2: KAEL (aparece quando a porta abre)
    makeEvent({ id: 2, name: 'Kael', x: 21, y: 6, pages: [page({
      characterName: 'Actor1', characterIndex: 0, direction: 2, trigger: 0, priorityType: 1,
    })] }),
    // 3..6: soldados (6 = capitão, sprite distinto)
    soldier(3, 7, 9, 0),
    soldier(4, 6, 10, 1),
    soldier(5, 8, 10, 4),
    soldier(6, 7, 11, 6),
    // 7: PORTA (some quando abre)
    makeEvent({ id: 7, name: 'porta', x: 21, y: 6, pages: [page({
      characterName: '!Door1', characterIndex: 0, direction: 2, trigger: 0, priorityType: 0,
    })] }),
    // 8,9: tochas (fogo animado) ladeando a porta
    makeEvent({ id: 8, name: 'tocha', x: 19, y: 6, pages: [page({
      characterName: '!Flame', characterIndex: 0, direction: 2, trigger: 0, priorityType: 1,
      stepAnime: true,
    })] }),
    makeEvent({ id: 9, name: 'tocha', x: 23, y: 6, pages: [page({
      characterName: '!Flame', characterIndex: 0, direction: 2, trigger: 0, priorityType: 1,
      stepAnime: true,
    })] }),
  ];

  return makeMap({
    width: w, height: h, tilesetId: 1, data, events,
    displayName: '', autoplayBgm: false,
  });
}

module.exports = { buildIntro, START };
