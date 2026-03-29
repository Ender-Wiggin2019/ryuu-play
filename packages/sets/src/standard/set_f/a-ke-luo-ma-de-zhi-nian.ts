import { EnergyCard, Effect, GameError, GameMessage, ShuffleDeckPrompt, State, StoreLike, SuperType, TrainerEffect, TrainerType } from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '阿克罗玛的执念',
  fullName: '阿克罗玛的执念 232/207#17609',
  text: '选择自己牌库中的竞技场和能量各1张，在给对手看过之后，加入手牌。并重洗牌库。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 17609,
      name: '阿克罗玛的执念',
      yorenCode: 'Y1480',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '232/207',
        rarityLabel: 'SR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/583.png',
      ruleLines: [
        '选择自己牌库中的竞技场和能量各1张，在给对手看过之后，加入手牌。并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['hncl'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/583.png',
  },
};

function hasStadium(cards: any[]): boolean {
  return cards.some(card => card instanceof Object && (card as any).trainerType === TrainerType.STADIUM);
}

function hasEnergy(cards: any[]): boolean {
  return cards.some(card => card instanceof EnergyCard);
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (!hasStadium(player.deck.cards) || !hasEnergy(player.deck.cards)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.STADIUM },
    {
      min: 1,
      max: 1,
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: false,
    }
  );

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { superType: SuperType.ENERGY },
    {
      min: 1,
      max: 1,
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: false,
    }
  );

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class AKeLuoMaDeZhiNian extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
