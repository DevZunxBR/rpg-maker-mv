# As Crônicas de Aethelgard — projeto para RPG Maker MV

Este repositório **gera a pasta `data/`** (banco de dados + mapas + eventos) de um RPG
completo e **zerável** para o **RPG Maker MV**. Todo o conteúdo (história, código, sistemas)
é original e gerado por script. **O motor do MV (`js/`) e os assets RTP (`img/`, `audio/`)
não estão aqui** — vêm da sua licença/instalação do RPG Maker MV.

## Destaques desta versão

- **Intro cinematográfica:** texto rolando (estilo abertura) contando a lenda, depois a tela
  revela a noite e **soldados marcham até a porta de Kael**, batem, a porta se abre — e o
  controle passa para você.
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
4. Reabra o projeto. O jogo começa pela **intro cinematográfica**.

### Compatibilidade de assets
Os mapas referenciam nomes padrão do RTP (`Outside_*`, `Inside_*`, `Dungeon_*`, `World_*`,
sprites `People*`, portas `!Door1`, etc.). Se algum nome diferir no seu RTP, ajuste em
**Database → Tilesets** ou troque o gráfico do evento. SEs usados na intro: `Knock`, `Door1`.

## Expandir
Tudo é dirigido por dados. Para crescer: edite `tools/mvgen/maps.js` (novos mapas/eventos com a
API `Script`), `db.js` (banco), `quests.js` (missões) e `constants.js` (switches/variáveis);
rode o gerador e reimporte a `data/`.
