const path = require('node:path');

const { BotManager, SimpleBot, config } = require('@ptcg/server');
const { CardManager, Rules } = require('@ptcg/common');
const { baseSets, standardSets } = require('@ptcg/sets');

config.backend.address = '127.0.0.1';
config.backend.port = Number(process.env.WORKER_F_PORT || 12024);
config.backend.avatarsDir = path.resolve(__dirname, '../avatars');
config.backend.webUiDir = '';

config.storage.type = 'sqlite';
config.storage.database = process.env.WORKER_F_DB
  ? path.resolve(process.cwd(), process.env.WORKER_F_DB)
  : path.resolve(__dirname, '../database-worker-f-scenario.sq3');

config.bots.defaultPassword = 'bot';

config.sets.scansDir = path.resolve(__dirname, '../scans');
config.sets.scansDownloadUrl = 'https://ptcg.ryuu.eu/scans';

const cardManager = CardManager.getInstance();

cardManager.defineFormat('Standard', [
  standardSets.setH,
  standardSets.setG,
  standardSets.setF,
], new Rules({
  firstTurnDrawCard: false,
  firstTurnUseSupporter: false,
  firstTurnUseAttack: false,
}));

cardManager.defineSet(baseSets.setBase);

const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
