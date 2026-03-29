import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTarget,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayerType,
  PokemonCard,
  ShuffleDeckPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class MiLiLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11868,
      name: '米立龙',
      yorenCode: 'P0978',
      cardType: '1',
      commodityCode: 'CSV1C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '041/127',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/114.png',
      ruleLines: [],
      attacks: [
        {
          id: 788,
          name: '预先准备',
          text: '选择自己牌库中最多2张「基本【水】能量」，附着于自己的1只【基础】宝可梦身上。并重洗牌库。',
          cost: ['水'],
          damage: null,
        },
        {
          id: 789,
          name: '上弓折返',
          text: '将这只宝可梦，以及放于其身上的所有卡牌，放回手牌。',
          cost: ['水'],
          damage: '30',
        },
      ],
      features: [],
    },
    collection: {
      id: 244,
      commodityCode: 'CSV1C',
      name: '补充包 亘古开来',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/114.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.WATER];

  public hp = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '预先准备',
      cost: [CardType.WATER],
      damage: '',
      text: '选择自己牌库中最多2张「基本【水】能量」，附着于自己的1只【基础】宝可梦身上。并重洗牌库。',
    },
    {
      name: '上弓折返',
      cost: [CardType.WATER],
      damage: '30',
      text: '将这只宝可梦，以及放于其身上的所有卡牌，放回手牌。',
    },
  ];

  public set = 'set_g';

  public name = '米立龙';

  public fullName = '米立龙 041/127#11868';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
      const basicWaterCount = player.deck.cards.filter(card => {
        return card instanceof EnergyCard
          && card.energyType === EnergyType.BASIC
          && card.provides.includes(CardType.WATER);
      }).length;

      if (basicWaterCount === 0) {
        return state;
      }

      const blockedTo: CardTarget[] = [];
      if (player.active.getPokemonCard()?.stage !== Stage.BASIC) {
        blockedTo.push({ player: playerType, slot: SlotType.ACTIVE, index: 0 });
      }

      player.bench.forEach((bench, index) => {
        if (bench.getPokemonCard()?.stage !== Stage.BASIC) {
          blockedTo.push({ player: playerType, slot: SlotType.BENCH, index });
        }
      });

      if (blockedTo.length === 6) {
        return state;
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_TO_ACTIVE,
          player.deck,
          playerType,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
          { allowCancel: true, min: 0, max: Math.min(2, basicWaterCount), blockedTo, sameTarget: true }
        ),
        result => {
          const transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.deck.moveCardTo(transfer.card, target.energies);
          }

          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (pokemonSlot === undefined) {
        return state;
      }

      effect.damage = 30;
      pokemonSlot.moveTo(player.hand);
      pokemonSlot.clearEffects();
      return state;
    }

    return state;
  }
}
