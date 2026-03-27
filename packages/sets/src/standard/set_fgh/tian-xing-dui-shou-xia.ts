import {
  EnergyCard,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const energies = opponent.active.energies.cards.filter(card => card.superType === SuperType.ENERGY);

  if (energies.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DECK,
      opponent.active.energies,
      { superType: SuperType.ENERGY },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selected.length > 0) {
    opponent.active.energies.moveCardsToTop(selected, opponent.deck);
  }

  return store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
    opponent.deck.applyOrder(order);
  });
}

export class TianXingDuiShouXia extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 15574,
      name: '天星队手下',
      yorenCode: 'Y1263',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '181/207',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/185.png',
      ruleLines: [
        '选择对手战斗宝可梦身上附着的1个能量，放回对手的牌库上方。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['nagimiso'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/185.png',
  };

  public set: string = 'set_g';

  public name: string = '天星队手下';

  public fullName: string = '天星队手下 181/207#15574';

  public text: string = '选择对手战斗宝可梦身上附着的1个能量，放回对手的牌库上方。\n在自己的回合只可以使用1张支援者卡。';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
