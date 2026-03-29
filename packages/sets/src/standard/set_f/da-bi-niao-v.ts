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
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';

function* useVanishingWing(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect,
  self: DaBiNiaoV
): IterableIterator<State> {
  const player = effect.player;
  const pokemonSlot = StateUtils.findPokemonSlot(state, self);

  if (pokemonSlot === undefined || pokemonSlot === player.active) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(self.VANISHING_WING_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  player.marker.addMarker(self.VANISHING_WING_MARKER, self);
  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    {},
    {
      min: 1,
      max: 1,
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: false,
    }
  );

  pokemonSlot.moveTo(player.deck);
  pokemonSlot.clearEffects();

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class DaBiNiaoV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10454,
      name: '大比鸟V',
      yorenCode: 'Y1101',
      cardType: '1',
      commodityCode: 'CS6bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '151/131',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 210,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/260.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 8955,
          name: '乘风飞翔',
          text: '如果场上有自己的竞技场的话，则追加造成80点伤害。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '80+',
        },
      ],
      features: [
        {
          id: 1175,
          name: '消失之翼',
          text: '如果这只宝可梦在备战区的话，则在自己的回合可以使用1次。将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 206,
      commodityCode: 'CS6bC',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/260.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 210;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '消失之翼',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在备战区的话，则在自己的回合可以使用1次。将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '乘风飞翔',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '80+',
      text: '如果场上有自己的竞技场的话，则追加造成80点伤害。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '大比鸟V';

  public fullName: string = '大比鸟V 151/131#10454';

  public readonly VANISHING_WING_MARKER = 'VANISHING_WING_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useVanishingWing(() => generator.next(), store, state, effect, this);
      return generator.next().value;
    }

    if (effect instanceof ShuffleDeckPrompt) {
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.VANISHING_WING_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const stadium = StateUtils.getStadiumCard(state);
      if (stadium !== undefined) {
        effect.damage += 80;
      }
      return state;
    }

    return state;
  }
}
