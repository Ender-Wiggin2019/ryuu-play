import {
  CardType,
  ChooseCardsPrompt,
  Effect,
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
      id: 11049,
      yorenCode: 'P281',
      cardType: '1',
      nameSamePokemonId: 370,
      details: {
        id: 11049,
        evolveText: '1阶进化',
        cardName: '奇鲁莉安',
        regulationMarkText: 'F',
        collectionNumber: '030/072',
        rarity: '1',
        rarityText: 'C☆★',
        hp: 80,
        attribute: '5',
        yorenCode: 'P281',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '1',
        cardFeatureItemList: [
          {
            featureName: '精炼',
            featureDesc: '在自己的回合，如果将自己的1张手牌放于弃牌区的话，则可使用1次。从自己牌库上方抽取2张卡牌。',
          },
        ],
        abilityItemList: [
          {
            abilityName: '巴掌',
            abilityText: 'none',
            abilityCost: '5,11',
            abilityDamage: '30',
          },
        ],
        pokemonCategory: '感情宝可梦',
        weaknessType: '8',
        weaknessFormula: '×2',
        retreatCost: 2,
        pokedexCode: '281',
        pokedexText: '当训练家高兴的时候，奇鲁莉安会充满能量，开心地转着圈跳舞。',
        height: 0.8,
        weight: 20.2,
        illustratorName: ['Yukiko Baba'],
        commodityList: [
          {
            commodityName: '强化包 胜象星引',
            commodityCode: 'CS6.5C',
          },
        ],
        collectionFlag: 0,
        special_shiny_type: 1,
      },
      name: '奇鲁莉安',
      image: 'img\\222\\48.png',
      hash: '7d2005169f75f5447806814a706d0697',
    },
    collection: {},
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/222/48.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Ralts';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 80;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: 'Refinement',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'You must discard a card from your hand in order to use this Ability. ' +
        'Once during your turn, you may draw 2 cards.',
    },
  ];

  public attacks = [
    {
      name: 'Slap',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = 'Kirlia';

  public fullName: string = 'Kirlia CS6.5C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.hand.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.hand,
          {},
          { allowCancel: true, min: 1, max: 1 }
        ),
        cards => {
          cards = cards || [];
          if (cards.length === 0) {
            return;
          }

          player.hand.moveCardsTo(cards, player.discard);
          player.deck.moveTo(player.hand, 2);
        }
      );
    }

    return state;
  }
}
