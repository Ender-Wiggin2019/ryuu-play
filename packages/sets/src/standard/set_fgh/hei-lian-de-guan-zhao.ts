import {
  CardType,
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

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const blocked: any[] = [];

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot, pokemonCard, target) => {
    if (pokemonSlot.damage === 0 || !pokemonCard.cardTypes.includes(CardType.COLORLESS)) {
      blocked.push(target);
    }
  });

  if (blocked.length === player.active.pokemons.cards.length + player.bench.reduce((sum, slot) => sum + slot.pokemons.cards.length, 0)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_PICK_UP,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  targets[0].moveTo(player.hand);

  return state;
}

export class HeiLianDeGuanZhao extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_fgh';

  public name: string = '黑连的关照';

  public fullName: string = '黑连的关照 184/207';

  public text: string = '选择1只身上有伤害指示物的无属性宝可梦，将该宝可梦与其身上的所有卡牌放回手牌。';

  public rawData = {
    raw_card: {
      id: 15575,
      name: '黑连的关照',
      yorenCode: 'Y1082',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '184/207',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/188.png',
      ruleLines: [
        '选择自己的身上放置有伤害指示物的1只【无】宝可梦，将被选择的宝可梦，以及放于其身上的所有卡牌，放回手牌。',
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
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/188.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
