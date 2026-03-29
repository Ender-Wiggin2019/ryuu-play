import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  PowerEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  PowerType,
} from '@ptcg/common';

const QI_LIN_QI_EX_LOGIC_GROUP_KEY = 'pokemon:奇麒麟ex:Y1397:H:hp260:尾甲:恶劣光束160';

function isBasicPokemonEx(card: PokemonCard | undefined): boolean {
  return card !== undefined
    && card.stage === Stage.BASIC
    && card.tags.includes(CardTag.POKEMON_EX);
}

function* useDarkRay(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  effect.damage = 160;

  if (!opponent.bench.some(slot => slot.pokemons.cards.length > 0)) {
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

      const damage = new PutDamageEffect(effect, 30);
      damage.target = targets[0];
      store.reduceEffect(state, damage);
      next();
    },
  );

  return state;
}

export class QiLinQiEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16307,
      name: '奇麒麟ex',
      yorenCode: 'Y1466',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '141/204',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '宝可梦ex',
        hp: 260,
        evolveText: '1阶进化',
        weakness: '草 ×2',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/384.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1,
          name: '恶劣光束',
          text: '给对手的1只备战宝可梦，也造成30伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['超', '无色', '无色'],
          damage: '160',
        },
      ],
      features: [
        {
          id: 1,
          name: '尾甲',
          text: '这只宝可梦，不会受到对手【基础】宝可梦的「宝可梦【ex】」的招式的伤害。',
        },
      ],
      illustratorNames: ['5ban Graphics'],
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/384.png',
    logic_group_key: QI_LIN_QI_EX_LOGIC_GROUP_KEY,
    variant_group_key: QI_LIN_QI_EX_LOGIC_GROUP_KEY,
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '麒麟奇';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 260;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '尾甲',
      powerType: PowerType.ABILITY,
      text: '这只宝可梦，不会受到对手【基础】宝可梦的「宝可梦【ex】」的招式的伤害。',
    },
  ];

  public attacks = [
    {
      name: '恶劣光束',
      cost: [CardType.PSYCHIC, CardType.COLORLESS, CardType.COLORLESS],
      damage: '160',
      text: '给对手的1只备战宝可梦，也造成30伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_h';

  public name: string = '奇麒麟ex';

  public fullName: string = '奇麒麟ex 141/204';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      return state;
    }

    if ((effect instanceof PutDamageEffect || effect instanceof DealDamageEffect)
      && effect.target.pokemons.cards.includes(this)) {
      const sourceOwner = StateUtils.findOwner(state, effect.source);
      const targetOwner = StateUtils.findOwner(state, effect.target);
      const sourcePokemon = effect.source.getPokemonCard();

      if (sourceOwner !== undefined && targetOwner !== undefined && sourceOwner !== targetOwner && isBasicPokemonEx(sourcePokemon)) {
        effect.damage = 0;
      }
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const generator = useDarkRay(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
