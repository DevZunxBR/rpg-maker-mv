# Plugins para RPG Maker MV

Plugins JavaScript originais para o MV. Cada plugin é um arquivo independente em
`js/plugins/`, sem dependências entre si (salvo indicação em contrário).

## Como instalar qualquer plugin daqui

1. Copie o `.js` desejado para a pasta `js/plugins/` do **seu** projeto MV.
2. No MV: **Ferramentas → Gerenciador de Plugins** (ou tecla `F10`).
3. Dê um duplo-clique numa linha vazia, escolha o plugin na lista e deixe **ON**.
4. Ajuste os parâmetros na coluna da direita.
5. Salve o projeto e teste (`Playtest`).

> Os parâmetros aparecem traduzidos e com tipos (número, on/off) direto no Gerenciador.

---

## KiroBattleCore.js — núcleo de combate

Ajusta números da batalha e adiciona feedback visual, tudo configurável. **Sem comandos de
plugin**: funciona automaticamente em combate. Não substitui o sistema de batalha do MV —
apenas o aprimora, então é seguro combinar com a maioria dos outros plugins.

### Parâmetros

| Parâmetro | Padrão | O que faz |
|---|---|---|
| **Critical Multiplier** | `3.00` | Multiplicador de dano no acerto crítico. |
| **Critical Flash** | `ON` | Pisca a tela quando ocorre um crítico. |
| **Critical Flash Color** | `255,255,255,160` | Cor do flash em `R,G,B,Intensidade`. |
| **Critical Flash Duration** | `20` | Duração do flash em frames (60 = 1s). |
| **Guard Reduction** | `50` | Redução de dano ao Defender, em % (50 = metade). Preserva o traço de "taxa de guarda" dos atores. |
| **EXP Rate** | `1.00` | Multiplicador global de EXP por batalha. |
| **Gold Rate** | `1.00` | Multiplicador global de ouro por batalha. |
| **Encounter Rate** | `1.00` | Frequência de encontros aleatórios (`<1` menos, `>1` mais). |
| **Escape Bonus** | `0.00` | Bônus na chance de fuga (`0.10` = +10 pontos percentuais). |
| **Element Popup** | `ON` | Mostra avisos de elemento no log de batalha. |
| **Weak / Resist / Immune / Absorb Text** | `Fraqueza!` etc. | Textos exibidos conforme a taxa de elemento do alvo. |

### Detalhes técnicos (para quem quiser auditar/estender)

O plugin sobrescreve/alia métodos conhecidos da engine:

- `Game_Action.applyCritical` → aplica o multiplicador de crítico.
- `Game_Action.applyGuard` → divide o dano por `fator × target.grd` (mantém os traços de guarda).
- `Window_BattleLog.displayCritical` → dispara `$gameScreen.startFlash(...)` no crítico.
- `Game_Troop.expTotal` / `goldTotal` → aplicam os multiplicadores de recompensa.
- `Game_Player.encounterProgressValue` → escala a frequência de encontros.
- `BattleManager.makeEscapeRatio` → soma o bônus de fuga.
- `Game_Action.makeDamageValue` → calcula `calcElementRate(target)` e guarda no alvo;
  `Window_BattleLog.displayDamage` lê esse valor e exibe o aviso de elemento.

### Compatibilidade

- Feito para o **fluxo de batalha padrão** do MV (front-view ou side-view do RPG Maker).
- Como apenas estende métodos numéricos e do log, costuma conviver bem com plugins de UI.
- Se usar outro plugin que reescreva `applyCritical`, `applyGuard` ou `Window_BattleLog`,
  coloque o **KiroBattleCore acima ou abaixo** conforme qual comportamento deve prevalecer.

---

## Próximos plugins (roadmap sugerido)

Ideias de combate para evoluirmos a seguir — me diga qual priorizar:

- **KiroDamagePopup** — números de dano maiores, cor de crítico, "MISS/ESQUIVA" estilizado.
- **KiroBattleHUD** — barras de HP/MP/TP dos inimigos e/ou ordem de turno na tela.
- **KiroStates+** — ícones de status com contador de turnos e efeitos por turno (regen/veneno escalável).
- **KiroSkillCost** — custos alternativos (HP, itens, "cargas") e cooldowns por habilidade.
- **KiroLimitBreak** — barra de especial que enche ao sofrer/causar dano e libera um golpe.
- **KiroEncounterControl** — comandos para ligar/desligar encontros e "passos seguros".
