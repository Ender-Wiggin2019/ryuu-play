require('ts-node/register/transpile-only');

const { BotManager, SimpleBot, config } = require('@ptcg/server');
const { CardManager, Rules } = require('@ptcg/common');
const { standardSets } = require('@ptcg/sets');

const { Baxcalibur } = require('../packages/sets/src/standard/set_g/baxcalibur.ts');
const { BruteBonnet } = require('../packages/sets/src/standard/set_g/brute-bonnet.ts');
const { ChienPaoEx } = require('../packages/sets/src/standard/set_g/chien-pao-ex.ts');
const { Frigibax } = require('../packages/sets/src/standard/set_g/frigibax.ts');
const { Frigibax2 } = require('../packages/sets/src/standard/set_g/frigibax2.ts');
const { IronValiantEx } = require('../packages/sets/src/standard/set_g/iron-valiant-ex.ts');
const { NoivernEx } = require('../packages/sets/src/standard/set_g/noivern-ex.ts');

config.backend.address = '127.0.0.1';
config.backend.port = 12022;
config.backend.avatarsDir = __dirname + '/../avatars';
config.backend.webUiDir = __dirname + '/../packages/play/dist/ptcg-play';

config.storage.type = 'sqlite';
config.storage.database = __dirname + '/../database.sq3';

config.bots.defaultPassword = 'bot';

config.sets.scansDir = __dirname + '/../scans';
config.sets.scansDownloadUrl = 'https://ptcg.ryuu.eu/scans';

const workerESetG = [
  new IronValiantEx(),
  new BruteBonnet(),
  new NoivernEx(),
  new ChienPaoEx(),
  new Frigibax(),
  new Frigibax2(),
  new Baxcalibur(),
];

const cardManager = CardManager.getInstance();

cardManager.defineFormat('Standard', [
  standardSets.setH,
  standardSets.setF,
  standardSets.setG,
  workerESetG,
], new Rules({
  firstTurnDrawCard: false,
  firstTurnUseSupporter: false,
  firstTurnUseAttack: false,
}));

const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
