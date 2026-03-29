import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class EnteiV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10739,
      name: '炎帝V',
      yorenCode: 'Y930',
      cardType: '1',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '154/131',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 230,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/261.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1019,
          name: '燃烧回旋曲',
          text: '追加造成双方备战宝可梦数量×20点伤害。',
          cost: ['火', '无色'],
          damage: '20+',
        },
      ],
      features: [
        {
          id: 130,
          name: '瞬步',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。从自己的牌库上方抽取1张卡牌。',
        },
      ],
    },
    collection: {
      id: 208,
      commodityCode: 'CS6aC',
      name: '补充包 碧海暗影 啸',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/261.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp = 230;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '瞬步',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。从自己的牌库上方抽取1张卡牌。',
    },
  ];

  public attacks = [
    {
      name: '燃烧回旋曲',
      cost: [CardType.FIRE, CardType.COLORLESS],
      damage: '20+',
      text: '追加造成双方备战宝可梦数量×20点伤害。',
    },
  ];

  public set = 'set_f';

  public name = '炎帝V';

  public fullName = '炎帝V 154/131#10739';

  public readonly INSTANT_STEP_MARKER = 'INSTANT_STEP_MARKER';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.INSTANT_STEP_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, 1);
      player.marker.addMarker(this.INSTANT_STEP_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const ownBench = effect.player.bench.filter(slot => slot.pokemons.cards.length > 0).length;
      const oppBench = effect.opponent.bench.filter(slot => slot.pokemons.cards.length > 0).length;
      effect.damage = 20 + (ownBench + oppBench) * 20;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.INSTANT_STEP_MARKER, this);
      return state;
    }

    return state;
  }
}
