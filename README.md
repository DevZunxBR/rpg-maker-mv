# As Crônicas de Aethelgard — projeto para RPG Maker MV

Este repositório **gera a pasta `data/`** (banco de dados + mapas + eventos) de um RPG
grande para o **RPG Maker MV**. Conteúdo (história, sistemas, mapas) é original e gerado
por script. **O motor do MV (`js/`) e os assets RTP (`img/`, `audio/`) não estão aqui** —
eles vêm da sua licença/instalação do RPG Maker MV.

## O que já existe

- **`GDD.md`** — documento de design (história, mundo, sistemas, finais).
- **`tools/mvgen/`** — gerador em Node.js.
- **`data/`** — saída gerada: banco de dados + 19 mapas + `System.json` + `MapInfos.json`.

### Conteúdo gerado
- **5 personagens** jogáveis com classes, curvas de atributo e skills próprias.
- **23 skills**, 9 itens, 6 armas, 7 armaduras, 9 inimigos (2 chefes), 8 troops, 7 estados.
- **16 vilarejos** (mapas 2–17) + **mapa-múndi** (mapa 1) + **Caverna Cristalina** (mapa 18) + **intro** (mapa 100).
- **Intro roteirizada** (autorun) com tonalização, tremor e flash.
- **Sistemas** via Common Events: dia/noite, coleta de Fragmentos, reputação, pousada, sidequest de ervas, 3 finais.

## Como gerar / regenerar a pasta `data/`

> Observação: neste ambiente o Node precisa rodar sem o preload padrão.
> Use `env -u NODE_OPTIONS` antes do comando (em uma máquina normal, basta `node`).

```bash
env -u NODE_OPTIONS node tools/mvgen/index.js     # gera data/
env -u NODE_OPTIONS node tools/mvgen/validate.js  # valida os JSON
```

## Como abrir no RPG Maker MV

1. No RPG Maker MV, crie um **projeto novo** (isso traz o motor `js/` e os assets RTP).
2. Feche o editor.
3. **Substitua a pasta `data/` do projeto novo pela `data/` deste repositório.**
4. Reabra o projeto no MV. O jogo inicia pela **intro** (mapa 100) e segue para Auroria.

### Notas de compatibilidade
- Os mapas referenciam tilesets RTP padrão (`Outside_*`, `Inside_*`, `Dungeon_*`, `World_*`).
  Se o seu RTP tiver nomes diferentes, ajuste em **Database → Tilesets**.
- Sprites/faces usam nomes padrão (`Actor1`, `People1`, etc.). Troque pelos seus assets à vontade.
- Para "pintar" mapas com mais detalhe, edite-os normalmente no editor do MV depois de importar.

## Como expandir (é a parte boa)

Tudo é dirigido por dados. Para crescer rumo às ~3h:
- **Novos vilarejos:** adicione um objeto em `tools/mvgen/villages.js` ( id de mapa é automático).
- **Novos NPCs/quests:** use os helpers em `tools/mvgen/helpers.js` (`showText`, `choices`, `setVar`, `transfer`, `battle`, etc.).
- **Novas dungeons:** copie o padrão de `buildCrystalCave` em `tools/mvgen/maps.js`.
- **Banco de dados:** edite `tools/mvgen/db.js` (skills, inimigos, itens...).
- **Switches/variáveis:** centralizados em `tools/mvgen/constants.js`.

Depois de editar, rode o gerador de novo e reimporte a `data/`.

## Roadmap sugerido (para chegar nas 3 horas)
1. Encher cada vilarejo com 2–3 quests e diálogos ramificados.
2. Adicionar 5 dungeons (1 por região-chave) com 1 Fragmento cada.
3. Cutscenes nos pontos de virada (traição, revelação do irmão selado).
4. Balancear curvas de XP e encontros por região.
5. Polir mapas no editor e adicionar músicas/assets.
