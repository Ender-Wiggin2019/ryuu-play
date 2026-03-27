import {
  CardList,
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
} from '@ptcg/common';

export class Drakloak extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17535,
      name: '多龙奇',
      yorenCode: 'P886',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '158/207',
      },
      image: 'img/458/433.png',
      hash: 'ecb23a9e4da56e4874352c50d1ce9a6e',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/433.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '多龙梅西亚';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 90;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '侦察指令',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用1次。查看自己牌库上方2张卡牌，选择其中1张卡牌，加入手牌。将剩余的卡牌，放回牌库下方。',
    },
  ];

  public attacks = [
    {
      name: '龙之头击',
      cost: [CardType.FIRE, CardType.PSYCHIC],
      damage: '70',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '多龙奇';

  public fullName: string = '多龙奇 CSV8C';

  public readonly RECON_DIRECTIVE_MARKER = 'RECON_DIRECTIVE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.RECON_DIRECTIVE_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const deckTop = new CardList();
      player.deck.moveTo(deckTop, 2);

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          deckTop,
          {},
          { min: 1, max: 1, allowCancel: false }
        ),
        selected => {
          player.marker.addMarker(this.RECON_DIRECTIVE_MARKER, this);
          deckTop.moveCardsTo(selected || [], player.hand);
          deckTop.moveTo(player.deck);
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.RECON_DIRECTIVE_MARKER, this);
      return state;
    }

    return state;
  }
}
