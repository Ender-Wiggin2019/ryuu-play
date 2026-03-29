import {
  AttachEnergyPrompt,
  CardTarget,
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
  ShuffleDeckPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class ShiZuDaNiao extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10844,
      name: '始祖大鸟',
      yorenCode: 'P567',
      cardType: '1',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '113/131',
        rarityLabel: 'R☆★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 150,
        evolveText: '2阶进化',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/202.png',
      ruleLines: [],
      attacks: [
        {
          id: 8724,
          name: '高速之翼',
          text: '',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '120',
        },
      ],
      features: [
        {
          id: 1148,
          name: '原始涡轮',
          text: '在自己的回合可以使用1次。选择自己牌库中最多2张特殊能量，附着于自己的1只宝可梦身上。并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 208,
      commodityCode: 'CS6aC',
      name: '补充包 碧海暗影 啸',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/202.png',
  };

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '始祖小鸟';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 150;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '原始涡轮',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己牌库中最多2张特殊能量，附着于自己的1只宝可梦身上。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '高速之翼',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '始祖大鸟';

  public fullName: string = '始祖大鸟 113/131#10844';

  public readonly PRIMAL_TURBO_MARKER = 'PRIMAL_TURBO_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
      const blockedTo: CardTarget[] = [];
      let hasTarget = false;

      if (player.active.pokemons.cards.length === 0) {
        blockedTo.push({ player: playerType, slot: SlotType.ACTIVE, index: 0 });
      } else {
        hasTarget = true;
      }

      player.bench.forEach((slot, index) => {
        if (slot.pokemons.cards.length === 0) {
          blockedTo.push({ player: playerType, slot: SlotType.BENCH, index });
          return;
        }
        hasTarget = true;
      });

      const specialEnergyCount = player.deck.cards.filter(card => {
        return card instanceof EnergyCard && card.energyType === EnergyType.SPECIAL;
      }).length;

      if (specialEnergyCount === 0 || !hasTarget) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      let attached: { to: CardTarget; card: EnergyCard }[] = [];
      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_TO_ACTIVE,
          player.deck,
          playerType,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.SPECIAL },
          { allowCancel: true, min: 0, max: Math.min(2, specialEnergyCount), blockedTo, sameTarget: true }
        ),
        result => {
          if (result === null) {
            return;
          }

          attached = result as { to: CardTarget; card: EnergyCard }[];
          player.marker.addMarker(this.PRIMAL_TURBO_MARKER, this);

          for (const transfer of attached) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.deck.moveCardTo(transfer.card, target.energies);
          }

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    return state;
  }
}
