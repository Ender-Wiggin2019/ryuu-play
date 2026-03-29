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
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function hasLabel(card: PokemonCard | undefined, label: string): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((item: unknown) => item === label);
}

function isFuturePokemon(card: PokemonCard | undefined): boolean {
  return hasLabel(card, '未来');
}

export class Miraidon extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16319,
      name: '密勒顿',
      yorenCode: 'P1008',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '153/204',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        specialCardLabel: '未来',
        hp: 110,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/416.png',
      ruleLines: [],
      attacks: [
        {
          id: 315,
          name: '巅峰加速',
          text: '选择自己牌库中最多2张基本能量，以任意方式附着于自己的「未来」宝可梦身上。并重洗牌库。',
          cost: ['无色'],
          damage: '40',
        },
        {
          id: 316,
          name: '电火花攻击',
          text: '',
          cost: ['雷', '雷', '超'],
          damage: '160',
        },
      ],
      features: [],
      illustratorNames: ['GOSSAN'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '1008',
      pokedexText: '它似乎就是古老的书籍中提及的铁大蛇。传说它曾用雷电将大地变为灰烬。',
      height: 3.5,
      weight: 240,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/416.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp = 110;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '巅峰加速',
      cost: [CardType.COLORLESS],
      damage: '40',
      text: '选择自己牌库中最多2张基本能量，以任意方式附着于自己的「未来」宝可梦身上。并重洗牌库。',
    },
    {
      name: '电火花攻击',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.PSYCHIC],
      damage: '160',
      text: '',
    },
  ];

  public set = 'set_h';

  public name = '密勒顿';

  public fullName = '密勒顿 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
      const basicEnergyCount = player.deck.cards.filter(card => {
        return card instanceof EnergyCard && card.energyType === EnergyType.BASIC;
      }).length;

      if (basicEnergyCount === 0) {
        return state;
      }

      const blockedTo: CardTarget[] = [];
      if (!isFuturePokemon(player.active.getPokemonCard())) {
        blockedTo.push({ player: playerType, slot: SlotType.ACTIVE, index: 0 });
      }

      player.bench.forEach((bench, index) => {
        const pokemonCard = bench.getPokemonCard();
        if (pokemonCard === undefined || !isFuturePokemon(pokemonCard)) {
          blockedTo.push({ player: playerType, slot: SlotType.BENCH, index });
        }
      });

      const hasFutureTarget = blockedTo.length < 6;
      if (!hasFutureTarget) {
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
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
          { allowCancel: true, min: 0, max: Math.min(2, basicEnergyCount), blockedTo }
        ),
        result => {
          const transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.deck.moveCardTo(transfer.card, target.energies);
          }
          player.deck.moveToBottom(player.deck);
        }
      );
    }

    return state;
  }
}
