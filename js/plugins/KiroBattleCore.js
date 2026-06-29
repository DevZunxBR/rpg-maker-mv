//=============================================================================
// KiroBattleCore.js
//=============================================================================
/*:
 * @plugindesc v1.0.0 Núcleo de combate configurável: crítico, guarda, taxas de
 * EXP/ouro/encontro/fuga, flash no crítico e avisos de fraqueza/resistência.
 * @author Kiro
 *
 * @param ---Crítico---
 * @default
 *
 * @param Critical Multiplier
 * @parent ---Crítico---
 * @type number
 * @decimals 2
 * @min 1.00
 * @default 3.00
 * @desc Multiplicador de dano em acertos críticos. (Padrão do MV = 3.00)
 *
 * @param Critical Flash
 * @parent ---Crítico---
 * @type boolean
 * @on Ativado
 * @off Desativado
 * @default true
 * @desc Pisca a tela quando um golpe crítico acontece.
 *
 * @param Critical Flash Color
 * @parent ---Crítico---
 * @desc Cor do flash do crítico em R,G,B,Intensidade (0-255).
 * @default 255,255,255,160
 *
 * @param Critical Flash Duration
 * @parent ---Crítico---
 * @type number
 * @min 1
 * @default 20
 * @desc Duração do flash do crítico, em frames (60 = 1s).
 *
 * @param ---Guarda---
 * @default
 *
 * @param Guard Reduction
 * @parent ---Guarda---
 * @type number
 * @min 0
 * @max 99
 * @default 50
 * @desc Redução de dano ao Defender, em %. (50 = metade, como o padrão do MV)
 *
 * @param ---Recompensas---
 * @default
 *
 * @param EXP Rate
 * @parent ---Recompensas---
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 * @desc Multiplicador global de EXP ganho em batalha.
 *
 * @param Gold Rate
 * @parent ---Recompensas---
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 * @desc Multiplicador global de ouro ganho em batalha.
 *
 * @param ---Encontros e Fuga---
 * @default
 *
 * @param Encounter Rate
 * @parent ---Encontros e Fuga---
 * @type number
 * @decimals 2
 * @min 0
 * @default 1.00
 * @desc Multiplicador da frequência de encontros. <1 = menos, >1 = mais.
 *
 * @param Escape Bonus
 * @parent ---Encontros e Fuga---
 * @type number
 * @decimals 2
 * @min -1.00
 * @max 1.00
 * @default 0.00
 * @desc Bônus somado à chance de fuga (0.10 = +10 pontos percentuais).
 *
 * @param ---Avisos de Elemento---
 * @default
 *
 * @param Element Popup
 * @parent ---Avisos de Elemento---
 * @type boolean
 * @on Ativado
 * @off Desativado
 * @default true
 * @desc Mostra mensagens de fraqueza/resistência/imunidade/absorção no log.
 *
 * @param Weak Text
 * @parent ---Avisos de Elemento---
 * @default Fraqueza!
 *
 * @param Resist Text
 * @parent ---Avisos de Elemento---
 * @default Resistiu...
 *
 * @param Immune Text
 * @parent ---Avisos de Elemento---
 * @default Imune!
 *
 * @param Absorb Text
 * @parent ---Avisos de Elemento---
 * @default Absorveu!
 *
 * @help
 * ============================================================================
 * KiroBattleCore — visão geral
 * ============================================================================
 * Um plugin "core" de combate, sem dependências, que ajusta números e dá
 * feedback visual à batalha padrão do RPG Maker MV. Tudo é configurável pelos
 * parâmetros no Gerenciador de Plugins.
 *
 * Recursos:
 *  - Multiplicador de crítico configurável (+ flash de tela opcional no crítico).
 *  - Redução de dano da Defesa em % (mantém os traços de "taxa de guarda").
 *  - Multiplicadores globais de EXP e ouro.
 *  - Multiplicador de frequência de encontros aleatórios.
 *  - Bônus de chance de fuga.
 *  - Mensagens de Fraqueza / Resistiu / Imune / Absorveu no log de batalha,
 *    calculadas pela taxa de elemento do alvo.
 *
 * ============================================================================
 * Instalação
 * ============================================================================
 * 1) Copie este arquivo para a pasta  js/plugins/  do seu projeto.
 * 2) Abra o RPG Maker MV > Ferramentas > Gerenciador de Plugins.
 * 3) Adicione "KiroBattleCore", deixe ON e ajuste os parâmetros.
 *
 * Sem comandos de plugin. Tudo funciona automaticamente em batalha.
 *
 * ============================================================================
 * Termos de uso
 * ============================================================================
 * Uso livre em projetos comerciais e não comerciais. Sem garantias.
 */
