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
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerType,
} from '@ptcg/common';

export class OranguruV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9654,
      name: '智挥猩V',
      yorenCode: 'Y989',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '150/128',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 210,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/251.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 3194,
          name: '精神强念',
          text: '追加造成对手战斗宝可梦身上附有的能量数量×50点伤害。',
          cost: ['无色', '无色', '无色'],
          damage: '30+',
        },
      ],
      features: [
        {
          id: 381,
          name: '预订',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。选择自己牌库中最多2张「宝可梦道具」，在给对手看过之后，加入手牌。并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/251.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 210;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '预订',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。选择自己牌库中最多2张「宝可梦道具」，在给对手看过之后，加入手牌。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '精神强念',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '30+',
      text: '追加造成对手战斗宝可梦身上附有的能量数量×50点伤害。',
    },
  ];

  public set = 'set_f';

  public name = '智挥猩V';

  public fullName = '智挥猩V 150/128#9654';

  public readonly BACK_ORDER_MARKER = 'BACK_ORDER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.BACK_ORDER_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const blocked: number[] = [];
      let available = 0;
      player.deck.cards.forEach((card, index) => {
        if (card.superType === SuperType.TRAINER && (card as any).trainerType === TrainerType.TOOL) {
          available += 1;
          return;
        }
        blocked.push(index);
      });

      if (available === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.deck,
          { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
          { min: 0, max: Math.min(2, available), allowCancel: false, blocked }
        ),
        selected => {
          const cards = selected || [];
          player.deck.moveCardsTo(cards, player.hand);
          player.marker.addMarker(this.BACK_ORDER_MARKER, this);
          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const attached = effect.opponent.active.energies.cards.length;
      effect.damage = 30 + attached * 50;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.BACK_ORDER_MARKER, this);
      return state;
    }

    return state;
  }
}
