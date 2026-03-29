const { BotManager, SimpleBot, config } = require('@ptcg/server');
const { CardManager, Rules } = require('@ptcg/common');

// Backend config
config.backend.address = '0.0.0.0';
config.backend.port = 12021;
config.backend.avatarsDir = __dirname + '/avatars';
config.backend.webUiDir = __dirname + '/packages/play/dist/ptcg-play';

// Storage config
config.storage.type = 'sqlite';
config.storage.database = __dirname + '/database.sq3';

// Bots config
config.bots.defaultPassword = 'bot';

// Sets/scans config
config.sets.scansDir = __dirname + '/scans';
config.sets.scansDownloadUrl = 'https://ptcg.ryuu.eu/scans'; // Deprecated: missing scans are not downloaded at startup

// Define available sets
const { baseSets, standardSets } = require('@ptcg/sets');
const { setDiamondAndPearl } = require('./packages/sets/dist/cjs/standard/set-diamond-and-pearl');
const { GiantHearth } = require('./packages/sets/dist/cjs/standard/set-sword-and-shield/giant-hearth');
const { OriginFormePalkiaV } = require('./packages/sets/dist/cjs/standard/set-sword-and-shield/origin-forme-palkia-v');
const { OriginFormePalkiaVSTAR } = require('./packages/sets/dist/cjs/standard/set-sword-and-shield/origin-forme-palkia-vstar');
const { hongLianKaiQiVariants } = require('./packages/sets/dist/cjs/standard/set_g/hong-lian-kai-qi');
const { hongLianKaiQiExVariants } = require('./packages/sets/dist/cjs/standard/set_g/hong-lian-kai-qi-ex');
const { tanXiaoShiVariants } = require('./packages/sets/dist/cjs/standard/set_g/tan-xiao-shi');

const cardManager = CardManager.getInstance();
const uniqueByFullName = cards => {
  const seen = new Set();
  return cards.filter(card => {
    if (seen.has(card.fullName)) {
      return false;
    }
    seen.add(card.fullName);
    return true;
  });
};
const setDiamondAndPearlForScenario = setDiamondAndPearl.filter(card =>
  card.fullName === 'Metal Energy EVO'
);

cardManager.defineFormat('Standard', [
  standardSets.setH,
  standardSets.setG,
  standardSets.setF,
], new Rules({
  firstTurnDrawCard: false,
  firstTurnUseSupporter: false,
  firstTurnUseAttack: false,
}));

// Register base cards used by scenario regressions without touching shared set indexes.
cardManager.defineSet(baseSets.setBase);
cardManager.defineSet(setDiamondAndPearlForScenario);
cardManager.defineSet(hongLianKaiQiVariants);
cardManager.defineSet(hongLianKaiQiExVariants);
cardManager.defineSet(tanXiaoShiVariants);
cardManager.defineSet([new GiantHearth()]);
cardManager.defineSet([new OriginFormePalkiaV(), new OriginFormePalkiaVSTAR()]);

// Define bots
const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
