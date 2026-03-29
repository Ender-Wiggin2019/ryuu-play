require('ts-node/register/transpile-only');

const { BotManager, SimpleBot, config } = require('@ptcg/server');
const { CardManager, Rules } = require('@ptcg/common');
const { standardSets } = require('@ptcg/sets');

const { createAErZhouSiVVariants } = require('../packages/sets/src/standard/set_f/a-er-zhou-si-v');
const { createAErZhouSiVStarVariants } = require('../packages/sets/src/standard/set_f/a-er-zhou-si-vstar');
const { createQiYuanDiYaLuKaVVariants } = require('../packages/sets/src/standard/set_f/qi-yuan-di-ya-lu-ka-v');
const { createQiYuanDiYaLuKaVStarVariants } = require('../packages/sets/src/standard/set_f/qi-yuan-di-ya-lu-ka-vstar');
const { createYaoHuoHongHuVVariants } = require('../packages/sets/src/standard/set_f/yao-huo-hong-hu-v');
const { createMiMiQiuVariants } = require('../packages/sets/src/standard/set_g/mi-mi-qiu');
const { createChouChouYuVariants } = require('../packages/sets/src/standard/set_h/chou-chou-yu');
const { createHongLeiJinGangXingVariants } = require('../packages/sets/src/standard/set_h/hong-lei-jin-gang-xing');
const { createMeiNaSiExVariants } = require('../packages/sets/src/standard/set_h/mei-na-si-ex');
const { createPoKongYanExVariants } = require('../packages/sets/src/standard/set_h/po-kong-yan-ex');

config.backend.address = '127.0.0.1';
config.backend.port = 12031;
config.backend.avatarsDir = __dirname + '/../avatars';
config.backend.webUiDir = __dirname + '/../packages/play/dist/ptcg-play';

config.storage.type = 'sqlite';
config.storage.database = __dirname + '/../database-worker-c-scenario.sq3';

config.bots.defaultPassword = 'bot';
config.sets.scansDir = __dirname + '/../scans';
config.sets.scansDownloadUrl = 'https://ptcg.ryuu.eu/scans';

const extraFgh = [
  ...createAErZhouSiVVariants(),
  ...createAErZhouSiVStarVariants(),
  ...createQiYuanDiYaLuKaVVariants(),
  ...createQiYuanDiYaLuKaVStarVariants(),
  ...createYaoHuoHongHuVVariants(),
];

const extraG = [
  ...createMiMiQiuVariants(),
];

const extraH = [
  ...createChouChouYuVariants(),
  ...createHongLeiJinGangXingVariants(),
  ...createMeiNaSiExVariants(),
  ...createPoKongYanExVariants(),
];

const cardManager = CardManager.getInstance();
cardManager.defineFormat('WorkerC', [
  standardSets.setH,
  standardSets.setG,
  standardSets.setF,
  extraFgh,
  extraG,
  extraH,
], new Rules({
  firstTurnDrawCard: false,
  firstTurnUseSupporter: false,
  firstTurnUseAttack: false,
}));

const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
