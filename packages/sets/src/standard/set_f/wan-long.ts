import {
  ChoosePokemonPrompt,
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '婉龙',
  fullName: '婉龙 149/129#14806',
  text: '抛掷1次硬币如果为正面，则选择对手的1只备战宝可梦，将其与战斗宝可梦互换。如果为反面，则将自己的战斗宝可梦与备战宝可梦互换。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 14806,
      name: '婉龙',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '149/129',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/378.png',
      ruleLines: [
        '抛掷1次硬币如果为正面，则选择对手的1只备战宝可梦，将其与战斗宝可梦互换。如果为反面，则将自己的战斗宝可梦与备战宝可梦互换。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/378.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);
  if (opponent === undefined) {
    throw new GameError(GameMessage.INVALID_GAME_STATE);
  }

  let flip = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    flip = result;
    next();
  });

  if (flip) {
    const hasBench = opponent.bench.some(slot => slot.pokemons.cards.length > 0);
    if (!hasBench) {
      return state;
    }

    let target: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ),
      result => {
        target = result || [];
        next();
      }
    );

    if (target.length > 0) {
      opponent.switchPokemon(target[0]);
    }
    return state;
  }

  const hasBench = player.bench.some(slot => slot.pokemons.cards.length > 0);
  if (!hasBench) {
    return state;
  }

  let target: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      target = result || [];
      next();
    }
  );

  if (target.length > 0) {
    player.switchPokemon(target[0]);
  }

  return state;
}

export class WanLong extends VariantTrainerCard {
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
