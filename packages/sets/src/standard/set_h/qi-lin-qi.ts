import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function* useDoubleHeadButt(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const benchTargets = opponent.bench.filter(slot => slot.pokemons.cards.length > 0);

  effect.damage = 30;

  if (benchTargets.length === 0) {
    return state;
  }

  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false },
    ),
    targets => {
      if (targets === null || targets.length === 0) {
        next();
        return;
      }

      const damage = new PutDamageEffect(effect, 10);
      damage.target = targets[0];
      store.reduceEffect(state, damage);
      next();
    },
  );

  return state;
}

export class QiLinQi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17455,
      name: '麒麟奇',
      yorenCode: 'Y1479',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '078/207',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        hp: 100,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/502.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '双向头击',
          text: '给自己的1只备战宝可梦，也造成10点伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['超', '无色'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Natsumi Yoshida'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/502.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 100;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '双向头击',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '给自己的1只备战宝可梦，也造成10点伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_h';

  public name: string = '麒麟奇';

  public fullName: string = '麒麟奇 078/207';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const generator = useDoubleHeadButt(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
