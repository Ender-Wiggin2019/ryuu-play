import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
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
  SuperType,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

export class RotomV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10957,
      name: '洛托姆V',
      yorenCode: 'Y1161',
      cardType: '1',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '023/072',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦V',
        hp: 190,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/38.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 8135,
          name: '废品短路',
          text: '将自己弃牌区中任意数量的「宝可梦道具」放于放逐区，追加造成其张数×40点伤害。',
          cost: ['LIGHTNING', 'LIGHTNING'],
          damage: '40+',
        },
      ],
      features: [
        {
          id: 1075,
          name: '快速充电',
          text: '在自己的回合可以使用1次，如果使用了，则自己的回合结束。从自己牌库上方抽取3张卡牌。',
        },
      ],
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/38.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 190;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '快速充电',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次，如果使用了，则自己的回合结束。从自己牌库上方抽取3张卡牌。',
    },
  ];

  public attacks = [
    {
      name: '废品短路',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING],
      damage: '40+',
      text: '将自己弃牌区中任意数量的「宝可梦道具」放于放逐区，追加造成其张数×40点伤害。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '洛托姆V';

  public fullName: string = '洛托姆V CS6.5C';

  public readonly INSTANT_CHARGE_MARKER = 'INSTANT_CHARGE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.INSTANT_CHARGE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
      player.marker.addMarker(this.INSTANT_CHARGE_MARKER, this);
      store.reduceEffect(state, new EndTurnEffect(player));
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const maxCards = player.discard.cards.filter(
        card => card.superType === SuperType.TRAINER && card instanceof TrainerCard && card.trainerType === TrainerType.TOOL
      ).length;

      if (maxCards === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.discard,
          { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
          { min: 0, max: maxCards, allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          player.discard.toLostZone(cards);
          effect.damage += cards.length * 40;
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.INSTANT_CHARGE_MARKER, this);
      return state;
    }

    return state;
  }
}
