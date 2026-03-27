import {
  AttackEffect,
  CardTag,
  CardType,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  PowerType,
  PutCountersEffect,
  PutDamageEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class DaYaLi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9768,
      name: '大牙狸',
      yorenCode: 'P399',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '111/128',
        rarityLabel: 'C☆★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/196.png',
      ruleLines: [],
      attacks: [
        {
          id: 10024,
          name: '终结门牙',
          text: '抛掷1次硬币如果为反面，则这个招式失败。',
          cost: ['COLORLESS', 'COLORLESS'],
          damage: '30',
        },
      ],
      features: [
        {
          id: 1341,
          name: '毫不在意',
          text: '只要这只宝可梦，处于备战区，就不会受到招式的伤害。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/196.png',
    logic_group_key: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
    variant_group_key: 'pokemon:P399:大牙狸:60:毫不在意:终结门牙',
    variant_group_size: 5,
  };

  public tags = [CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '毫不在意',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦，处于备战区，就不会受到招式的伤害。',
    },
  ];

  public attacks = [
    {
      name: '终结门牙',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '30',
      text: '抛掷1次硬币如果为反面，则这个招式失败。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '大牙狸';

  public fullName: string = '大牙狸 111/128#9768';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if ((effect instanceof PutDamageEffect || effect instanceof PutCountersEffect) && effect.attackEffect instanceof AttackEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot !== undefined && pokemonSlot.pokemons.cards.includes(this)) {
        const owner = StateUtils.findOwner(state, pokemonSlot);
        if (pokemonSlot !== owner.active) {
          effect.preventDefault = true;
        }
      }
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      let heads = false;
      return store.prompt(state, new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP), result => {
        heads = result;
        if (!heads) {
          effect.damage = 0;
        }
      });
    }

    return state;
  }
}
