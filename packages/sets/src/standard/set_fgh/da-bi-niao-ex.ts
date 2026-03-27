import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  SelectPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';

function* useSonicSearch(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.marker.hasMarker(overrideCard.SONIC_SEARCH_MARKER)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  player.marker.addMarker(overrideCard.SONIC_SEARCH_MARKER, overrideCard);
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
      shuffleAfterSearch: true,
    }
  );
  return state;
}

export class DaBiNiaoEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14396,
      name: '大比鸟ex',
      yorenCode: 'Y1315',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '157/129',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 280,
        evolveText: '2阶进化',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/386.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 4340,
          name: '狂风呼啸',
          text: '若希望，可将场上的竞技场放于弃牌区。',
          cost: ['COLORLESS', 'COLORLESS'],
          damage: '120',
        },
      ],
      features: [
        {
          id: 570,
          name: '音速搜索',
          text: '在自己的回合可以使用1次。选择自己牌库中任意1张卡牌，加入手牌。并重洗牌库。在这个回合，如果已经使用了其他的「音速搜索」的话，则无法使用这个特性。',
        },
      ],
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/386.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '大比鸟';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 280;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers = [
    {
      name: '音速搜索',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己牌库中任意1张卡牌，加入手牌。并重洗牌库。在这个回合，如果已经使用了其他的「音速搜索」的话，则无法使用这个特性。',
    },
  ];

  public attacks = [
    {
      name: '狂风呼啸',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: '若希望，可将场上的竞技场放于弃牌区。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '大比鸟ex';

  public fullName: string = '大比鸟ex 157/129#14396';

  public readonly SONIC_SEARCH_MARKER = 'SONIC_SEARCH_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      return useSonicSearch(() => void 0, store, state, effect);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const stadium = StateUtils.getStadiumCard(state);
      if (stadium === undefined) {
        return state;
      }

      return store.prompt(
        state,
        new SelectPrompt(effect.player.id, GameMessage.CHOOSE_OPTION, ['不弃置', '弃置场地'], { allowCancel: false }),
        choice => {
          if (choice === 1) {
            const stadiumList = StateUtils.findCardList(state, stadium);
            const owner = StateUtils.findOwner(state, stadiumList);
            stadiumList.moveTo(owner.discard);
          }
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.SONIC_SEARCH_MARKER);
      return state;
    }

    return state;
  }
}

const overrideCard = new DaBiNiaoEx();
