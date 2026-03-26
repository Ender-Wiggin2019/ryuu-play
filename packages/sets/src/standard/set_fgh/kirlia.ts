import {
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

export class Kirlia extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10964,
      name: '奇鲁莉安',
      yorenCode: 'P281',
      cardType: '1',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '030/072',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 80,
        evolveText: '1阶进化',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: '/api/v1/cards/10964/image',
      ruleLines: [],
      attacks: [
        {
          id: 8143,
          name: '巴掌',
          text: '',
          cost: ['超', '无色'],
          damage: '30',
        },
      ],
      features: [
        {
          id: 1078,
          name: '精炼',
          text: '在自己的回合，如果将自己的1张手牌放于弃牌区的话，则可使用1次。从自己牌库上方抽取2张卡牌。',
        },
      ],
      illustratorNames: ['Yukiko Baba'],
      pokemonCategory: '感情宝可梦',
      pokedexCode: '281',
      pokedexText: '当训练家高兴的时候，奇鲁莉安会充满能量，开心地转着圈跳舞。',
      height: 0.8,
      weight: 20.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
    },
    image_url: 'http://localhost:3000/api/v1/cards/10964/image',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '拉鲁拉丝';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 80;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '巴掌',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '奇鲁莉安';

  public fullName: string = '奇鲁莉安 CS6.5C';

  public readonly REFINEMENT_MARKER = 'REFINEMENT_MARKER';

  public powers = [
    {
      name: '精炼',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合，如果将自己的1张手牌放于弃牌区的话，则可使用1次。从自己牌库上方抽取2张卡牌。',
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.REFINEMENT_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.hand.cards.length === 0 || player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.hand,
          {},
          { min: 1, max: 1, allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          player.hand.moveCardsTo(cards, player.discard);
          player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));
          player.marker.addMarker(this.REFINEMENT_MARKER, this);
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.REFINEMENT_MARKER, this);
    }

    return state;
  }
}
