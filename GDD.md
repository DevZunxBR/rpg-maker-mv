# GDD — "As Crônicas de Aethelgard"

Um RPG épico para **RPG Maker MV**. Meta de duração: ~3 horas na rota principal (+ sidequests).

---

## 1. Premissa

O continente de **Aethelgard** viveu 300 anos de paz desde a Selagem do **Devorador de Auroras**, uma entidade que consome a luz do mundo. A selagem está se rompendo: as auroras (a fonte de magia do mundo) estão sumindo, vilarejos inteiros perdem a cor e a memória. O herói, **Kael**, descobre que carrega a marca de um dos antigos Seladores e precisa reunir os **6 Fragmentos de Aurora** espalhados pelos reinos para refazer a selagem — ou usá-los para destruir o Devorador de vez.

**Conflito central:** Refazer a selagem (paz temporária, custo: sacrifício) vs. destruir o Devorador (risco de aniquilar a magia do mundo). Decisão final ramifica em 3 finais.

---

## 2. Personagens jogáveis

| Nome | Classe | Papel | Arco |
|------|--------|-------|------|
| **Kael** | Selador (espada + magia de luz) | Protagonista / tank-híbrido | Aceitar o fardo da marca |
| **Lyra** | Arquimaga | DPS mágico / suporte | Recuperar a memória perdida |
| **Bram** | Guardião | Tank / provocar | Redenção (ex-mercenário) |
| **Sora** | Lâmina Sombria | DPS físico / crítico | Vingança vs. perdão |
| **Eshe** | Druida | Cura / status | Equilíbrio natureza vs. civilização |

---

## 3. Mundo — 16 vilarejos/locais (>15)

1. **Vilar de Auroria** — vila natal de Kael (tutorial)
2. **Porto Maré-Cinza** — porto comercial
3. **Aldeia Trigais** — vila agrícola
4. **Forte Pedrarrubra** — guarnição militar
5. **Bosque dos Sussurros** — vila élfica
6. **Mineração Fundo-Ferro** — vila anã/mineradora
7. **Oásis Solareu** — vila do deserto
8. **Cume Geleira** — vila da montanha gelada
9. **Pântano Lamacento** — vila dos pescadores
10. **Cidade de Lumengarde** — capital do reino
11. **Vilarejo Cinza** — vila amaldiçoada (sem cor)
12. **Eremo dos Monges** — mosteiro nas alturas
13. **Acampamento Nômade** — tribos errantes
14. **Ruínas de Vael** — vila fantasma sobre ruínas antigas
15. **Refúgio Submerso** — vila à beira do lago
16. **Bastião Final** — última fortaleza antes do Devorador

Conectados por um **World Map**. Dungeons intercaladas (cavernas, templos, torre).

---

## 4. Sistemas

- **Combate por turnos** (padrão MV) com skills custom por classe.
- **Fragmentos de Aurora** (variáveis): coletar 6 abre o final.
- **Reputação** (variável por facção): afeta preços e diálogos.
- **Sidequests** via Common Events + switches.
- **Ciclo Dia/Noite simples** (tonalidade de tela por switch).
- **Diário de missões** (item-menu / variáveis).
- **Pontos de save** + cura em pousadas.

---

## 5. Arco principal (acontecimentos)

1. **Intro roteirizada:** queda das auroras, marca de Kael desperta.
2. Tutorial em Auroria → primeiro Fragmento na Caverna Cristalina.
3. Viagem pelos reinos coletando Fragmentos (1 por região-chave).
4. Traição em Lumengarde (vira o jogo no meio).
5. Revelação: o Devorador é o irmão selado do primeiro Selador.
6. Bastião Final → escolha → 3 finais.

---

## 6. Escopo técnico

Gerado por script Node em `data/*.json` compatível com MV. Engine + assets RTP vêm da instalação do usuário.
