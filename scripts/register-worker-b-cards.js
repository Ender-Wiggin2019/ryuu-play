'use strict';

const activeEntry = process.argv[1] || '';
if (!/start\.js$|scenario-debug\.js$/.test(activeEntry)) {
  module.exports = {};
  return;
}

require('ts-node/register/transpile-only');

const { CardManager, CardType, EnergyCard, EnergyType, StateSerializer, SuperType } = require('@ptcg/common');
const { tuLongDiDiVariants } = require('../packages/sets/src/standard/set_h/tu-long-di-di');
const { tuLongJieJieVariants } = require('../packages/sets/src/standard/set_f/tu-long-jie-jie');
const { huaLiaoHuanHuanVariants } = require('../packages/sets/src/standard/set_f/hua-liao-huan-huan');
const { guYueNiaoVariants } = require('../packages/sets/src/standard/set_h/gu-yue-niao');
const { guaGuaPaoWaVariants } = require('../packages/sets/src/standard/set_f/gua-gua-pao-wa');
const { jiaHeRenWaExVariants } = require('../packages/sets/src/standard/set_f/jia-he-ren-wa-ex');
const { huPaExVariants } = require('../packages/sets/src/standard/set_f/hu-pa-ex');
const { createMuMuXiaoVariants } = require('../packages/sets/src/standard/set_h/mu-mu-xiao');
const { createKenGuoChongVariants } = require('../packages/sets/src/standard/set_h/ken-guo-chong');
const { createChongGunNiVariants } = require('../packages/sets/src/standard/set_h/chong-gun-ni');
const { createChongJiaShengVariants } = require('../packages/sets/src/standard/set_h/chong-jia-sheng');

class BasicGrassEnergy extends EnergyCard {
  constructor() {
    super();
    this.superType = SuperType.ENERGY;
    this.energyType = EnergyType.BASIC;
    this.provides = [CardType.GRASS];
    this.set = 'TEST';
    this.name = '基本草能量';
    this.fullName = '基本草能量 TEST';
  }
}

setImmediate(() => {
  const cm = CardManager.getInstance();
  const cardsToRegister = [
    ...tuLongDiDiVariants,
    ...tuLongJieJieVariants,
    ...huaLiaoHuanHuanVariants,
    ...guYueNiaoVariants,
    ...guaGuaPaoWaVariants,
    ...jiaHeRenWaExVariants,
    ...huPaExVariants,
    ...createMuMuXiaoVariants(),
    ...createKenGuoChongVariants(),
    ...createChongGunNiVariants(),
    ...createChongJiaShengVariants(),
    new BasicGrassEnergy(),
  ].filter(card => !cm.isCardDefined(card.fullName));

  if (cardsToRegister.length > 0) {
    cardsToRegister.forEach(card => {
      const rawId = card.rawData?.raw_card?.id;
      if (typeof rawId === 'number' && rawId >= 0) {
        card.id = rawId;
      }
    });
    cm.defineSet(cardsToRegister);
  }

  StateSerializer.setKnownCards(cm.getAllCards());
});

module.exports = {};
