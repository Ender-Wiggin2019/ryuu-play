import {
  AttackEffect,
  Card,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  EnergyCard,
  EnergyType,
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
  SuperType,
} from '@ptcg/common';

function isBasicWaterEnergy(card: Card): card is EnergyCard {
  return card instanceof EnergyCard
    && card.energyType === EnergyType.BASIC
    && card.provides.includes(CardType.WATER);
}

export class ChienPaoEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13320,
      name: '古剑豹ex',
      yorenCode: 'P1002',
      cardType: '1',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '157/130',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/388.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1576,
          name: '冰雹利刃',
          text: '将自己场上宝可梦身上附着的任意数量的【水】能量放于弃牌区，造成其张数×60伤害。',
          cost: ['水', '水'],
          damage: '60×',
        },
      ],
      features: [
        {
          id: 185,
          name: '战栗冷气',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。选择自己牌库中最多2张「基本【水】能量」，在给对手看过之后，加入手牌。并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/388.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage = Stage.BASIC;

  public cardTypes = [CardType.WATER];

  public hp = 220;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '战栗冷气',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。选择自己牌库中最多2张「基本【水】能量」，在给对手看过之后，加入手牌。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '冰雹利刃',
      cost: [CardType.WATER, CardType.WATER],
      damage: '60×',
      text: '将自己场上宝可梦身上附着的任意数量的【水】能量放于弃牌区，造成其张数×60伤害。',
    },
  ];

  public set = 'set_g';

  public name = '古剑豹ex';

  public fullName = '古剑豹ex 157/130#13320';

  public readonly SHIVERING_CHILL_MARKER = 'SHIVERING_CHILL_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.SHIVERING_CHILL_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const blocked: number[] = [];
      let available = 0;
      player.deck.cards.forEach((card, index) => {
        if (isBasicWaterEnergy(card)) {
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
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
          { min: 0, max: Math.min(2, available), allowCancel: false, blocked }
        ),
        selected => {
          player.deck.moveCardsTo(selected || [], player.hand);
          player.marker.addMarker(this.SHIVERING_CHILL_MARKER, this);
          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const energyPool = new CardList();
      [effect.player.active, ...effect.player.bench].forEach(slot => {
        slot.energies.cards.forEach(card => {
          if (isBasicWaterEnergy(card)) {
            energyPool.cards.push(card);
          }
        });
      });

      if (energyPool.cards.length === 0) {
        effect.damage = 0;
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          effect.player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          energyPool,
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
          { min: 0, max: energyPool.cards.length, allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          cards.forEach(card => {
            const source = StateUtils.findCardList(state, card);
            source.moveCardTo(card, effect.player.discard);
          });
          effect.damage = cards.length * 60;
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.SHIVERING_CHILL_MARKER, this);
      return state;
    }

    return state;
  }
}
