'use strict';
const fs = require('fs');
const path = require('path');

const DB = require('./db');
const { buildSystem } = require('./system');
const { commonEvents } = require('./commonevents');
const { buildSwitchNames, buildVariableNames } = require('./constants');
const M = require('./maps');

const OUT = path.resolve(__dirname, '../../data');

function writeJSON(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj));
  return name;
}

function buildMapInfos() {
  // ordena por id; MapInfos precisa de null no índice 0 e entradas indexadas por id
  const ids = Object.keys(M.INFO).map(Number).sort((a, b) => a - b);
  const maxId = Math.max(...ids);
  const arr = new Array(maxId + 1).fill(null);
  ids.forEach((id, i) => {
    const info = M.INFO[id];
    arr[id] = {
      id, expanded: true, name: info.name, order: i + 1,
      parentId: info.parentId || 0, scrollX: 0, scrollY: 0,
    };
  });
  return arr;
}

function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  // ---- Banco de dados ----
  const written = [];
  written.push(writeJSON('Actors.json', DB.actors()));
  written.push(writeJSON('Classes.json', DB.classes()));
  written.push(writeJSON('Skills.json', DB.skills()));
  written.push(writeJSON('Items.json', DB.items()));
  written.push(writeJSON('Weapons.json', DB.weapons()));
  written.push(writeJSON('Armors.json', DB.armors()));
  written.push(writeJSON('Enemies.json', DB.enemies()));
  written.push(writeJSON('Troops.json', DB.troops()));
  written.push(writeJSON('States.json', DB.states()));
  written.push(writeJSON('Animations.json', DB.animations()));
  written.push(writeJSON('Tilesets.json', DB.tilesets()));
  written.push(writeJSON('CommonEvents.json', commonEvents()));

  // ---- System ----
  written.push(writeJSON('System.json', buildSystem({
    switches: buildSwitchNames(),
    variables: buildVariableNames(),
  })));

  // ---- Mapas ----
  M.buildAll();

  // grava cada mapa como MapXXX.json (3 dígitos)
  let mapCount = 0;
  for (const id of Object.keys(M.MAPS).map(Number).sort((a, b) => a - b)) {
    const fname = 'Map' + String(id).padStart(3, '0') + '.json';
    writeJSON(fname, M.MAPS[id]);
    mapCount++;
  }
  written.push(`${mapCount} mapas`);

  // ---- MapInfos ----
  written.push(writeJSON('MapInfos.json', buildMapInfos()));

  console.log('Gerado em', OUT);
  console.log('Arquivos:', written.join(', '));
  console.log('Total de mapas:', mapCount);
}

main();
