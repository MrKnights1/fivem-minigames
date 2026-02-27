const fs = require('fs');
const path = require('path');

const GAMES_DIR = '/root/projektid/hakid/games';

const games = [
  { name: 'vise_data_miner_game', file: 'index-DDXbgnQb.js' },
  { name: 'vise_grid_memory_game', file: 'index-CpGAcLXD.js' },
  { name: 'vise_letter_sequence_game', file: 'index-CD5cud52.js' },
  { name: 'vise_pair_matching_game', file: 'index-CDJYwEj-.js' },
  { name: 'vise_typeracer_game', file: 'index-CRKloZmN.js' },
  { name: 'vise_word_memory_game', file: 'index-COJnIWoF.js' },
];

let howlerSaved = false;

for (const game of games) {
  const filePath = path.join(GAMES_DIR, game.name, 'assets', game.file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // 1. Split off the Vite polyfill (ends with })(); before var X=typeof globalThis)
  const polyfillEndMatch = content.match(/\}\)\(\);(var \w+=typeof globalThis)/);
  if (!polyfillEndMatch) {
    console.error(`Could not find polyfill boundary in ${game.name}`);
    continue;
  }
  const polyfillEndIndex = content.indexOf(polyfillEndMatch[0]) + '})();'.length;
  const polyfillCode = content.substring(0, polyfillEndIndex);

  // Save polyfill once
  if (!howlerSaved) {
    fs.writeFileSync(path.join(GAMES_DIR, 'shared', 'vite-polyfill.js'), polyfillCode);
    console.log('Saved shared/vite-polyfill.js');
  }

  const afterPolyfill = content.substring(polyfillEndIndex);

  // 2. Find the boundary between howler and game code
  // The pattern is: }(EXPORTS)),EXPORTS}var HOWLVAR=FACTORY();const ISDBG=...
  // We need to find "var X=Y();" which is the howler factory call
  // followed by "const Z=" which starts the game code

  // Use regex to find the pattern: }var LETTER=LETTER();const
  const boundaryMatch = afterPolyfill.match(/\}var\s+(\w+)\s*=\s*(\w+)\(\)\s*;(const\s+)/);

  if (!boundaryMatch) {
    console.error(`Could not find howler/game boundary in ${game.name}`);
    continue;
  }

  const howlerVarName = boundaryMatch[1];
  const factoryFuncName = boundaryMatch[2];

  // Find the exact position
  const boundaryIndex = afterPolyfill.indexOf(boundaryMatch[0]);
  // Howler code ends after the closing brace, before "var X=Y();"
  const howlerEndIndex = boundaryIndex + 1; // +1 to include the closing }

  // Game code starts at "const ..."
  const varAssignment = `var ${howlerVarName}=${factoryFuncName}();`;
  const gameStartIndex = boundaryIndex + 1 + `var ${howlerVarName}=${factoryFuncName}();`.length;

  // Actually, let's be more precise. The boundary match is:
  // }var X=Y();const ...
  // The howler code is everything up to (and including) the }
  // Then "var X=Y();" is the import call
  // Then "const ..." is the start of game code

  const howlerCode = afterPolyfill.substring(0, howlerEndIndex);
  const gameCodeRaw = afterPolyfill.substring(boundaryIndex + 1 + `var ${howlerVarName}=${factoryFuncName}();`.length);

  console.log(`${game.name}: howlerVar='${howlerVarName}', factoryFunc='${factoryFuncName}'`);

  // Save howler once
  if (!howlerSaved) {
    fs.writeFileSync(path.join(GAMES_DIR, 'shared', 'howler.min.js'), howlerCode);
    console.log('Saved shared/howler.min.js');
    howlerSaved = true;
  }

  // 3. Create the game code with a howler shim
  // The game code uses howlerVarName.Howl to create sounds
  // When howler.js is loaded as a standalone script, it sets window.Howl and window.Howler
  const gameCode = `/* Howler.js import shim - maps the bundled variable to the global Howler/Howl */
var ${howlerVarName} = { Howl: Howl, Howler: Howler };

${gameCodeRaw}`;

  const gameOutputPath = path.join(GAMES_DIR, game.name, 'src', 'game.js');
  fs.writeFileSync(gameOutputPath, gameCode);
  console.log(`Saved ${game.name}/src/game.js`);
}

console.log('\nDone splitting all bundles!');
