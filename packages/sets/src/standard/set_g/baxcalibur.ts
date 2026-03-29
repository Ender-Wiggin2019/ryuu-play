import {
  AttachEnergyEffect,
  AttachEnergyPrompt,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function isBasicWaterEnergy(card: EnergyCard): boolean {
  return card.energyType === EnergyType.BASIC && card.provides.includes(CardType.WATER);
}

function getPlayerType(state: State, playerId: number): PlayerType {
  return state.players[0]?.id === playerId ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
}

export class Baxcalibur extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13296,
      name: '戟脊龙',
      yorenCode: 'P0998',
      cardType: '1',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '133/130',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 160,
        evolveText: '2阶进化',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/364.png',
      ruleLines: [],
      attacks: [
        {
          id: 1043,
          name: '爆破之尾',
          text: '',
          cost: ['水', '水', '无色'],
          damage: '130',
        },
      ],
      features: [
        {
          id: 134,
          name: '极低温',
          text: '在自己的回合可以使用任意次。选择自己手牌中的1张「基本【水】能量」，附着于自己的宝可梦身上。',
        },
      ],
    },
    collection: {
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/364.png',
  };

  public stage = Stage.STAGE_2;

  public evolvesFrom = '凉脊龙';

  public cardTypes = [CardType.WATER];

  public hp = 160;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '极低温',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用任意次。选择自己手牌中的1张「基本【水】能量」，附着于自己的宝可梦身上。',
    },
  ];

  public attacks = [
    {
      name: '爆破之尾',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: '130',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '戟脊龙';

  public fullName = '戟脊龙 133/130#13296';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const hasWaterEnergy = player.hand.cards.some(
        card => card instanceof EnergyCard && isBasicWaterEnergy(card)
      );

      if (!hasWaterEnergy) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_CARDS,
          player.hand,
          getPlayerType(state, player.id),
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
          { allowCancel: true, min: 1, max: 1 }
        ),
        transfers => {
          (transfers || []).forEach(transfer => {
            const target = StateUtils.getTarget(state, player, transfer.to);
            const energyCard = transfer.card as EnergyCard;
            const attachEffect = new AttachEnergyEffect(player, energyCard, target);
            store.reduceEffect(state, attachEffect);
          });
        }
      );
    }

    return state;
  }
}
