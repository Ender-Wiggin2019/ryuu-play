import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '莱姆',
  fullName: '莱姆 153/130#13316',
  text: '从自己牌库上方抽取3张卡牌。将对手的战斗宝可梦与备战宝可梦互换。[放于战斗场的宝可梦由对手选择。]\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 13316,
      name: '莱姆',
      yorenCode: 'Y1298',
      cardType: '2',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '153/130',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/384.png',
      ruleLines: [
        '从自己牌库上方抽取3张卡牌。将对手的战斗宝可梦与备战宝可梦互换。[放于战斗场的宝可梦由对手选择。]',
        '在自己的回合只可以使用1张支援者卡。',
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
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/384.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (opponent.bench.every(slot => slot.pokemons.cards.length === 0)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));

  let target: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      opponent.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    results => {
      target = results || [];
      next();
    }
  );

  if (target.length === 0) {
    return state;
  }

  opponent.switchPokemon(target[0]);
  return state;
}

export class LeiMu extends VariantTrainerCard {
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
