'use strict';
// Valida estruturalmente os JSON gerados para o RPG Maker MV.
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

// arrays do banco devem começar com null no índice 0
const dbFiles = ['Actors', 'Classes', 'Skills', 'Items', 'Weapons', 'Armors',
  'Enemies', 'Troops', 'States', 'Animations', 'Tilesets', 'CommonEvents', 'MapInfos'];
console.log('Banco de dados:');
for (const f of dbFiles) {
  checks++;
  const d = load(f + '.json');
  if (!d) continue;
  if (!Array.isArray(d)) { fail(f + ' deveria ser array'); continue; }
  if (d[0] !== null) { fail(f + '[0] deveria ser null'); continue; }
  ok(`${f}.json (${d.length - 1} entradas)`);
}

console.log('System:');
checks++;
const sys = load('System.json');
if (sys) {
  const required = ['gameTitle', 'switches', 'variables', 'terms', 'sounds', 'partyMembers', 'startMapId'];
  const missing = required.filter((k) => !(k in sys));
  if (missing.length) fail('System faltando: ' + missing.join(', '));
  else if (sys.sounds.length !== 24) fail('System.sounds deve ter 24 entradas, tem ' + sys.sounds.length);
  else ok('System.json (título: "' + sys.gameTitle + '", startMapId ' + sys.startMapId + ')');
}

console.log('Mapas:');
const mapFiles = fs.readdirSync(OUT).filter((f) => /^Map\d{3}\.json$/.test(f)).sort();
for (const f of mapFiles) {
  checks++;
  const m = load(f);
  if (!m) continue;
  const expected = m.width * m.height * 6;
  if (!Array.isArray(m.data) || m.data.length !== expected) {
    fail(`${f}: data deveria ter ${expected} (w*h*6), tem ${m.data ? m.data.length : 'N/A'}`);
    continue;
  }
  if (!Array.isArray(m.events) || m.events[0] !== null) {
    fail(`${f}: events[0] deveria ser null`); continue;
  }
  // toda lista de comando de evento deve terminar em code 0
  let listErr = false;
  for (const ev of m.events) {
    if (!ev) continue;
    for (const pg of ev.pages) {
      const last = pg.list[pg.list.length - 1];
      if (!last || last.code !== 0) { listErr = true; }
    }
  }
  if (listErr) fail(`${f}: alguma página não termina em {code:0}`);
  else ok(`${f} (${m.width}x${m.height}, ${m.events.length - 1} eventos)`);
}

console.log(`\nVerificações: ${checks} | Erros: ${errors}`);
process.exit(errors ? 1 : 0);
