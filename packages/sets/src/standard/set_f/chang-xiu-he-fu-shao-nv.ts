import {
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  SelectPrompt,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
  ShuffleDeckPrompt,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const openBench = player.bench.filter(slot => slot.pokemons.cards.length === 0);
  const basicPokemonCount = player.deck.cards.filter(
    card => card instanceof PokemonCard && card.stage === Stage.BASIC
  ).length;

  if (openBench.length === 0 || basicPokemonCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: any[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  const benchSlot = openBench[0];
  player.deck.moveCardsTo(selected, benchSlot.pokemons);

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  let switchIndex = 0;
  yield store.prompt(
    state,
    new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, ['不交换', '交换到战斗区'], { allowCancel: false }),
    result => {
      switchIndex = result ?? 0;
      next();
    }
  );

  if (switchIndex === 1) {
    player.switchPokemon(benchSlot);
  }

  return state;
}

export class ChangXiuHeFuShaoNv extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = '长袖和服少女';

  public fullName: string = '长袖和服少女 126/128';

  public text: string = '从牌库选择1张基础宝可梦放到备战区，然后重洗牌库。若愿意，可与战斗宝可梦交换。';

  public rawData = {
    raw_card: {
      id: 9782,
      name: '长袖和服少女',
      yorenCode: 'Y995',
      cardType: '2',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '126/128',
        rarityLabel: 'C☆★',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/225.png',
      ruleLines: [
        '选择自己牌库中的1张【基础】宝可梦，放于备战区。并重洗牌库。若希望，可将该宝可梦与战斗宝可梦互换。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Yusuke Ohmura'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/225.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