(function() {
  'use strict';

  var PLUGIN = 'KiroBattleCore';
  var params = PluginManager.parameters(PLUGIN);

  // ---- utilidades de leitura de parâmetros ----
  function num(name, def) {
    var v = Number(params[name]);
    return isNaN(v) ? def : v;
  }
  function bool(name, def) {
    var v = params[name];
    if (v === undefined || v === '') return def;
    return String(v).toLowerCase() === 'true';
  }
  function str(name, def) {
    return params[name] != null && params[name] !== '' ? String(params[name]) : def;
  }
  function color(name, def) {
    var parts = String(params[name] || '').split(',').map(function(s) { return Number(s.trim()); });
    if (parts.length === 4 && parts.every(function(n) { return !isNaN(n); })) return parts;
    return def;
  }

  var CFG = {
    critMult: num('Critical Multiplier', 3.0),
    critFlash: bool('Critical Flash', true),
    critFlashColor: color('Critical Flash Color', [255, 255, 255, 160]),
    critFlashDur: num('Critical Flash Duration', 20),
    guardReduction: num('Guard Reduction', 50),
    expRate: num('EXP Rate', 1.0),
    goldRate: num('Gold Rate', 1.0),
    encounterRate: num('Encounter Rate', 1.0),
    escapeBonus: num('Escape Bonus', 0.0),
    elementPopup: bool('Element Popup', true),
    weakText: str('Weak Text', 'Fraqueza!'),
    resistText: str('Resist Text', 'Resistiu...'),
    immuneText: str('Immune Text', 'Imune!'),
    absorbText: str('Absorb Text', 'Absorveu!')
  };

  // fator de divisão da guarda: 50% -> divide por 2 (compatível com o padrão).
  var GUARD_FACTOR = 1 / (1 - Math.min(CFG.guardReduction, 99) / 100);

  // ===========================================================================
  // Crítico — multiplicador
  // ===========================================================================
  Game_Action.prototype.applyCritical = function(damage) {
    return damage * CFG.critMult;
  };

  // ===========================================================================
  // Guarda — redução configurável (preserva o traço de taxa de guarda: target.grd)
  // ===========================================================================
  Game_Action.prototype.applyGuard = function(damage, target) {
    var guarding = damage > 0 && target.isGuard();
    return damage / (guarding ? GUARD_FACTOR * target.grd : 1);
  };

  // ===========================================================================
  // Crítico — flash de tela
  // ===========================================================================
  var _displayCritical = Window_BattleLog.prototype.displayCritical;
  Window_BattleLog.prototype.displayCritical = function(target) {
    _displayCritical.call(this, target);
    if (CFG.critFlash && target.result().critical && $gameScreen) {
      $gameScreen.startFlash(CFG.critFlashColor, CFG.critFlashDur);
    }
  };

  // ===========================================================================
  // Recompensas — EXP e ouro
  // ===========================================================================
  var _expTotal = Game_Troop.prototype.expTotal;
  Game_Troop.prototype.expTotal = function() {
    return Math.round(_expTotal.call(this) * CFG.expRate);
  };
  var _goldTotal = Game_Troop.prototype.goldTotal;
  Game_Troop.prototype.goldTotal = function() {
    return Math.round(_goldTotal.call(this) * CFG.goldRate);
  };

  // ===========================================================================
  // Encontros aleatórios — frequência
  // ===========================================================================
  var _encounterProgressValue = Game_Player.prototype.encounterProgressValue;
  Game_Player.prototype.encounterProgressValue = function() {
    return _encounterProgressValue.call(this) * CFG.encounterRate;
  };

  // ===========================================================================
  // Fuga — bônus de chance
  // ===========================================================================
  var _makeEscapeRatio = BattleManager.makeEscapeRatio;
  BattleManager.makeEscapeRatio = function() {
    _makeEscapeRatio.call(this);
    this._escapeRatio += CFG.escapeBonus;
  };

  // ===========================================================================
  // Avisos de elemento — calcula a taxa e guarda no alvo para exibir no log
  // ===========================================================================
  var _makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    var value = _makeDamageValue.call(this, target, critical);
    if (CFG.elementPopup && this.isDamage()) {
      // calcElementRate retorna: >1 fraqueza, <1 resistência, 0 imune, <0 absorção
      try {
        target._kiroElementRate = this.calcElementRate(target);
      } catch (e) {
        target._kiroElementRate = null;
      }
    }
    return value;
  };

  var _displayDamage = Window_BattleLog.prototype.displayDamage;
  Window_BattleLog.prototype.displayDamage = function(target) {
    _displayDamage.call(this, target);
    if (CFG.elementPopup && target._kiroElementRate != null) {
      var r = target._kiroElementRate;
      var msg = null;
      if (r < 0) msg = CFG.absorbText;
      else if (r === 0) msg = CFG.immuneText;
      else if (r > 1.0) msg = CFG.weakText;
      else if (r < 1.0) msg = CFG.resistText;
      if (msg) {
        this.push('addText', msg);
      }
      target._kiroElementRate = null;
    }
  };

})();
