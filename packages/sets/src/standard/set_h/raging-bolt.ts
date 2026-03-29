import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class RagingBolt extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17538,
      name: '猛雷鼓',
      yorenCode: 'P1021',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '161/207',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: null,
        specialCardLabel: '古代',
        hp: 130,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/440.png',
      ruleLines: [],
      attacks: [
        {
          id: 247,
          name: '落雷风暴',
          text: '给对手的1只宝可梦，造成这只宝可梦身上附着的能量数量×30伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['雷', '斗'],
          damage: null,
        },
        {
          id: 248,
          name: '龙之头击',
          text: '',
          cost: ['雷', '斗', '无色'],
          damage: '130',
        },
      ],
      features: [],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/440.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.DRAGON];

  public hp = 130;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '落雷风暴',
      cost: [CardType.LIGHTNING, CardType.FIGHTING],
      damage: '',
      text: '给对手的1只宝可梦，造成这只宝可梦身上附着的能量数量×30伤害。[备战宝可梦不计算弱点、抗性。]',
    },
    {
      name: '龙之头击',
      cost: [CardType.LIGHTNING, CardType.FIGHTING, CardType.COLORLESS],
      damage: '130',
      text: '',
    },
  ];

  public set = 'set_h';

  public name = '猛雷鼓';

  public fullName = '猛雷鼓 161/207#17538';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;
      const damage = player.active.energies.cards.length * 30;

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          if (targets === null || targets.length === 0) {
            return;
          }

          effect.damage = 0;
          const target = targets[0];
          if (target === opponent.active) {
            const damageEffect = new DealDamageEffect(effect, damage);
            damageEffect.target = target;
            store.reduceEffect(state, damageEffect);
            return;
          }

          const damageEffect = new PutDamageEffect(effect, damage);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 130;
      return state;
    }

    return state;
  }
}
