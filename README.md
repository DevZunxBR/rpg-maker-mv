# As Crônicas de Aethelgard — projeto para RPG Maker MV

Este repositório **gera a pasta `data/`** (banco de dados + mapas + eventos) de um RPG
completo e **zerável** para o **RPG Maker MV**. Todo o conteúdo (história, código, sistemas)
é original e gerado por script. **O motor do MV (`js/`) e os assets RTP (`img/`, `audio/`)
não estão aqui** — vêm da sua licença/instalação do RPG Maker MV.

## Destaques desta versão

- **🎬 Cutscene de abertura cinematográfica** ("A Noite da Marca") — dirigida em **8 beats**
  como um storyboard de cinema. Detalhes abaixo.
- **Poucos mapas, porém polidos** (8 no total): intro, mapa-múndi, vila natal, capital-hub,
  bosque élfico, estrada, caverna e o bastião final.
- **Todos os sistemas para zerar o jogo:**
  - 🛒 **Loja** elegante (itens, armas, armaduras)
  - 🩺 **Médico/Clínica** (cura status e revive por ouro)
  - 🛏️ **Pousada** (recupera HP/MP por ouro)
  - 📜 **Quadro de Missões** (aceitar secundárias) + **Diário de Missões** (resumo do progresso)
  - 🗺️ **Missões da história** (4) e **secundárias** (4) com switches/variáveis
  - ⚔️ Combate por turnos, chefes e **batalha final com 3 finais**
  - 🌗 Evento de ciclo dia/noite pronto para uso

## 🎬 A cutscene de abertura — "A Noite da Marca"

Cinemática planejada como cinema, em 8 beats (em `tools/mvgen/cutscene.js`):

1. **Cartão de título** — sobre tela preta, surge o título e o subtítulo "Prólogo · A Noite da Marca".
2. **Prólogo** — **texto rolando** contando a lenda do Devorador de Auroras.
3. **Revelação** — as **barras de cinema (letterbox)** descem, a **vinheta** entra, começa a
   **tempestade**, o preto se dissolve revelando a vila à noite e a **câmera varre** o cenário.
4. **O presságio** — **relâmpago** (flash + trovão + tremor), a tela escurece: as auroras minguam.
5. **A marca desperta** — um **brilho azul** toma a casa; a vinheta puxa azul; narração.
6. **Os soldados marcham** — 4 soldados entram em quadro e **marcham até a porta** (coreografia
   em paralelo via rotas de movimento), depois se viram para encará-la.
7. **A batida** — batidas na porta (SE), uma stinger (ME), a **porta se abre com flash** e
   **Kael surge** no umbral; diálogo entre Kael e o Capitão.
8. **Desfecho** — frase de encerramento, fade, limpeza da cena e o **controle passa para você**
   já em Auroria, com os itens-chave no inventário.

Recursos usados: letterbox, vinheta, fades por imagem, tonalização (noite / azul da marca),
clima (tempestade), relâmpagos, tremor e varredura de câmera, coreografia de personagens e
**ritmo de texto** (pausas `\.` e `\|`).

> As imagens da cinemática (`CineBlack`, `CineBar`, `CineVignette`, `CineWhite`) são **geradas
> por código** em `img/pictures/` — formas geométricas originais, sem assets de terceiros.

## Fluxo principal (como zerar)

1. **Intro** → vila de **Auroria**.
2. **Caverna Cristalina** → derrote o Golem → **1º Fragmento** (MQ1).
3. **Capital (Lumengarde)** → fale com o **Rei** → ganha o **2º Fragmento** → dispara a **Traição**.
4. **Bosque dos Sussurros** → missão dos elfos (acenda 3 totens) → **3º Fragmento** + a verdade.
5. Com **3 Fragmentos**, o **Bastião Final** abre → escolha seu final → **Devorador** → créditos.

Secundárias: **Ervas Cristalinas** (Auroria), **Caça aos Lobos** (Estrada), **A Encomenda**
(Capital → Bosque), **O Favor dos Elfos** (Bosque).

## Estrutura do repositório

- `GDD.md` — documento de design (mundo, história, sistemas).
- `tools/mvgen/` — gerador em Node.js:
  - `helpers.js` — construtor `Script` que emite comandos do MV com **indentação correta**
    (condições 111/411/412, escolhas 102/402/404, rotas de movimento 205, texto rolando 105).
  - `db.js` — banco de dados (actors, classes, skills, itens, inimigos, troops...).
  - `system.js`, `constants.js`, `quests.js`, `commonevents.js`, `maps.js` — sistemas e mapas.
  - `index.js` — orquestra a geração; `validate.js` — valida a estrutura dos JSON.
- `data/` — saída gerada (entregue pronta).

## Gerar / validar

> Neste ambiente o Node precisa rodar sem o preload padrão: prefixe com `env -u NODE_OPTIONS`.
> Numa máquina normal, basta `node`.

```bash
env -u NODE_OPTIONS node tools/mvgen/index.js     # gera data/
env -u NODE_OPTIONS node tools/mvgen/validate.js  # valida (banco, mapas e lógica dos eventos)
```

## Como abrir no RPG Maker MV

1. Crie um **projeto novo** no MV (isso traz o motor `js/` e os assets RTP).
2. Feche o editor.
3. **Substitua a pasta `data/`** do projeto novo pela `data/` deste repositório.
4. **Copie a pasta `img/pictures/`** deste repositório para `img/pictures/` do seu projeto
   (são as imagens da cinemática: barras de cinema, vinheta e fades). **Sem isso a cutscene
   dá erro de imagem não encontrada.**
5. Reabra o projeto. O jogo começa pela **cutscene de abertura**.

### Compatibilidade de assets
Os mapas referenciam nomes padrão do RTP (`Outside_*`, `Inside_*`, `Dungeon_*`, `World_*`,
sprites `Actor1`/`People*`, porta `!Door1`, tocha `!Flame`, etc.). Se algum nome diferir no seu
RTP, ajuste em **Database → Tilesets** ou troque o gráfico do evento.
Sons usados na cutscene (todos do RTP padrão): SE `Wind1`, `Thunder1`, `Saint5`, `Knock`,
`Door1`; ME `Mystery`; BGM `Theme6` e `Theme5`. Troque por outros que você tenha, se preferir.

## Expandir
Tudo é dirigido por dados. Para crescer: edite `tools/mvgen/maps.js` (novos mapas/eventos com a
API `Script`), `db.js` (banco), `quests.js` (missões) e `constants.js` (switches/variáveis);
rode o gerador e reimporte a `data/`.
