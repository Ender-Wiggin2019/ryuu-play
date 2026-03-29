import {
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayPokemonEffect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

function* useFlyingEntry(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PlayPokemonEffect,
  self: ShuaiJiaoYingRen
): IterableIterator<State> {
  const player = effect.player;
  const opponentPlayerType = state.players[0] === player ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER;
  const opponentBench = state.players.find(p => p.id !== player.id)?.bench ?? [];
  const occupiedBench = opponentBench.filter(slot => slot.pokemons.cards.length > 0).length;

  if (occupiedBench === 0) {
    return state;
  }

  try {
    const powerEffect = new PowerEffect(player, self.powers[0], self);
    store.reduceEffect(state, powerEffect);
  } catch {
    return state;
  }

  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      opponentPlayerType,
      [SlotType.BENCH],
      { min: 1, max: Math.min(2, occupiedBench), allowCancel: true }
    ),
    targets => {
      if (targets === null || targets.length === 0) {
        return;
      }

      targets.forEach(target => {
        target.damage += 10;
      });
      next();
    }
  );

  return state;
}

export class ShuaiJiaoYingRen extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11906,
      name: '摔角鹰人',
      yorenCode: 'P701',
      cardType: '1',
      commodityCode: 'CSV1C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '079/127',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '超 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/218.png',
      ruleLines: [],
      attacks: [
        {
          id: 1421,
          name: '翅膀攻击',
          text: '',
          cost: ['FIGHTING', 'COLORLESS', 'COLORLESS'],
          damage: '70',
        },
      ],
      features: [
        {
          id: 175,
          name: '飞身入场',
          text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。给对手的2只备战宝可梦身上，各放置1个伤害指示物。',
        },
      ],
      illustratorNames: ['Yuya Oka'],
      pokemonCategory: '摔角宝可梦',
      pokedexCode: '0701',
      pokedexText: '利用翅膀轻盈起跳后华丽地给予对手致命一击，这种招式是在它生长的森林中磨炼出来的。',
      height: 0.8,
      weight: 21.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 244,
      commodityCode: 'CSV1C',
      name: '补充包 亘古开来',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/218.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '飞身入场',
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。给对手的2只备战宝可梦身上，各放置1个伤害指示物。',
    },
  ];

  public attacks = [
    {
      name: '翅膀攻击',
      cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
      damage: '70',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '摔角鹰人';

  public fullName = '摔角鹰人 079/127#11906';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const generator = useFlyingEntry(() => generator.next(), store, state, effect, this);
      return generator.next().value;
    }

    return state;
  }
}
