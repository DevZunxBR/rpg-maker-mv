'use strict';
// Valida estrutura dos JSON do MV: arrays de banco, System, mapas e a
// CONSISTÊNCIA das listas de comando (ramificações 111/412, escolhas 102/404, rotas 205).
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '../../data');

let errors = 0, checks = 0;
const fail = (m) => { console.error('  ✗', m); errors++; };
const ok = (m) => { console.log('  ✓', m); };

function load(name) {
  const p = path.join(OUT, name);
  if (!fs.existsSync(p)) { fail(name + ' não existe'); return null; }
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { fail(name + ' JSON inválido: ' + e.message); return null; }
}

// Verifica uma lista de comandos de evento.
function checkList(where, list) {
  if (!Array.isArray(list) || list.length === 0) { fail(where + ': lista vazia'); return; }
  if (list[list.length - 1].code !== 0) fail(where + ': não termina em {code:0}');
  const count = (c) => list.filter((x) => x.code === c).length;
  if (count(111) !== count(412)) fail(`${where}: condições desbalanceadas 111=${count(111)} 412=${count(412)}`);
  if (count(102) !== count(404)) fail(`${where}: escolhas desbalanceadas 102=${count(102)} 404=${count(404)}`);
  if (count(411) > count(111)) fail(`${where}: 'else'(411) sem condição correspondente`);
  // indentação nunca negativa e cresce no máximo 1 por vez
  let prev = 0;
  for (const c of list) {
    if (c.indent < 0) { fail(`${where}: indent negativo`); break; }
    if (c.indent > prev + 1) { fail(`${where}: salto de indent (${prev}->${c.indent})`); break; }
    prev = c.indent;
  }
  // rotas de movimento (205) precisam de route.list terminando em code 0
  for (const c of list) {
    if (c.code === 205) {
      const r = c.parameters[1];
      if (!r || !Array.isArray(r.list) || r.list[r.list.length - 1].code !== 0)
        fail(`${where}: rota de movimento 205 malformada`);
    }
  }
}

const dbFiles = ['Actors', 'Classes', 'Skills', 'Items', 'Weapons', 'Armors',
  'Enemies', 'Troops', 'States', 'Animations', 'Tilesets', 'CommonEvents', 'MapInfos'];
console.log('Banco de dados:');
for (const f of dbFiles) {
  checks++;
  const d = load(f + '.json');
  if (!d) continue;
  if (!Array.isArray(d) || d[0] !== null) { fail(f + ' deve ser array começando com null'); continue; }
  ok(`${f}.json (${d.length - 1} entradas)`);
}

console.log('Common Events:');
const ces = load('CommonEvents.json');
if (ces) for (const ce of ces) { if (ce) { checks++; checkList('CE ' + ce.id + ' ' + ce.name, ce.list); } }
if (errors === 0) ok('listas de common events consistentes');

console.log('System:');
checks++;
const sys = load('System.json');
if (sys) {
  if (sys.sounds.length !== 24) fail('System.sounds deve ter 24, tem ' + sys.sounds.length);
  else ok('System.json (título "' + sys.gameTitle + '", startMapId ' + sys.startMapId + ')');
}

console.log('Mapas:');
const mapFiles = fs.readdirSync(OUT).filter((f) => /^Map\d{3}\.json$/.test(f)).sort();
for (const f of mapFiles) {
  checks++;
  const m = load(f);
  if (!m) continue;
  const expected = m.width * m.height * 6;
  if (!Array.isArray(m.data) || m.data.length !== expected) {
    fail(`${f}: data deveria ter ${expected} (w*h*6), tem ${m.data ? m.data.length : 'N/A'}`); continue;
  }
  if (!Array.isArray(m.events) || m.events[0] !== null) { fail(`${f}: events[0] != null`); continue; }
  for (const ev of m.events) {
    if (!ev) continue;
    ev.pages.forEach((pgo, i) => checkList(`${f} ev${ev.id} pg${i}`, pgo.list));
  }
  ok(`${f} (${m.width}x${m.height}, ${m.events.length - 1} eventos)`);
}

console.log(`\nVerificações: ${checks} | Erros: ${errors}`);
process.exit(errors ? 1 : 0);
