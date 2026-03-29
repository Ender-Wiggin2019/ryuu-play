import {
  CardTag,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '望罗',
  fullName: '望罗 162/131#10747',
  text: '选择自己备战区中的1只「宝可梦V」，将被选择的宝可梦，以及放于其身上的卡牌，全部放于弃牌区。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 10747,
      name: '望罗',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '162/131',
        rarityLabel: 'HR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/269.png',
      ruleLines: [
        '选择自己备战区中的1只「宝可梦V」，将被选择的宝可梦，以及放于其身上的卡牌，全部放于弃牌区。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/269.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
  const targets: any[] = [];
  let hasTarget = false;

  player.bench.forEach((bench, index) => {
    const pokemon = bench.getPokemonCard();
    if (pokemon !== undefined && pokemon.tags.includes(CardTag.POKEMON_V)) {
      hasTarget = true;
      return;
    }
    targets.push({ player: playerType, slot: SlotType.BENCH, index });
  });

  if (!hasTarget) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
      playerType,
      [SlotType.BENCH],
      { allowCancel: false, blocked: targets }
    ),
    result => {
      selected = result || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  selected[0].moveTo(player.discard);
  return state;
}

export class WangLuo extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
