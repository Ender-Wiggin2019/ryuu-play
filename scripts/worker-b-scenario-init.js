const { BotManager, SimpleBot, config } = require('@ptcg/server');

config.backend.address = '127.0.0.1';
config.backend.port = 12031;
config.backend.avatarsDir = __dirname + '/../avatars';
config.backend.webUiDir = '';

config.storage.type = 'sqlite';
config.storage.database = __dirname + '/../database-worker-b-scenario.sq3';

config.bots.defaultPassword = 'bot';

config.sets.scansDir = __dirname + '/../scans';
config.sets.scansDownloadUrl = 'https://ptcg.ryuu.eu/scans';

const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
