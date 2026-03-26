import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

function* useTeleportBreak(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const blocked = player.bench
    .map((slot, index) => ({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }))
    .filter(target => player.bench[target.index].pokemons.cards.length === 0);

  if (blocked.length === player.bench.length) {
    return state;
  }

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length > 0) {
    player.switchPokemon(targets[0]);
  }

  return state;
}

export class KirliaCs5aC extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9828,
      name: '奇鲁莉安',
      yorenCode: 'P281',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '044/127',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 90,
        evolveText: '1阶进化',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: '/api/v1/cards/9828/image',
      ruleLines: [],
      attacks: [
        {
          id: 9584,
          name: '瞬移破坏',
          text: '将这只宝可梦与备战宝可梦互换。',
          cost: ['超'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Saya Tsuruta'],
      pokemonCategory: '感情宝可梦',
      pokedexCode: '281',
      pokedexText: '当训练家高兴的时候，奇鲁莉安会充满能量，开心地转着圈跳舞。',
      height: 0.8,
      weight: 20.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'http://localhost:3000/api/v1/cards/9828/image',
  };

  public stage: Stage = Stage.STAGE_1;
  public evolvesFrom = '拉鲁拉丝';
  public cardTypes: CardType[] = [CardType.PSYCHIC];
  public hp: number = 90;
  public weakness = [{ type: CardType.DARK }];
  public resistance = [{ type: CardType.FIGHTING, value: -30 }];
  public retreat = [CardType.COLORLESS];
  public attacks = [
    {
      name: '瞬移破坏',
      cost: [CardType.PSYCHIC],
      damage: '30',
      text: '将这只宝可梦与备战宝可梦互换。',
    },
  ];
  public set: string = 'set_f';
  public name: string = '奇鲁莉安';
  public fullName: string = '奇鲁莉安 CS5aC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useTeleportBreak(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
